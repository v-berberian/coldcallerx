
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Phone } from 'lucide-react';

interface Lead {
  name: string;
  phone: string;
}

interface CSVImporterProps {
  onImport: (leads: Lead[], fileName: string) => void;
}

const CSVImporter: React.FC<CSVImporterProps> = ({ onImport }) => {
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
      onImport(leads, fileName);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-lg">
              <Phone className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-primary">ColdCaller X</CardTitle>
          </div>
          <p className="text-muted-foreground">Import your leads to get started</p>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-300'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <FileText className="mx-auto h-12 w-12 text-blue-500 mb-4" />
            <p className="text-lg font-medium mb-2">Drop CSV file here</p>
            <p className="text-sm text-muted-foreground mb-4">
              File should contain Name and Phone columns
            </p>
            <Button onClick={handleButtonClick} className="cursor-pointer hover:bg-primary/90 active:bg-primary/80 transition-colors">
              <Upload className="mr-2 h-4 w-4" />
              Choose File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="hidden"
            />
            {error && (
              <p className="text-red-500 text-sm mt-4">{error}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CSVImporter;
