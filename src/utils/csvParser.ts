import { Lead } from '@/types/lead';
import { formatPhoneNumber } from '@/utils/phoneUtils';
import { cleanCsvValue, cleanEmailValue } from './csvUtils';

// Maximum number of leads to process to prevent memory issues
const MAX_LEADS = 50000;

export const parseCSV = async (text: string): Promise<Lead[]> => {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;
  let rowCount = 0;

  // Normalize line endings and remove BOM
  const normalizedText = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Process the entire text character by character to handle quoted fields with line breaks
  for (let i = 0; i < normalizedText.length; i++) {
    const char = normalizedText[i];
    
    if (inQuotes) {
      if (char === '"') {
        // Check for escaped quotes
        if (i + 1 < normalizedText.length && normalizedText[i + 1] === '"') {
          currentField += '"';
          i++; // Skip the next quote
        } else {
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField);
        currentField = '';
      } else if (char === '\n') {
        // End of row
        currentRow.push(currentField);
        currentField = '';
        
        if (currentRow.length > 1 || currentRow.some(field => field.trim() !== '')) {
          rows.push([...currentRow]);
          rowCount++;
          
          if (rowCount >= MAX_LEADS + 1) { // +1 for header
            console.warn(`CSV file truncated at ${MAX_LEADS} leads for performance`);
            break;
          }
        }
        
        currentRow = [];
      } else {
        currentField += char;
      }
    }
  }
  
  // Handle the last field and row
  if (currentField !== '' || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.length > 1 || currentRow.some(field => field.trim() !== '')) {
      rows.push([...currentRow]);
    }
  }
  
  if (rows.length < 2) {
    return [];
  }
  
  const header = rows[0].map(h => h.trim());
  
  const leads: Lead[] = [];
  
  // Process leads in batches for better performance
  const batchSize = 1000;
  for (let i = 1; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    
    for (const columns of batch) {
      if (columns.length > 0 && columns.some(c => c.trim() !== '')) {
        while (columns.length < 6) {
          columns.push('');
        }
        
        const [company, name, phone, additionalPhones, email, revenue] = columns;
        
        if (name && name.trim() && phone && phone.trim()) {
          const cleanedEmail = cleanEmailValue(email);
          
          // Better handling of additional phones with line breaks
          let processedAdditionalPhones = additionalPhones;
          if (additionalPhones) {
            // First, handle quoted fields that might contain line breaks
            // Remove outer quotes if present and handle internal line breaks
            let unquoted = additionalPhones;
            if (additionalPhones.startsWith('"') && additionalPhones.endsWith('"')) {
              unquoted = additionalPhones.slice(1, -1);
            }
            
            // Replace all types of line breaks with spaces, including multiple consecutive ones
            processedAdditionalPhones = unquoted
              .replace(/\r\n/g, ' ')  // Windows line breaks
              .replace(/\r/g, ' ')    // Mac line breaks  
              .replace(/\n/g, ' ')    // Unix line breaks
              .replace(/\s+/g, ' ')   // Replace multiple spaces with single space
              .trim();
          }
          
          const lead: Lead = {
            name: name.trim(),
            phone: formatPhoneNumber(phone.trim()),
            company: cleanCsvValue(company),
            email: cleanedEmail,
            additionalPhones: cleanCsvValue(processedAdditionalPhones),
            revenue: cleanCsvValue(revenue)
          };
          
          leads.push(lead);
        }
      }
    }
    
    // Yield control to prevent blocking the UI for very large files
    if (i % (batchSize * 5) === 0 && i > batchSize * 5) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  
  return leads;
};
