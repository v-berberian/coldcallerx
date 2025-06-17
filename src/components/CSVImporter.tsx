import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useCsvImporter } from '@/hooks/useCsvImporter';
import { Lead } from '@/types/lead';

interface CSVImporterProps {
  onLeadsImported: (leads: Lead[], fileName: string) => void;
  buttonClassName?: string;
  iconClassName?: string;
}

const CSVImporter: React.FC<CSVImporterProps> = ({ onLeadsImported, buttonClassName = '', iconClassName = '' }) => {
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
      onClick={handleButtonClick} 
      disabled={loading}
      className={`rounded-full ${buttonClassName}`}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <Upload className={iconClassName} />
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
