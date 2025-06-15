
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useCsvImporter } from '@/hooks/useCsvImporter';
import { Lead } from '@/types/lead';

interface CSVImporterProps {
  onLeadsImported: (leads: Lead[], fileName: string) => void;
}

const CSVImporter: React.FC<CSVImporterProps> = ({ onLeadsImported }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { loading, handleFileProcess } = useCsvImporter({ onLeadsImported });

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
