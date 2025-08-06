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
      
      return { usage, totalSize };
    } catch (error) {
      return { usage: {}, totalSize: 0 };
    }
  };

  // New function to intelligently clear largest lists
  const clearLargestLists = async (requiredSpace: number): Promise<boolean> => {
    try {
      const csvFiles = await appStorage.getCSVFiles();
      const fileSizes: Array<{id: string, name: string, size: number}> = [];
      
      // Calculate size of each CSV file
      for (const file of csvFiles) {
        try {
          const leadsData = await appStorage.getCSVLeadsData(file.id);
          const size = JSON.stringify(leadsData).length;
          fileSizes.push({
            id: file.id,
            name: file.name,
            size: size
          });
        } catch (error) {
          // Skip files that can't be read
          console.warn(`Could not read file ${file.name}:`, error);
        }
      }
      
      // Sort by size (largest first)
      fileSizes.sort((a, b) => b.size - a.size);
      
      let freedSpace = 0;
      const filesToDelete: string[] = [];
      
      // Calculate which files would need to be deleted
      for (const file of fileSizes) {
        if (freedSpace >= requiredSpace) break;
        
        filesToDelete.push(file.id);
        freedSpace += file.size;
      }
      
      if (filesToDelete.length === 0) {
        return false; // No files to delete
      }
      
      // Show user confirmation with details
      const totalSizeMB = (freedSpace / 1024 / 1024).toFixed(2);
      const requiredSizeMB = (requiredSpace / 1024 / 1024).toFixed(2);
      const fileNames = filesToDelete.map(id => {
        const file = fileSizes.find(f => f.id === id);
        return file?.name || 'Unknown file';
      }).join(', ');
      
      const shouldDelete = confirm(
        `Storage is full. To import this file (${requiredSizeMB}MB), we need to delete the largest existing lists:\n\n` +
        `Files to delete: ${fileNames}\n` +
        `Space to free: ${totalSizeMB}MB\n\n` +
        `Would you like to delete these lists and import the new file?`
      );
      
      if (shouldDelete) {
        // Delete the files
        for (const fileId of filesToDelete) {
          try {
            await appStorage.removeAllCSVData(fileId);
          } catch (error) {
            console.error(`Error deleting file ${fileId}:`, error);
          }
        }
        
        // Update CSV files list
        const updatedFiles = csvFiles.filter(file => !filesToDelete.includes(file.id));
        await appStorage.saveCSVFiles(updatedFiles);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error clearing largest lists:', error);
      return false;
    }
  };

  // New function to check storage capacity and show warning
  const checkStorageAndWarn = (leadsDataSize: number, totalSize: number): boolean => {
    const estimatedNewUsage = totalSize + leadsDataSize;
    const maxCapacity = 50 * 1024 * 1024; // 50MB
    
    if (estimatedNewUsage > maxCapacity) {
      const currentUsageMB = (totalSize / 1024 / 1024).toFixed(2);
      const requiredSizeMB = (leadsDataSize / 1024 / 1024).toFixed(2);
      const availableSpaceMB = ((maxCapacity - totalSize) / 1024 / 1024).toFixed(2);
      
      const message = `Storage Warning:\n\n` +
        `Current usage: ${currentUsageMB}MB\n` +
        `Available space: ${availableSpaceMB}MB\n` +
        `File requires: ${requiredSizeMB}MB\n\n` +
        `This file is too large for the available storage space. ` +
        `Please delete some existing lists or try a smaller file.`;
      
      alert(message);
      return false;
    }
    
    return true;
  };

  // New function to save large datasets in chunks
  const saveLeadsInChunks = async (csvId: string, leads: Lead[]): Promise<boolean> => {
    const CHUNK_SIZE = 1000; // Save 1000 leads per chunk
    const totalLeads = leads.length;
    
    try {
      // Save metadata about chunking
      const metadata = {
        isChunked: true,
        chunksCount: Math.ceil(totalLeads / CHUNK_SIZE),
        totalLeads: totalLeads,
        chunkSize: CHUNK_SIZE
      };
      
      await appStorage.saveCSVMetadata(csvId, metadata);
      
      // Save leads in chunks
      for (let i = 0; i < totalLeads; i += CHUNK_SIZE) {
        const chunk = leads.slice(i, i + CHUNK_SIZE);
        const chunkKey = `coldcaller-csv-${csvId}-chunk-${Math.floor(i / CHUNK_SIZE)}`;
        
        try {
          await appStorage.saveChunkedData(csvId, chunkKey, chunk);
        } catch (error) {
          console.error(`Error saving chunk ${Math.floor(i / CHUNK_SIZE)}:`, error);
          // If chunk save fails, throw the error to be handled by the caller
          throw error;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error saving leads in chunks:', error);
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
      console.log('🔄 Starting file processing:', file.name, 'Size:', fileSizeMB.toFixed(2), 'MB');
      
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          console.log('📖 File read successfully, parsing content...');
          const text = e.target?.result as string;
          if (!text) {
            console.error('❌ File is empty or could not be read');
            toast.error('File is empty or could not be read.');
            setLoading(false);
            return;
          }
          
          console.log('📊 File content length:', text.length, 'characters');
          console.log('📄 First 200 characters:', text.substring(0, 200));
          
          const MAX_LEADS_PER_LIST = 10000;
          let leads = await parseCSV(text);
          
          console.log('✅ CSV parsed successfully, leads found:', leads.length);

          // Cap the number of leads to MAX_LEADS_PER_LIST
          if (leads.length > MAX_LEADS_PER_LIST) {
            const originalCount = leads.length;
            leads = leads.slice(0, MAX_LEADS_PER_LIST);
            toast.info(`List exceeded ${MAX_LEADS_PER_LIST.toLocaleString()} rows. Imported first ${MAX_LEADS_PER_LIST.toLocaleString()} leads; skipped ${(originalCount - MAX_LEADS_PER_LIST).toLocaleString()}.`);
          }
          
          if (leads.length === 0) {
            console.error('❌ No valid leads found in CSV');
            toast.error('No valid leads found in the CSV file. Please check the file format.');
            setLoading(false);
            return;
          }
          
          const fileName = file.name.replace('.csv', '');
          const csvId = generateCSVId(fileName);
          
          console.log('🆔 Generated CSV ID:', csvId);
          
          // Check if we have enough storage space
          const leadsDataSize = JSON.stringify(leads).length;
          const { totalSize } = analyzeLocalStorageUsage();
          const estimatedNewUsage = totalSize + leadsDataSize;
          
          console.log(`📊 Storage analysis:`);
          console.log(`   File: ${file.name}, Size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
          console.log(`   File content length: ${text.length} characters`);
          console.log(`   Parsed ${leads.length} leads`);
          console.log(`   Leads data size: ${(leadsDataSize / 1024 / 1024).toFixed(2)}MB`);
          console.log(`   Current localStorage usage: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
          console.log(`   Estimated new usage: ${(estimatedNewUsage / 1024 / 1024).toFixed(2)}MB`);
          console.log(`   Max capacity: 50.00MB`);
          
          // Check storage capacity and warn user if insufficient
          if (!checkStorageAndWarn(leadsDataSize, totalSize)) {
            console.log('❌ Storage check failed');
            setLoading(false);
            return;
          }
          
          // If file is large (>10MB estimated), use chunking
          const shouldUseChunking = leadsDataSize > 10 * 1024 * 1024; // chunking only if data very large
          
          console.log('💾 Saving leads data...');
          
          if (shouldUseChunking) {
            console.log('📦 Using chunked storage for large file');
            const success = await saveLeadsInChunks(csvId, leads);
            
            if (!success) {
              console.error('❌ Failed to save large file with chunking');
              toast.error('Failed to save large file. Please try clearing some data or use a smaller file.');
              setLoading(false);
              return;
            }
          } else {
            // Try normal storage first
            try {
              console.log('💾 Saving to normal storage...');
              await appStorage.saveCSVLeadsData(csvId, leads);
              console.log('✅ Successfully saved to normal storage');
            } catch (storageError) {
              console.error('❌ Error saving to storage:', storageError);
              
              if (storageError instanceof Error && storageError.name === 'QuotaExceededError') {
                // Try chunking as fallback
                console.log('🔄 Storage quota exceeded, trying chunked storage');
                const success = await saveLeadsInChunks(csvId, leads);
                
                if (!success) {
                  console.error('❌ Failed to save with chunking fallback');
                  toast.error('Storage is full. Please delete some existing lists or try a smaller file.');
                  setLoading(false);
                  return;
                }
              } else {
                throw storageError;
              }
            }
          }
          
          try {
            console.log('📝 Saving file metadata...');
            // Save file metadata
            const existingFiles = await appStorage.getCSVFiles();
            const newFileInfo = {
              id: csvId,
              name: fileName,
              fileName: file.name,
              totalLeads: leads.length,
              isChunked: shouldUseChunking
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
            
            console.log('✅ File metadata saved successfully');
            
            onLeadsImported(leads, fileName, csvId);
            toast.success(`${leads.length} leads imported successfully!`, {
              duration: 1000
            });
            
            console.log('🎉 Import completed successfully!');
          } catch (metadataError) {
            console.error('❌ Error saving file metadata:', metadataError);
            toast.error('File imported but metadata could not be saved.');
          }
        } catch (parseError) {
          console.error('❌ Error parsing CSV:', parseError);
          console.error('Parse error details:', {
            name: parseError.name,
            message: parseError.message,
            stack: parseError.stack
          });
          toast.error('Failed to parse CSV file. Please check the file content and format.');
        } finally {
          setLoading(false);
        }
      };
      
      reader.onerror = (error) => {
        console.error('❌ FileReader error:', error);
        toast.error('Error reading file');
        setLoading(false);
      };
      
      console.log('📖 Starting file read...');
      reader.readAsText(file);
    } catch (error) {
      console.error('❌ Error in handleFileProcess:', error);
      console.error('Process error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      toast.error('Error processing file');
      setLoading(false);
    }
  };

  return {
    loading,
    handleFileProcess
  };
};
