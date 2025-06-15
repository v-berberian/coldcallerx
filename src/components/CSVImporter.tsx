
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

  const parseCSV = (text: string): Lead[] => {
    console.log('Raw CSV text (first 200 chars):', text.substring(0, 200));
    const lines = text.split('\n').filter(line => line.trim());
    console.log('Total lines after filtering:', lines.length);
    
    if (lines.length < 2) {
      console.log('Not enough lines in CSV');
      return [];
    }
    
    // Log the header to understand structure
    console.log('Header line:', JSON.stringify(lines[0]));
    
    const leads: Lead[] = [];
    
    // Skip header row and process data
    // Expected column order: A=Company, B=Name, C=Phone, D=Additional Phones, E=Email
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      console.log(`Processing line ${i}:`, JSON.stringify(line));
      
      if (line) {
        // More robust CSV parsing - handle quoted values properly
        const columns: string[] = [];
        let currentColumn = '';
        let inQuotes = false;
        
        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            columns.push(currentColumn.trim());
            currentColumn = '';
          } else {
            currentColumn += char;
          }
        }
        columns.push(currentColumn.trim()); // Add the last column
        
        console.log(`Line ${i} parsed columns:`, columns);
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
          const cleanedEmail = cleanCsvValue(email);
          console.log('Final cleaned email for lead:', JSON.stringify(cleanedEmail));
          
          const lead: Lead = {
            name: name.trim(),
            phone: formatPhoneNumber(phone.trim()),
            company: cleanCsvValue(company),
            email: cleanedEmail,
            additionalPhones: cleanCsvValue(additionalPhones)
          };
          
          console.log('Created lead object:', lead);
          leads.push(lead);
        } else {
          console.log(`Skipping line ${i} - missing required fields (name: "${name}", phone: "${phone}")`);
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
