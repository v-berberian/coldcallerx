
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

  const cleanCsvValue = (value: string): string | undefined => {
    console.log('cleanCsvValue input:', JSON.stringify(value));
    
    if (!value) {
      console.log('cleanCsvValue: value is falsy, returning undefined');
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
    console.log('Raw CSV text:', text);
    const lines = text.split('\n');
    console.log('Total lines:', lines.length);
    const leads: Lead[] = [];
    
    // Skip header row and process data
    // Column order: A=Company, B=Name, C=Phone, D=Additional Phones, E=Email
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      console.log(`Line ${i}:`, JSON.stringify(line));
      
      if (line) {
        const columns = line.split(',').map(cell => cell.trim().replace(/"/g, ''));
        console.log(`Line ${i} columns:`, columns);
        
        const [company, name, phone, additionalPhones, email] = columns;
        console.log(`Parsed fields - Company: ${JSON.stringify(company)}, Name: ${JSON.stringify(name)}, Phone: ${JSON.stringify(phone)}, Additional: ${JSON.stringify(additionalPhones)}, Email: ${JSON.stringify(email)}`);
        
        if (name && phone) {
          const cleanedEmail = cleanCsvValue(email);
          console.log('Final cleaned email:', JSON.stringify(cleanedEmail));
          
          const lead = {
            name: name.trim(),
            phone: formatPhoneNumber(phone),
            company: cleanCsvValue(company),
            email: cleanedEmail,
            additionalPhones: cleanCsvValue(additionalPhones)
          };
          
          console.log('Created lead:', lead);
          leads.push(lead);
        }
      }
    }
    
    console.log('Final leads array:', leads);
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
