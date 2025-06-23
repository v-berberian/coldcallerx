import { useState } from 'react';
import { toast } from 'sonner';
import { Lead } from '@/types/lead';
import { parseCSV } from '@/utils/csvParser';
import { appStorage } from '@/utils/storage';

interface UseCsvImporterProps {
  onLeadsImported: (leads: Lead[], fileName: string, csvId: string) => void;
}

export const useCsvImporter = ({ onLeadsImported }: UseCsvImporterProps) => {
  const [loading, setLoading] = useState(false);

  const generateCSVId = (fileName: string): string => {
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9]/g, '_');
    return `${sanitizedFileName}_${timestamp}`;
  };

  const checkStorageCapacity = (fileSize: number): boolean => {
    try {
      const currentUsage = JSON.stringify(localStorage).length;
      const estimatedNewUsage = currentUsage + fileSize;
      const maxCapacity = 50 * 1024 * 1024; // 50MB for iPhone/iOS Safari
      
      return estimatedNewUsage < maxCapacity;
    } catch (error) {
      return true; // Assume it's okay if we can't check
    }
  };

  const analyzeLocalStorageUsage = () => {
    try {
      const usage = {};
      let totalSize = 0;
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          const size = value ? value.length : 0;
          usage[key] = {
            size: size,
            sizeMB: (size / 1024 / 1024).toFixed(2)
          };
          totalSize += size;
        }
      }
      
      return usage;
    } catch (error) {
      return {};
    }
  };

  const clearAllAppData = () => {
    try {
      // Clear all app-related localStorage data
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('coldcaller') || key.startsWith('CapacitorStorage'))) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      return true;
    } catch (error) {
      return false;
    }
  };

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
          const csvId = generateCSVId(fileName);
          
          // Check if we have enough storage space
          const leadsDataSize = JSON.stringify(leads).length;
          if (!checkStorageCapacity(leadsDataSize)) {
            // Analyze current storage usage
            const usage = analyzeLocalStorageUsage();
            
            // Check if clearing CSV data would help
            const csvFiles = await appStorage.getCSVFiles();
            let csvDataSize = 0;
            
            for (const file of csvFiles) {
              try {
                const leadsData = await appStorage.getCSVLeadsData(file.id);
                csvDataSize += JSON.stringify(leadsData).length;
              } catch (error) {
                // Ignore errors checking file
              }
            }
            
            if (csvDataSize > 0) {
              const shouldClear = confirm(
                `Storage is full (${(JSON.stringify(localStorage).length / 1024 / 1024).toFixed(2)}MB used). ` +
                `Clearing existing CSV data (${(csvDataSize / 1024 / 1024).toFixed(2)}MB) would free up space. ` +
                `Would you like to clear existing data and import this file?`
              );
              
              if (shouldClear) {
                clearAllAppData();
                // Continue with the import
              } else {
                toast.error('Import cancelled. Please clear some data or try a smaller file.');
                setLoading(false);
                return;
              }
            } else {
              // If there's no CSV data to clear, automatically clear all app data
              // since there are no usable lists anyway
              clearAllAppData();
              // Continue with the import
            }
          }
          
          try {
            // First, save the leads data using appStorage
            await appStorage.saveCSVLeadsData(csvId, leads);
            
            // Only after successful save, add the file to the CSV files list
            const existingFiles = await appStorage.getCSVFiles();
            const newFileInfo = {
              id: csvId,
              name: fileName,
              fileName: file.name,
              totalLeads: leads.length
            };
            
            // Check if file with same name already exists
            const existingFileIndex = existingFiles.findIndex(f => f.name === fileName);
            if (existingFileIndex >= 0) {
              // Update existing file info
              existingFiles[existingFileIndex] = newFileInfo;
            } else {
              // Add new file
              existingFiles.push(newFileInfo);
            }
            
            await appStorage.saveCSVFiles(existingFiles);
            await appStorage.saveCurrentCSVId(csvId);
            
            onLeadsImported(leads, fileName, csvId);
            toast.success(`${leads.length} leads imported successfully!`, {
              duration: 1000
            });
          } catch (storageError) {
            console.error('Error saving to storage:', storageError);
            toast.error('Failed to save leads to storage. The file may be too large.');
          }
        } catch (parseError) {
          console.error('Error parsing CSV:', parseError);
          toast.error('Failed to parse CSV file. Please check the file content and format.');
        } finally {
          setLoading(false);
        }
      };
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        toast.error('Error reading file');
        setLoading(false);
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('File processing error:', error);
      toast.error('Error processing file');
      setLoading(false);
    }
  };

  return { loading, handleFileProcess };
};
