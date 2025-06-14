
import React, { useEffect, useState } from 'react';
import { Loader2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CallingScreen from '@/components/CallingScreen';
import CSVImporter from '@/components/CSVImporter';
import SettingsMenu from '@/components/SettingsMenu';
import { useLocalLeadOperations } from '@/hooks/useLocalLeadOperations';

const Index = () => {
  const [appReady, setAppReady] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const {
    leadsData,
    currentLeadList,
    importLeadsFromCSV,
    loadExistingData
  } = useLocalLeadOperations();

  // Load saved data when component mounts
  useEffect(() => {
    console.log('Index: Loading saved data');
    loadExistingData();
    
    // Initialize app
    const initializeApp = async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
      console.log('Index: App initialization complete');
      setAppReady(true);
      
      // Add fade-in effect
      setTimeout(() => {
        setShowContent(true);
      }, 50);
    };

    initializeApp();
  }, [loadExistingData]);

  const handleLeadsImported = async (importedLeads: any[], fileName: string) => {
    console.log('Index: Importing new leads locally:', importedLeads.length);
    await importLeadsFromCSV(importedLeads, fileName);
  };

  // Show loading until everything is ready
  if (!appReady) {
    return (
      <div className="h-[100vh] h-[100dvh] h-[100svh] bg-background flex items-center justify-center fixed inset-0 overflow-hidden">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-500" />
          <p className="text-lg text-muted-foreground">Initializing app...</p>
        </div>
      </div>
    );
  }

  // If no leads, show empty state with proper header
  if (leadsData.length === 0) {
    return (
      <div className={`h-[100vh] h-[100dvh] h-[100svh] bg-background overflow-hidden fixed inset-0 transition-opacity duration-300 ${showContent ? 'opacity-100' : 'opacity-0'} flex flex-col`}>
        
        {/* Header with import */}
        <div className="flex items-center justify-between p-4 border-b border-border pt-safe flex-shrink-0" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
          <CSVImporter onLeadsImported={handleLeadsImported} />
          
          <h1 className="text-2xl font-bold">
            <span className="text-blue-500">ColdCall </span>
            <span className="text-blue-500">X</span>
          </h1>
          
          <SettingsMenu>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 rounded-full"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </SettingsMenu>
        </div>
        
        {/* Centered content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-6 max-w-md">
            <div className="space-y-2">
              <p className="text-lg text-muted-foreground">No Leads Imported</p>
              <p className="text-sm text-muted-foreground">Click the upload icon above to import a CSV file</p>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <p className="text-sm font-medium text-foreground">CSV Column Order:</p>
              <div className="text-xs text-muted-foreground space-y-1 text-left">
                <div><span className="font-medium">Company:</span> optional</div>
                <div><span className="font-medium">Name:</span> required</div>
                <div><span className="font-medium">Phone:</span> required</div>
                <div><span className="font-medium">Additional Phones:</span> optional</div>
                <div><span className="font-medium">Email:</span> optional</div>
              </div>
              <p className="text-xs text-muted-foreground italic">
                Note: Use commas for empty columns
              </p>
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
      />
    </div>
  );
};

export default Index;
