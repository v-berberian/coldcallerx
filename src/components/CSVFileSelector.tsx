import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FileText, X, ListTodo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { appStorage } from '@/utils/storage';
import { Lead } from '@/types/lead';
import { useCsvImporter } from '@/hooks/useCsvImporter';

interface CSVFile {
  id: string;
  name: string;
  fileName: string;
  totalLeads: number;
  isChunked?: boolean;
  leadsCount?: number;
}

interface CSVFileSelectorProps {
  currentCSVId: string | null;
  onCSVSelect: (csvId: string, leads: Lead[], fileName: string) => void;
  className?: string;
  refreshTrigger?: number;
  onLeadsImported?: (leads: Lead[], fileName: string, csvId: string) => void;
  onAllListsDeleted?: () => void;
}

const CSVFileSelector: React.FC<CSVFileSelectorProps> = ({ 
  currentCSVId, 
  onCSVSelect, 
  className = '',
  refreshTrigger = 0,
  onLeadsImported,
  onAllListsDeleted
}) => {
  const [csvFiles, setCsvFiles] = useState<CSVFile[]>([]);
  const [currentFile, setCurrentFile] = useState<CSVFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Use the CSV importer hook for handling file processing
  const { loading: importLoading, handleFileProcess } = useCsvImporter({ 
    onLeadsImported: (leads: Lead[], fileName: string, csvId: string) => {
      console.log('🎉 CSV Import callback triggered:', fileName, 'with', leads.length, 'leads');
      // After successful import, reload the CSV files list
      console.log('🔄 Reloading CSV files after import...');
      // Add a small delay to ensure the file is saved before reloading
      setTimeout(() => {
        loadCSVFiles();
      }, 100);
      // Call the parent's onLeadsImported if provided
      if (onLeadsImported) {
        console.log('📤 Calling parent onLeadsImported...');
        onLeadsImported(leads, fileName, csvId);
      }
    }
  });

  useEffect(() => {
    loadCSVFiles();
  }, [refreshTrigger]);

  useEffect(() => {
    if (currentCSVId && csvFiles.length > 0) {
      const file = csvFiles.find(f => f.id === currentCSVId);
      setCurrentFile(file || null);
    } else if (!currentCSVId && csvFiles.length > 0) {
      setCurrentFile(csvFiles[0]);
    }
  }, [currentCSVId, csvFiles]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
    // Reset the input value so the same file can be selected again
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleImportNew = () => {
    // Add a small delay to ensure the dropdown state is set
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 10);
  };

  const loadCSVFiles = useCallback(async () => {
    try {
      const files = await appStorage.getCSVFiles();
      console.log('📁 Loading CSV files:', files.length, 'files found');
      
      const validFiles = [];
      
      for (const file of files) {
        try {
          const leadsData = await appStorage.getCSVLeadsData(file.id);
          console.log(`📄 CSV ${file.name}: ${leadsData?.length || 0} leads`);
          if (leadsData && leadsData.length > 0) {
            validFiles.push({
              ...file,
              leadsCount: leadsData.length
            });
          }
          // Note: We no longer automatically delete CSV files with no leads
          // They might be temporarily empty or have import issues
        } catch (error) {
          console.warn('Error loading leads for CSV:', file.id, error);
          // Don't delete the CSV file on error - it might be a temporary issue
        }
      }
      
      console.log('✅ Valid CSV files:', validFiles.length);
      setCsvFiles(validFiles);
    } catch (error) {
      console.error('Error loading CSV files:', error);
    }
  }, []);

  const handleCSVSelect = async (csvId: string) => {
    setLoading(true);
    try {
      const leads = await appStorage.getCSVLeadsData(csvId);
      const file = csvFiles.find(f => f.id === csvId);
      
      if (file && leads.length > 0) {
        await appStorage.saveCurrentCSVId(csvId);
        onCSVSelect(csvId, leads, file.name);
      }
    } catch (error) {
      console.error('Error switching CSV:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCSV = async (csvId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    try {
      // Use comprehensive cleanup method to remove ALL data associated with this CSV
      await appStorage.removeAllCSVData(csvId);
      
      // If this was the current CSV, clear the current CSV ID
      if (csvId === currentCSVId) {
        await appStorage.saveCurrentCSVId('');
      }
      
      // Reload the CSV files list
      await loadCSVFiles();
      
      // Get updated files list to check if we need to switch
      const updatedFiles = await appStorage.getCSVFiles();
      
      // If we deleted the current CSV and there are other CSVs, switch to the first one
      if (csvId === currentCSVId && updatedFiles.length > 0) {
        await handleCSVSelect(updatedFiles[0].id);
      }
      
      // Call the onAllListsDeleted callback if no lists remain
      if (updatedFiles.length === 0 && onAllListsDeleted) {
        onAllListsDeleted();
      }
    } catch (error) {
      console.error('Error deleting CSV:', error);
    }
  };

  if (csvFiles.length === 0) {
    return (
      <>
        <DropdownMenu onOpenChange={(open) => {
          setIsDropdownOpen(open);
        }}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-base focus:bg-transparent active:bg-transparent transition-all duration-300 ease-out rounded-lg no-hover csv-selector-button text-muted-foreground"
              disabled={importLoading}
              style={{ 
                WebkitTapHighlightColor: 'transparent',
                color: 'hsl(var(--muted-foreground))',
                backgroundColor: isDropdownOpen 
                  ? (document.documentElement.classList.contains('dark') ? 'rgba(31, 41, 55, 0.5)' : 'rgba(243, 244, 246, 0.5)')
                  : 'transparent',
                boxShadow: isDropdownOpen ? 'inset 0 2px 4px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.1)' : 'none'
              }}
            >
              <FileText 
                className="h-5 w-5 transition-all duration-300 ease-out"
                style={{
                  color: 'hsl(var(--muted-foreground))',
                  transform: isDropdownOpen ? 'scale(0.95)' : 'scale(1)',
                  filter: isDropdownOpen ? 'drop-shadow(inset 0 1px 2px rgba(0,0,0,0.3))' : 'none'
                }}
              />
            </Button>
          </DropdownMenuTrigger>
          
            <DropdownMenuContent 
              align="start" 
              className="w-[75vw] bg-background/15 backdrop-blur-sm border border-border/15 rounded-xl shadow-2xl [&>*]:focus:bg-transparent [&>*]:focus:outline-none z-50 border-0 focus:border-0 focus:outline-none focus:ring-0 animate-slide-down -ml-2"
              sideOffset={5}
              collisionPadding={16}
              style={{ outline: 'none', border: 'none', animation: 'slide-down 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              {/* Import list option */}
              {onLeadsImported && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleImportNew();
                  }}
                  disabled={importLoading}
                className="text-base px-3 py-3 cursor-pointer transition-colors duration-150 focus:bg-transparent focus:outline-none touch-manipulation border-0 focus:border-0 focus:ring-0"
                  style={{ outline: 'none', border: 'none' }}
                >
                  <div className="flex items-center w-full">
                    <span className={`font-normal text-base ${importLoading ? 'text-muted-foreground' : 'text-blue-600'}`}>
                      {importLoading ? 'Importing...' : 'Import List'}
                    </span>
                  </div>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
        
        {/* Hidden file input for importing new lists */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          className="hidden"
        />
        </DropdownMenu>
      </>
    );
  }

  return (
    <>
      <DropdownMenu onOpenChange={(open) => {
        setIsDropdownOpen(open);
      }}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-base focus:bg-transparent active:bg-transparent transition-all duration-300 ease-out rounded-lg no-hover csv-selector-button text-muted-foreground"
            disabled={loading}
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              color: 'hsl(var(--muted-foreground))',
              backgroundColor: isDropdownOpen 
                ? (document.documentElement.classList.contains('dark') ? 'rgba(31, 41, 55, 0.5)' : 'rgba(243, 244, 246, 0.5)')
                : 'transparent',
              boxShadow: isDropdownOpen ? 'inset 0 2px 4px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.1)' : 'none'
            }}
          >
            <FileText 
              className="h-5 w-5 transition-all duration-300 ease-out"
              style={{
                color: 'hsl(var(--muted-foreground))',
                transform: isDropdownOpen ? 'scale(0.95)' : 'scale(1)',
                filter: isDropdownOpen ? 'drop-shadow(inset 0 1px 2px rgba(0,0,0,0.3))' : 'none'
              }}
            />
          </Button>
        </DropdownMenuTrigger>
        
          <DropdownMenuContent 
            align="start" 
            className="w-[75vw] bg-background/15 backdrop-blur-sm border border-border/15 rounded-xl shadow-2xl [&>*]:focus:bg-transparent [&>*]:focus:outline-none z-50 border-0 focus:border-0 focus:outline-none focus:ring-0 animate-slide-down -ml-2"
            sideOffset={5}
            collisionPadding={16}
            style={{ outline: 'none', border: 'none', animation: 'slide-down 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            {/* Import list option */}
            {onLeadsImported && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleImportNew();
                }}
                disabled={importLoading}
              className="text-base px-3 py-3 cursor-pointer transition-colors duration-150 focus:bg-transparent focus:outline-none touch-manipulation border-0 focus:border-0 focus:ring-0"
                style={{ outline: 'none', border: 'none' }}
              >
                <div className="flex items-center w-full">
                  <span className={`font-normal text-base ${importLoading ? 'text-muted-foreground' : 'text-blue-600'}`}>
                    {importLoading ? 'Importing...' : 'Import List'}
                  </span>
                </div>
              </DropdownMenuItem>
            )}
            
            {/* Existing CSV files */}
            {csvFiles.map((file) => (
              <DropdownMenuItem
                key={file.id}
                onClick={() => handleCSVSelect(file.id)}
              className={`text-base px-3 py-3 cursor-pointer transition-colors duration-150 focus:bg-transparent focus:outline-none touch-manipulation border-0 focus:border-0 focus:ring-0 ${
                  file.id === currentCSVId 
                    ? 'bg-blue-500/20 border-l-2 border-blue-500' 
                    : 'text-foreground'
                }`}
                style={{ outline: 'none', border: 'none' }}
              >
                <div className="flex items-baseline justify-between w-full">
                  <div className="flex flex-col items-start flex-1 min-w-0 pr-2">
                    <div className="flex items-baseline">
                      <span className="font-normal truncate text-base block max-w-[200px]" title={file.name}>{file.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground mt-0.5">
                      {file.totalLeads} leads
                    </span>
                  </div>
                  <div className="flex items-baseline">
                    <button
                      onClick={(e) => handleDeleteCSV(file.id, e)}
                    className="p-1 rounded-full transition-colors duration-150 flex-shrink-0 focus:outline-none touch-manipulation min-w-[28px] min-h-[28px] flex items-center justify-center border-0 focus:border-0 focus:ring-0"
                      title="Delete CSV file"
                      style={{ outline: 'none', border: 'none' }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
      
      {/* Hidden file input for importing new lists - always present */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleFileChange}
        className="hidden"
      />
      </DropdownMenu>
    </>
  );
};

export default CSVFileSelector; 