
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useCloudLeadsData } from '@/hooks/useCloudLeadsData';
import CallingScreen from '@/components/CallingScreen';
import UserProfile from '@/components/UserProfile';
import CSVImporter from '@/components/CSVImporter';

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [appReady, setAppReady] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const {
    currentLeadList,
    leadsData,
    loading: cloudLoading,
    importLeadsFromCSV,
    markLeadAsCalled,
    resetCallCount,
    resetAllCallCounts,
    updateSessionState,
    sessionState
  } = useCloudLeadsData();

  useEffect(() => {
    if (!authLoading && !user) {
      console.log('Index: No user found, redirecting to auth');
      navigate('/auth', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Progressive loading - wait for both auth and cloud data to be ready
  useEffect(() => {
    if (user && !authLoading && !cloudLoading) {
      console.log('Index: User authenticated and data loaded, starting app initialization');
      
      // Small delay to ensure smooth transition
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
  }, [user, authLoading, cloudLoading]);

  const handleLeadsImported = async (importedLeads: any[], fileName: string) => {
    console.log('Index: Importing new leads to cloud:', importedLeads.length);
    const success = await importLeadsFromCSV(importedLeads, fileName);
    if (!success) {
      console.error('Index: Failed to import leads to cloud');
    }
  };

  const handleBack = async () => {
    console.log('Index: Signing out from main app');
    await signOut();
  };

  // Show loading until everything is ready
  if (authLoading || cloudLoading || (user && !appReady)) {
    return (
      <div className="h-[100vh] h-[100dvh] h-[100svh] bg-background flex items-center justify-center fixed inset-0 overflow-hidden">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-500" />
          <p className="text-lg text-muted-foreground">
            {authLoading ? 'Loading...' : cloudLoading ? 'Restoring your session...' : 'Initializing app...'}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  // If no leads, show empty state with proper header
  if (!currentLeadList || leadsData.length === 0) {
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
            <UserProfile />
          </div>
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
        fileName={currentLeadList.name}
        onBack={handleBack}
        onLeadsImported={handleLeadsImported}
        markLeadAsCalled={markLeadAsCalled}
        resetCallCount={resetCallCount}
        resetAllCallCounts={resetAllCallCounts}
        sessionState={sessionState}
        updateSessionState={updateSessionState}
      />
    </div>
  );
};

export default Index;
