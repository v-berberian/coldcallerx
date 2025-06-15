
import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import CallingScreen from '@/components/CallingScreen';
import CSVImporter from '@/components/CSVImporter';
import { useHybridLeadOperations } from '@/hooks/useHybridLeadOperations';

const Index = () => {
  const [appReady, setAppReady] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const {
    leadsData,
    currentLeadList,
    isOnline,
    importLeadsFromCSV,
    loadExistingData
  } = useHybridLeadOperations();

  // Load saved data when app starts
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
    console.log('Index: Importing new leads with hybrid storage:', importedLeads.length);
    await importLeadsFromCSV(importedLeads, fileName);
  };

  // Show loading until everything is ready
  if (!appReady) {
    return (
      <div className="h-[100vh] h-[100dvh] h-[100svh] bg-background flex items-center justify-center fixed inset-0 overflow-hidden">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-500" />
          <p className="text-lg text-muted-foreground">
            Initializing app...
          </p>
        </div>
      </div>
    );
  }

  // If no leads, show empty state with proper header
  if (leadsData.length === 0) {
    return (
      <div className={`h-[100vh] h-[100dvh] h-[100svh] bg-background overflow-hidden fixed inset-0 transition-opacity duration-300 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Header with import */}
        <div className="flex items-center justify-between p-4 border-b border-border pt-safe" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
          <CSVImporter onLeadsImported={handleLeadsImported} />
          
          <h1 className="text-2xl font-bold">
            <span className="text-blue-500">ColdCall </span>
            <span className="text-blue-500">X</span>
          </h1>
          
          <div className="w-8 h-8"></div> {/* Spacer for symmetry */}
        </div>
        
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <p className="text-lg text-muted-foreground">No Leads Imported</p>
            <p className="text-sm text-muted-foreground">Click the upload icon above to import a CSV file</p>
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
        onBack={() => {}} // No back functionality needed without auth
        onLeadsImported={handleLeadsImported}
      />
    </div>
  );
};

export default Index;
