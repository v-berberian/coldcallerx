import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface Lead {
  name: string;
  phone: string;
  company?: string;
  email?: string;
  additionalPhones?: string;
}

interface CSVImporterProps {
  onLeadsImported: (leads: Lead[], fileName: string) => void;
}

const CSVImporter: React.FC<CSVImporterProps> = ({ onLeadsImported }) => {
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Format as (xxx) xxx-xxxx
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    
    return phone; // Return original if not 10 digits
  };

  const cleanCsvValue = (value: string | undefined): string | undefined => {
    console.log('cleanCsvValue input:', JSON.stringify(value));
    
    if (!value || typeof value !== 'string') {
      console.log('cleanCsvValue: value is not a valid string, returning undefined');
      return undefined;
    }
    
    const cleaned = value.trim().replace(/"/g, '');
    console.log('cleanCsvValue cleaned:', JSON.stringify(cleaned));
    
    // Check for various "empty" states
    if (cleaned === '' || 
        cleaned.toLowerCase() === 'undefined' || 
        cleaned.toLowerCase() === 'null' || 
        cleaned === 'N/A' || 
        cleaned === '-') {
      console.log('cleanCsvValue: detected empty state, returning undefined');
      return undefined;
    }
    
    console.log('cleanCsvValue returning:', JSON.stringify(cleaned));
    return cleaned;
  };

  // New function specifically for email validation to ensure it's always a string
  const cleanEmailValue = (email: string | undefined): string | undefined => {
    console.log('cleanEmailValue input:', JSON.stringify(email));
    
    if (!email || typeof email !== 'string') {
      console.log('cleanEmailValue: email is not a valid string, returning undefined');
      return undefined;
    }
    
    const cleaned = email.trim().replace(/"/g, '');
    console.log('cleanEmailValue cleaned:', JSON.stringify(cleaned));
    
    // Check for various "empty" states and invalid email patterns
    if (cleaned === '' || 
        cleaned.toLowerCase() === 'undefined' || 
        cleaned.toLowerCase() === 'null' || 
        cleaned === 'N/A' || 
        cleaned === '-' ||
        !cleaned.includes('@')) {
      console.log('cleanEmailValue: detected empty/invalid state, returning undefined');
      return undefined;
    }
    
    console.log('cleanEmailValue returning string:', JSON.stringify(cleaned));
    return cleaned;
  };

  const parseCSV = (text: string): Lead[] => {
    console.log('Raw CSV text (first 200 chars):', text.substring(0, 200));

    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentField = '';
    let inQuotes = false;

    // Normalize line endings and handle BOM
    const normalizedText = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    for (let i = 0; i < normalizedText.length; i++) {
        const char = normalizedText[i];
        
        if (inQuotes) {
            if (char === '"') {
                // Check for escaped quote (two double quotes)
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
    
    // Add the last field and row if they exist
    currentRow.push(currentField);
    if (currentRow.length > 1 || currentRow.some(field => field.trim() !== '')) {
        rows.push(currentRow);
    }
    
    if (rows.length < 2) {
      console.log('Not enough valid rows in CSV');
      return [];
    }
    
    const header = rows[0].map(h => h.trim());
    console.log('Header line:', JSON.stringify(header));
    
    const leads: Lead[] = [];
    
    // Skip header row and process data
    // Expected column order: A=Company, B=Name, C=Phone, D=Additional Phones, E=Email
    for (let i = 1; i < rows.length; i++) {
      const columns = rows[i].map(col => col.trim());
      console.log(`Processing row ${i}:`, JSON.stringify(columns));
      
      if (columns.length > 0 && columns.some(c => c !== '')) {
        console.log(`Row ${i} parsed columns:`, columns);
        console.log(`Column count: ${columns.length}`);
        
        // Ensure we have at least 5 columns (A through E)
        while (columns.length < 5) {
          columns.push('');
        }
        
        const [company, name, phone, additionalPhones, email] = columns;
        console.log(`Extracted values:`, {
          company: JSON.stringify(company),
          name: JSON.stringify(name), 
          phone: JSON.stringify(phone),
          additionalPhones: JSON.stringify(additionalPhones),
          email: JSON.stringify(email)
        });
        
        // Only create lead if we have required fields
        if (name && name.trim() && phone && phone.trim()) {
          // Use the specialized email cleaning function
          const cleanedEmail = cleanEmailValue(email);
          console.log('Final cleaned email for lead (guaranteed string or undefined):', JSON.stringify(cleanedEmail));
          
          // Explicitly ensure we're creating a proper Lead object with string email
          const lead: Lead = {
            name: name.trim(),
            phone: formatPhoneNumber(phone.trim()),
            company: cleanCsvValue(company),
            email: cleanedEmail, // This is guaranteed to be string | undefined
            additionalPhones: cleanCsvValue(additionalPhones?.replace(/\n/g, ' ')) // Join multi-line phones
          };
          
          console.log('Created lead object with email type check:', {
            ...lead,
            emailType: typeof lead.email,
            emailValue: lead.email
          });
          leads.push(lead);
        } else {
          console.log(`Skipping row ${i} - missing required fields (name: "${name}", phone: "${phone}")`);
        }
      }
    }
    
    console.log('Final leads array:', leads);
    console.log('Total leads created:', leads.length);
    return leads;
  };

  const handleFileProcess = async (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Please select a valid CSV file');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Parse CSV content locally
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const leads = parseCSV(text);
        if (leads.length === 0) {
          setError('No valid leads found in the CSV file');
          return;
        }
        const fileName = file.name.replace('.csv', '');
        console.log('About to import leads with email types:', leads.map(l => ({ name: l.name, emailType: typeof l.email, email: l.email })));
        onLeadsImported(leads, fileName);
      };
      reader.onerror = () => {
        setError('Error reading file');
      };
      reader.readAsText(file);
    } catch (error) {
      setError('Error processing file');
      console.error('File processing error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleButtonClick} 
      disabled={loading}
      className="h-8 w-8 rounded-full"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <Upload className="h-4 w-4" />
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleFileChange}
        className="hidden"
      />
    </Button>
  );
};

export default CSVImporter;
