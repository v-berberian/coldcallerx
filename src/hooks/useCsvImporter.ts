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

  const checkLocalStorageCapacity = (dataSize: number): boolean => {
    try {
      // Estimate localStorage usage
      const currentUsage = JSON.stringify(localStorage).length;
      const estimatedNewUsage = currentUsage + dataSize;
      const maxCapacity = 50 * 1024 * 1024; // 50MB for iPhone/iOS Safari
      
      console.log(`Current localStorage usage: ${(currentUsage / 1024 / 1024).toFixed(2)}MB`);
      console.log(`Estimated new usage: ${(estimatedNewUsage / 1024 / 1024).toFixed(2)}MB`);
      console.log(`Max capacity: ${(maxCapacity / 1024 / 1024).toFixed(2)}MB`);
      
      return estimatedNewUsage < maxCapacity;
    } catch (error) {
      console.error('Error checking localStorage capacity:', error);
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
      
      console.log('localStorage usage breakdown:', usage);
      console.log(`Total localStorage size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
      
      return usage;
    } catch (error) {
      console.error('Error analyzing localStorage:', error);
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
      
      console.log(`Cleared ${keysToRemove.length} app-related keys from localStorage`);
      return true;
    } catch (error) {
      console.error('Error clearing app data:', error);
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
    console.log(`File: ${file.name}, Size: ${fileSizeMB.toFixed(2)}MB`);
    
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
          
          console.log(`File content length: ${text.length} characters`);
          console.log(`First 500 characters:`, text.substring(0, 500));
          
          const leads = await parseCSV(text);
          console.log(`Parsed ${leads.length} leads`);
          
          if (leads.length === 0) {
            toast.error('No valid leads found in the CSV file. Please check the file format.');
            return;
          }
          
          const fileName = file.name.replace('.csv', '');
          const csvId = generateCSVId(fileName);
          
          console.log(`Saving CSV file info: ${fileName} with ID: ${csvId}`);
          
          // Check if we have enough storage space
          const leadsDataSize = JSON.stringify(leads).length;
          if (!checkLocalStorageCapacity(leadsDataSize)) {
            // Analyze current storage usage
            const usage = analyzeLocalStorageUsage();
            
            // Check if clearing CSV data would help
            const csvFilesStr = localStorage.getItem('coldcaller-csv-files');
            const csvFiles = csvFilesStr ? JSON.parse(csvFilesStr) : [];
            let csvDataSize = 0;
            
            csvFiles.forEach(file => {
              const leadsKey = `coldcaller-csv-${file.id}-leads`;
              const leadsData = localStorage.getItem(leadsKey);
              if (leadsData) {
                csvDataSize += leadsData.length;
              }
            });
            
            console.log(`CSV data size: ${(csvDataSize / 1024 / 1024).toFixed(2)}MB`);
            
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
              console.log('No CSV data found, automatically clearing all app data to free up storage');
              clearAllAppData();
              // Continue with the import
            }
          }
          
          try {
            // First, save the leads data to localStorage
            const key = `coldcaller-csv-${csvId}-leads`;
            console.log(`Saving leads to localStorage with key: ${key}`);
            localStorage.setItem(key, JSON.stringify(leads));
            console.log(`Successfully saved ${leads.length} leads to localStorage`);
            
            // Only after successful save, add the file to the CSV files list
            const existingFilesStr = localStorage.getItem('coldcaller-csv-files');
            const existingFiles = existingFilesStr ? JSON.parse(existingFilesStr) : [];
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
            
            localStorage.setItem('coldcaller-csv-files', JSON.stringify(existingFiles));
            localStorage.setItem('coldcaller-current-csv-id', csvId);
            
            onLeadsImported(leads, fileName, csvId);
            toast.success(`${leads.length} leads imported successfully!`, {
              duration: 1000
            });
          } catch (storageError) {
            console.error('Error saving to localStorage:', storageError);
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
