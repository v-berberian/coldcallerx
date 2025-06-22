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

  // Use more efficient string processing for large files
  const lines = normalizedText.split('\n');
  
  for (const line of lines) {
    if (rowCount >= MAX_LEADS + 1) { // +1 for header
      console.warn(`CSV file truncated at ${MAX_LEADS} leads for performance`);
      break;
    }
    
    currentRow = [];
    currentField = '';
    inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (inQuotes) {
        if (char === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') {
            currentField += '"';
            i++;
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
        } else {
          currentField += char;
        }
      }
    }
    
    currentRow.push(currentField);
    
    if (currentRow.length > 1 || currentRow.some(field => field.trim() !== '')) {
      rows.push(currentRow);
      rowCount++;
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
        while (columns.length < 5) {
          columns.push('');
        }
        
        const [company, name, phone, additionalPhones, email] = columns;
        
        if (name && name.trim() && phone && phone.trim()) {
          const cleanedEmail = cleanEmailValue(email);
          
          const lead: Lead = {
            name: name.trim(),
            phone: formatPhoneNumber(phone.trim()),
            company: cleanCsvValue(company),
            email: cleanedEmail,
            additionalPhones: cleanCsvValue(additionalPhones?.replace(/\n/g, ' '))
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
