import { useState } from 'react';
import { toast } from 'sonner';
import { Lead } from '@/types/lead';
import { parseCSV } from '@/utils/csvParser';

interface UseCsvImporterProps {
  onLeadsImported: (leads: Lead[], fileName: string) => void;
}

export const useCsvImporter = ({ onLeadsImported }: UseCsvImporterProps) => {
  const [loading, setLoading] = useState(false);

  const handleFileProcess = async (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Please select a valid CSV file');
      return;
    }

    // Check file size for large files
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 50) {
      toast.info('Large file detected. Processing may take a moment...');
    }

    setLoading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const text = e.target?.result as string;
          if (!text) {
            toast.error('File is empty or could not be read.');
            return;
          }
          
          const leads = await parseCSV(text);
          if (leads.length === 0) {
            toast.error('No valid leads found in the CSV file. Please check the file format.');
            return;
          }
          
          const fileName = file.name.replace('.csv', '');
          onLeadsImported(leads, fileName);
          toast.success(`${leads.length} leads imported successfully!`, {
            duration: 1000
          });
        } catch (parseError) {
          console.error('Error parsing CSV:', parseError);
          toast.error('Failed to parse CSV file. Please check the file content and format.');
        } finally {
          setLoading(false);
        }
      };
      reader.onerror = () => {
        toast.error('Error reading file');
        setLoading(false);
      };
      reader.readAsText(file);
    } catch (error) {
      toast.error('Error processing file');
      console.error('File processing error:', error);
      setLoading(false);
    }
  };

  return { loading, handleFileProcess };
};
