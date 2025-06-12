
import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface Lead {
  name: string;
  phone: string;
  called?: number;
  lastCalled?: string;
}

interface CSVImporterProps {
  onLeadsImported: (leads: Lead[], fileName: string) => void;
  showAsButton?: boolean;
  buttonText?: string;
  buttonIcon?: React.ReactNode;
}

const CSVImporter: React.FC<CSVImporterProps> = ({ 
  onLeadsImported, 
  showAsButton = false,
  buttonText = "Import CSV",
  buttonIcon = <Upload className="h-5 w-5" />
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n');
      const leads: Lead[] = [];

      // Skip header row and process data
      for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(',').map(col => col.trim().replace(/"/g, ''));
        
        if (columns.length >= 2 && columns[0] && columns[1]) {
          leads.push({
            name: columns[0],
            phone: columns[1],
            called: 0,
            lastCalled: undefined
          });
        }
      }

      if (leads.length > 0) {
        const fileName = file.name.replace('.csv', '');
        onLeadsImported(leads, fileName);
        
        toast({
          title: "CSV Imported",
          description: `Successfully imported ${leads.length} leads`,
        });
      } else {
        toast({
          title: "Import Failed",
          description: "No valid lead data found in the CSV file",
          variant: "destructive",
        });
      }
    };

    reader.readAsText(file);
    
    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  if (showAsButton) {
    return (
      <>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
        />
        <Button 
          onClick={handleClick}
          variant="outline"
          className="w-full flex items-center space-x-2"
        >
          {buttonIcon}
          <span>{buttonText}</span>
        </Button>
      </>
    );
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="hidden"
      />
      <button
        onClick={handleClick}
        className="p-2 rounded-lg transition-none text-muted-foreground hover:text-foreground"
        title="Import CSV"
      >
        {buttonIcon}
      </button>
    </>
  );
};

export default CSVImporter;
