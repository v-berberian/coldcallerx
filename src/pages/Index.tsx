
import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import CallingScreen from '@/components/CallingScreen';
import CSVImporter from '@/components/CSVImporter';
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
            <span className="text-blue-500">Cold Caller X</span>
          </h1>
          
          <div className="w-8"></div>
        </div>
        
        {/* Centered content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-6 max-w-md">
            <div className="space-y-2">
              <p className="text-lg text-muted-foreground">No Leads Imported</p>
              <p className="text-sm text-muted-foreground">Click the upload icon above to import a CSV file</p>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4 text-left">
              <h3 className="font-semibold text-sm mb-3 text-center">CSV Column Order:</h3>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>1. Company</span>
                  <span className="text-orange-600">(optional)</span>
                </div>
                <div className="flex justify-between">
                  <span>2. Name</span>
                  <span className="text-red-600">(required)</span>
                </div>
                <div className="flex justify-between">
                  <span>3. Phone</span>
                  <span className="text-red-600">(required)</span>
                </div>
                <div className="flex justify-between">
                  <span>4. Additional Phones</span>
                  <span className="text-orange-600">(optional)</span>
                </div>
                <div className="flex justify-between">
                  <span>5. Email</span>
                  <span className="text-orange-600">(optional)</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Use commas for empty columns
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
