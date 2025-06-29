import React, { useEffect, useState } from 'react';
import { Loader2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CallingScreen from '@/components/CallingScreen';
import CSVImporter from '@/components/CSVImporter';
import CSVFileSelector from '@/components/CSVFileSelector';
import SettingsMenu from '@/components/SettingsMenu';
import { useLocalLeadOperations } from '@/hooks/useLocalLeadOperations';
import { Lead } from '@/types/lead';
import { appStorage } from '@/utils/storage';

const Index = () => {
  const [appReady, setAppReady] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [currentCSVId, setCurrentCSVId] = useState<string | null>(null);
  const [hasSavedLists, setHasSavedLists] = useState(false);
  const [csvSwitchTrigger, setCsvSwitchTrigger] = useState(0);

  const {
    leadsData,
    currentLeadList,
    importLeadsFromCSV,
    loadExistingData,
    setLeadsData,
    setCurrentLeadList
  } = useLocalLeadOperations();

  // Load saved data when component mounts
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await loadExistingData();
        
        // Check if there are any saved CSV files
        try {
          const csvFiles = await appStorage.getCSVFiles();
          setHasSavedLists(csvFiles.length > 0);
        } catch (error) {
          console.error('Error checking saved CSV files:', error);
          setHasSavedLists(false);
        }
        
        // Load current CSV ID
        try {
          const csvId = await appStorage.getCurrentCSVId();
          setCurrentCSVId(csvId);
        } catch (error) {
          console.error('Error loading current CSV ID:', error);
        }
        
        await new Promise(resolve => setTimeout(resolve, 200));
        setAppReady(true);
        
        // Add fade-in effect
        setTimeout(() => {
          setShowContent(true);
        }, 50);
      } catch (error) {
        setAppReady(true); // Still set ready to show UI
      }
    };

    initializeApp();
  }, [loadExistingData]);

  const handleLeadsImported = async (importedLeads: Lead[], fileName: string, csvId: string) => {
    try {
      setCurrentCSVId(csvId);
      const success = await importLeadsFromCSV(importedLeads, fileName, csvId);
      if (!success) {
        console.error('Failed to import leads');
      }
    } catch (error) {
      console.error('Error in handleLeadsImported:', error);
    }
  };

  const handleCSVSelect = async (csvId: string, leads: Lead[], fileName: string) => {
    try {
      setCurrentCSVId(csvId);
      
      // For switching between existing CSV lists, preserve the lastCalled status
      // by directly setting the leads data without going through importLeadsFromCSV
      setLeadsData(leads);
      setCurrentLeadList({
        id: csvId,
        name: fileName,
        file_name: fileName + '.csv',
        total_leads: leads.length
      });
      
      // Save the current CSV ID
      await appStorage.saveCurrentCSVId(csvId);
      
      // Trigger restoration of the current index for this CSV
      setCsvSwitchTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error in handleCSVSelect:', error);
    }
  };

  const handleAllListsDeleted = () => {
    // Immediately clear all state to force empty state
    setHasSavedLists(false);
    setCurrentCSVId(null);
    setLeadsData([]);
    setCurrentLeadList(null);
    
    // Force a re-render by updating the refresh trigger
    // This ensures the empty state is shown immediately
  };

  // Show loading until everything is ready
  if (!appReady) {
    return (
      <div className="h-[100vh] h-[100dvh] h-[100svh] flex items-center justify-center fixed inset-0 overflow-hidden">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading ColdCall X...</p>
        </div>
      </div>
    );
  }

  // If no leads and no saved lists, show empty state with proper header
  // Also show empty state if we have no leads and no current CSV ID (indicating all lists were deleted)
  if ((leadsData.length === 0 && !hasSavedLists) || (leadsData.length === 0 && !currentCSVId)) {
    return (
      <div className={`h-[100vh] h-[100dvh] h-[100svh] overflow-hidden fixed inset-0 transition-opacity duration-300 ${showContent ? 'opacity-100' : 'opacity-0'} flex flex-col`}>
        
        {/* Header with list selector */}
        <div className="relative bg-background border-b border-border p-3 sm:p-4 pt-safe flex-shrink-0 w-full" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
          <div className="flex items-center justify-between mb-3 sm:mb-4 w-full">
            <div className="min-w-0 flex-shrink-0">
              <CSVFileSelector 
                onCSVSelect={handleCSVSelect}
                refreshTrigger={0}
                currentCSVId={currentCSVId}
                onLeadsImported={handleLeadsImported}
              />
            </div>
            
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-2 sm:space-x-3 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold truncate dark:text-white text-black bg-gradient-to-r from-[#6EC6F1] to-[#6EC6F1]/90 bg-clip-text text-transparent dark:bg-none dark:text-white">
                ColdCall X
              </h1>
            </div>
            
            <div className="flex-shrink-0">
              <SettingsMenu>
                {(isOpen) => (
                <Button 
                  variant="ghost" 
                  size="icon" 
                    className={`h-8 w-8 text-base hover:bg-transparent focus:bg-transparent active:bg-transparent transition-all duration-300 ease-out rounded-lg no-hover ${
                      isOpen 
                        ? 'text-muted-foreground shadow-[inset_0_2px_4px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.1)] bg-gray-100/50 dark:bg-gray-800/50' 
                        : 'text-muted-foreground'
                    }`}
                    style={{ 
                      WebkitTapHighlightColor: 'transparent',
                      backgroundColor: isOpen ? 'rgba(243, 244, 246, 0.5)' : 'transparent',
                      color: 'hsl(var(--muted-foreground))'
                    }}
                >
                    <Settings 
                      className={`h-5 w-5 transition-all duration-300 ease-out ${
                        isOpen ? 'scale-95' : 'scale-100'
                      }`}
                      style={{
                        filter: isOpen ? 'drop-shadow(inset 0 1px 2px rgba(0,0,0,0.3))' : 'none',
                        color: 'hsl(var(--muted-foreground))'
                      }}
                    />
                </Button>
                )}
              </SettingsMenu>
            </div>
          </div>
        </div>
        
        {/* Centered content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-6 max-w-md">
            <div className="space-y-2">
              <p className="text-lg text-muted-foreground">Import List</p>
              <p className="text-sm text-muted-foreground">Click the list selector above to import a CSV file</p>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <p className="text-sm font-medium text-foreground text-center">CSV Column Order:</p>
              <div className="text-xs text-muted-foreground space-y-1 text-center">
                <div><span className="font-medium">A:</span> Company (optional)</div>
                <div><span className="font-medium">B:</span> Name (required)</div>
                <div><span className="font-medium">C:</span> Phone (required)</div>
                <div><span className="font-medium">D:</span> Additional Phones (optional)</div>
                <div><span className="font-medium">E:</span> Email (optional)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`transition-opacity duration-300 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
      <CallingScreen 
        leads={leadsData} 
        fileName={currentLeadList?.name || 'Imported Leads'}
        onBack={() => {}}
        onLeadsImported={handleLeadsImported}
        currentCSVId={currentCSVId}
        onCSVSelect={handleCSVSelect}
        onAllListsDeleted={handleAllListsDeleted}
        refreshTrigger={csvSwitchTrigger}
      />
    </div>
  );
};

export default Index;
