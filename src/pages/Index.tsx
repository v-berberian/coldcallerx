
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import CallingScreen from '@/components/CallingScreen';
import UserProfile from '@/components/UserProfile';
import CSVImporter from '@/components/CSVImporter';
import OnlineStatusIndicator from '@/components/OnlineStatusIndicator';
import { useHybridLeadOperations } from '@/hooks/useHybridLeadOperations';

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [appReady, setAppReady] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const {
    leadsData,
    currentLeadList,
    isOnline,
    importLeadsFromCSV,
    loadExistingData
  } = useHybridLeadOperations();

  useEffect(() => {
    if (!authLoading && !user) {
      console.log('Index: No user found, redirecting to auth');
      navigate('/auth', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Load saved data when user is ready
  useEffect(() => {
    if (user && !authLoading) {
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
    }
  }, [user, authLoading, loadExistingData]);

  const handleLeadsImported = async (importedLeads: any[], fileName: string) => {
    console.log('Index: Importing new leads with hybrid storage:', importedLeads.length);
    await importLeadsFromCSV(importedLeads, fileName);
  };

  const handleBack = async () => {
    console.log('Index: Signing out from main app');
    await signOut();
  };

  // Show loading until everything is ready
  if (authLoading || (user && !appReady)) {
    return (
      <div className="h-[100vh] h-[100dvh] h-[100svh] bg-background flex items-center justify-center fixed inset-0 overflow-hidden">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-500" />
          <p className="text-lg text-muted-foreground">
            {authLoading ? 'Loading...' : 'Initializing app...'}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  // If no leads, show empty state with proper header
  if (leadsData.length === 0) {
    return (
      <div className={`h-[100vh] h-[100dvh] h-[100svh] bg-background overflow-hidden fixed inset-0 transition-opacity duration-300 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Header with user info and import */}
        <div className="flex items-center justify-between p-4 border-b border-border pt-safe" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
          <CSVImporter onLeadsImported={handleLeadsImported} />
          
          <h1 className="text-2xl font-bold">
            <span className="text-blue-500">ColdCall </span>
            <span className="text-blue-500">X</span>
          </h1>
          
          <div className="flex items-center space-x-2">
            <OnlineStatusIndicator isOnline={isOnline} />
            <UserProfile />
          </div>
        </div>
        
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <p className="text-lg text-muted-foreground">No Leads Imported</p>
            <p className="text-sm text-muted-foreground">Click the upload icon above to import a CSV file</p>
            <div className="mt-4">
              <OnlineStatusIndicator isOnline={isOnline} />
              <p className="text-xs text-muted-foreground mt-2">
                {isOnline ? 'Data will sync to server' : 'Working offline - data stored locally'}
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
        onBack={handleBack}
        onLeadsImported={handleLeadsImported}
      />
    </div>
  );
};

export default Index;
