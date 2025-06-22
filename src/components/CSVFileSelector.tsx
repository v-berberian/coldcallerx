import React, { useState, useEffect, useRef } from 'react';
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
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Use the CSV importer hook for handling file processing
  const { loading: importLoading, handleFileProcess } = useCsvImporter({ 
    onLeadsImported: (leads: Lead[], fileName: string, csvId: string) => {
      // After successful import, reload the CSV files list
      loadCSVFiles();
      // Call the parent's onLeadsImported if provided
      if (onLeadsImported) {
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

  // Animation effect for disappearing - same as settings menu
  useEffect(() => {
    if (isDropdownOpen) {
      setShouldRender(true);
      setIsAnimating(true);
    } else if (shouldRender) {
      setIsAnimating(false);
      // Fade out animation duration - same as settings menu
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 20); // Same 20ms as settings menu for fast disappearance
      return () => clearTimeout(timer);
    }
  }, [isDropdownOpen, shouldRender]);

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
    // Keep dropdown open when importing
    setIsDropdownOpen(true);
    // Add a small delay to ensure the dropdown state is set
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 10);
  };

  const loadCSVFiles = async () => {
    try {
      const filesStr = localStorage.getItem('coldcaller-csv-files');
      const files = filesStr ? JSON.parse(filesStr) : [];
      
      // Filter out files that don't have actual leads data in localStorage
      const validFiles = files.filter(file => {
        const leadsKey = `coldcaller-csv-${file.id}-leads`;
        const leadsData = localStorage.getItem(leadsKey);
        return leadsData && JSON.parse(leadsData).length > 0;
      });
      
      // If there are invalid files (files without leads data), clean them up
      if (validFiles.length !== files.length) {
        const invalidFiles = files.filter(file => {
          const leadsKey = `coldcaller-csv-${file.id}-leads`;
          const leadsData = localStorage.getItem(leadsKey);
          return !leadsData || JSON.parse(leadsData).length === 0;
        });
        
        // Remove invalid files from localStorage
        invalidFiles.forEach(file => {
          localStorage.removeItem(`coldcaller-csv-${file.id}-leads`);
          localStorage.removeItem(`coldcaller-csv-${file.id}-current-index`);
        });
        
        // Update the CSV files list to only include valid files
        localStorage.setItem('coldcaller-csv-files', JSON.stringify(validFiles));
        
        // If current CSV ID is invalid, clear it
        if (currentCSVId && !validFiles.find(f => f.id === currentCSVId)) {
          localStorage.setItem('coldcaller-current-csv-id', '');
        }
      }
      
      setCsvFiles(validFiles);
    } catch (error) {
      console.error('Error loading CSV files:', error);
      setCsvFiles([]);
    }
  };

  const handleCSVSelect = async (csvId: string) => {
    setLoading(true);
    try {
      const key = `coldcaller-csv-${csvId}-leads`;
      const leadsStr = localStorage.getItem(key);
      const leads = leadsStr ? JSON.parse(leadsStr) : [];
      const file = csvFiles.find(f => f.id === csvId);
      
      if (file && leads.length > 0) {
        localStorage.setItem('coldcaller-current-csv-id', csvId);
        onCSVSelect(csvId, leads, file.name);
      }
    } catch (error) {
      console.error('Error switching CSV:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCSV = async (csvId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the select action
    
    try {
      // Remove from localStorage
      const filesStr = localStorage.getItem('coldcaller-csv-files');
      const files = filesStr ? JSON.parse(filesStr) : [];
      const updatedFiles = files.filter(f => f.id !== csvId);
      localStorage.setItem('coldcaller-csv-files', JSON.stringify(updatedFiles));
      
      // Remove CSV-specific data
      localStorage.removeItem(`coldcaller-csv-${csvId}-leads`);
      localStorage.removeItem(`coldcaller-csv-${csvId}-current-index`);
      
      // If this was the current CSV, clear the current CSV ID
      if (csvId === currentCSVId) {
        localStorage.setItem('coldcaller-current-csv-id', '');
      }
      
      // Reload the CSV files list
      await loadCSVFiles();
      
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
            <div className={isDropdownOpen ? 'ring-2 ring-primary/50 ring-offset-2 ring-offset-background rounded-lg transition-all duration-200' : ''}>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-auto p-2 text-base font-normal text-black hover:bg-transparent hover:text-black touch-manipulation min-h-[44px] border-0 focus:border-0 focus:outline-none focus:ring-0 focus:ring-offset-0 active:border-0 active:outline-none active:ring-0 visited:border-0 visited:outline-none visited:ring-0 ${className}`}
                disabled={importLoading}
                style={{ 
                  outline: 'none', 
                  border: 'none', 
                  boxShadow: 'none'
                }}
                data-no-outline="true"
              >
                <FileText className="h-5 w-5 text-black dark:text-white" />
              </Button>
            </div>
          </DropdownMenuTrigger>
          
          {shouldRender && (
            <DropdownMenuContent 
              align="end" 
              className={`w-64 bg-background/15 backdrop-blur-sm border border-border/15 rounded-xl shadow-2xl [&>*]:focus:bg-transparent [&>*]:focus:outline-none z-50 border-0 focus:border-0 focus:outline-none focus:ring-0 ${isAnimating ? 'animate-slide-down' : 'animate-slide-up'}`}
              sideOffset={8}
              collisionPadding={16}
              style={{ outline: 'none', border: 'none' }}
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
                  className="text-base px-3 py-3 cursor-pointer transition-colors duration-150 hover:bg-transparent focus:bg-transparent focus:outline-none touch-manipulation border-0 focus:border-0 focus:ring-0"
                  style={{ outline: 'none', border: 'none' }}
                >
                  <div className="flex items-center w-full">
                    <span className={`font-normal text-base ${importLoading ? 'text-muted-foreground' : 'text-blue-600'}`}>
                      {importLoading ? 'Importing...' : '+ Import List'}
                    </span>
                  </div>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          )}
        </DropdownMenu>
        
        {/* Hidden file input for importing new lists */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          className="hidden"
        />
      </>
    );
  }

  return (
    <>
      <DropdownMenu onOpenChange={(open) => {
        setIsDropdownOpen(open);
      }}>
        <DropdownMenuTrigger asChild>
          <div className={isDropdownOpen ? 'ring-2 ring-primary/50 ring-offset-2 ring-offset-background rounded-lg transition-all duration-200' : ''}>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-auto p-2 text-base font-normal text-black hover:bg-transparent hover:text-black touch-manipulation min-h-[44px] border-0 focus:border-0 focus:outline-none focus:ring-0 focus:ring-offset-0 active:border-0 active:outline-none active:ring-0 visited:border-0 visited:outline-none visited:ring-0 ${className}`}
              disabled={loading}
              style={{ 
                outline: 'none', 
                border: 'none', 
                boxShadow: 'none'
              }}
              data-no-outline="true"
            >
              <FileText className="h-5 w-5 text-black dark:text-white" />
            </Button>
          </div>
        </DropdownMenuTrigger>
        
        {shouldRender && (
          <DropdownMenuContent 
            align="end" 
            className={`w-64 bg-background/15 backdrop-blur-sm border border-border/15 rounded-xl shadow-2xl [&>*]:focus:bg-transparent [&>*]:focus:outline-none z-50 border-0 focus:border-0 focus:outline-none focus:ring-0 ${isAnimating ? 'animate-slide-down' : 'animate-slide-up'}`}
            sideOffset={8}
            collisionPadding={16}
            style={{ outline: 'none', border: 'none' }}
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
                className="text-base px-3 py-3 cursor-pointer transition-colors duration-150 hover:bg-transparent focus:bg-transparent focus:outline-none touch-manipulation border-0 focus:border-0 focus:ring-0"
                style={{ outline: 'none', border: 'none' }}
              >
                <div className="flex items-center w-full">
                  <span className={`font-normal text-base ${importLoading ? 'text-muted-foreground' : 'text-blue-600'}`}>
                    {importLoading ? 'Importing...' : '+ Import List'}
                  </span>
                </div>
              </DropdownMenuItem>
            )}
            
            {/* Existing CSV files */}
            {csvFiles.map((file) => (
              <DropdownMenuItem
                key={file.id}
                onClick={() => handleCSVSelect(file.id)}
                className={`text-base px-3 py-3 cursor-pointer transition-colors duration-150 hover:bg-transparent focus:bg-transparent focus:outline-none touch-manipulation border-0 focus:border-0 focus:ring-0 ${
                  file.id === currentCSVId 
                    ? 'bg-accent/30 text-accent-foreground' 
                    : 'text-foreground'
                }`}
                style={{ outline: 'none', border: 'none' }}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col items-start flex-1 min-w-0 pr-2">
                    <span className="font-normal truncate w-full text-base">{file.name}</span>
                    <span className="text-sm text-muted-foreground mt-0.5">
                      {file.totalLeads} leads
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteCSV(file.id, e)}
                    className="ml-1 p-1 rounded-full transition-colors duration-150 flex-shrink-0 focus:outline-none touch-manipulation min-w-[28px] min-h-[28px] flex items-center justify-center hover:bg-muted/30 border-0 focus:border-0 focus:ring-0"
                    title="Delete CSV file"
                    style={{ outline: 'none', border: 'none' }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        )}
      </DropdownMenu>
      
      {/* Hidden file input for importing new lists - always present */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  );
};

export default CSVFileSelector; 