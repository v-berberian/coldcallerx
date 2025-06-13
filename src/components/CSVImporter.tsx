
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Phone } from 'lucide-react';

interface Lead {
  name: string;
  phone: string;
}

interface CSVImporterProps {
  onLeadsImported: (leads: Lead[], fileName: string) => void;
}

const CSVImporter: React.FC<CSVImporterProps> = ({ onLeadsImported }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string>('');
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

  const handleFileProcess = (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Please select a valid CSV file');
      return;
    }

    setError('');
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

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  return (
    <button 
      onClick={handleButtonClick} 
      className="text-sm font-medium px-3 py-1 rounded transition-all duration-200 text-muted-foreground hover:text-foreground"
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
