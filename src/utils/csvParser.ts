
import { Lead } from '@/types/lead';
import { formatPhoneNumber } from '@/utils/phoneUtils';
import { cleanCsvValue, cleanEmailValue } from './csvUtils';

export const parseCSV = (text: string): Lead[] => {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  const normalizedText = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < normalizedText.length; i++) {
      const char = normalizedText[i];
      
      if (inQuotes) {
          if (char === '"') {
              if (i + 1 < normalizedText.length && normalizedText[i + 1] === '"') {
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
          } else if (char === '\n') {
              currentRow.push(currentField);
              if (currentRow.length > 1 || currentRow.some(field => field.trim() !== '')) {
                  rows.push(currentRow);
              }
              currentRow = [];
              currentField = '';
          } else {
              currentField += char;
          }
      }
  }
  
  currentRow.push(currentField);
  if (currentRow.length > 1 || currentRow.some(field => field.trim() !== '')) {
      rows.push(currentRow);
  }
  
  if (rows.length < 2) {
    return [];
  }
  
  const header = rows[0].map(h => h.trim());
  console.log('Header line:', JSON.stringify(header));
  
  const leads: Lead[] = [];
  
  for (let i = 1; i < rows.length; i++) {
    const columns = rows[i];
    
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
  
  return leads;
};
