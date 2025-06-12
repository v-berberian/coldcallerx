
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useCloudLeadsData } from '@/hooks/useCloudLeadsData';

interface Lead {
  name: string;
  phone: string;
}

interface CSVImporterProps {
  onLeadsImported: (leads: Lead[], fileName: string) => void;
}

const CSVImporter: React.FC<CSVImporterProps> = ({ onLeadsImported }) => {
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadCSVFile } = useCloudLeadsData();

  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Format as (xxx) xxx-xxxx
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    
    return phone; // Return original if not 10 digits
  };

  const parseCSV = (text: string): Lead[] => {
    const lines = text.split('\n');
    const leads: Lead[] = [];
    
    // Skip header row and process data
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        const [name, phone] = line.split(',').map(cell => cell.trim().replace(/"/g, ''));
        if (name && phone) {
          leads.push({
            name,
            phone: formatPhoneNumber(phone)
          });
        }
      }
    }
    
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
      // Upload file to Supabase storage
      const uploadPath = await uploadCSVFile(file);
      if (!uploadPath) {
        setError('Failed to upload file to cloud');
        return;
      }

      // Parse CSV content
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
    <button 
      onClick={handleButtonClick} 
      disabled={loading}
      className="text-sm font-medium px-3 py-1 rounded transition-all duration-200 text-muted-foreground hover:text-foreground disabled:opacity-50"
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
    </button>
  );
};

export default CSVImporter;
