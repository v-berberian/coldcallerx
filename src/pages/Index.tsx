
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import CallingScreen from '@/components/CallingScreen';
import ThemeToggle from '@/components/ThemeToggle';
import UserProfile from '@/components/UserProfile';
import CSVImporter from '@/components/CSVImporter';
import { useCloudLeadsData } from '@/hooks/useCloudLeadsData';
import { Lead } from '@/types/lead';

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [initializationComplete, setInitializationComplete] = useState(false);
  
  const {
    currentLeadList,
    leadsData,
    dailyCallCount,
    loading: leadsLoading,
    sessionState,
    importLeadsFromCSV,
    resetDailyCallCount,
    updateSessionState
  } = useCloudLeadsData();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Mark initialization as complete when we have either leads data or confirmed no leads
  useEffect(() => {
    if (!leadsLoading && (!currentLeadList || leadsData.length > 0 || currentLeadList)) {
      console.log('Initialization complete:', { 
        leadsLoading, 
        currentLeadList: !!currentLeadList, 
        leadsDataLength: leadsData.length,
        sessionState 
      });
      setInitializationComplete(true);
    }
  }, [leadsLoading, currentLeadList, leadsData.length, sessionState]);

  const handleLeadsImported = async (importedLeads: Lead[], importedFileName: string) => {
    const success = await importLeadsFromCSV(importedLeads, importedFileName);
    if (!success) {
      console.error('Failed to import leads to cloud');
    }
  };

  const handleBack = async () => {
    await signOut();
  };

  if (authLoading || leadsLoading || !initializationComplete) {
    console.log('Loading state:', { authLoading, leadsLoading, initializationComplete });
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  // If no current lead list, show empty state with proper header
  if (!currentLeadList || leadsData.length === 0) {
    return (
      <div className="h-screen h-[100vh] h-[100svh] bg-background overflow-hidden">
        {/* Header with user info and sign out */}
        <div className="flex items-center justify-between p-4 border-b border-border pt-safe" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
          <CSVImporter onLeadsImported={handleLeadsImported} />
          
          <h1 className="text-2xl font-bold">
            <span className="text-blue-500">Cold</span>
            <span className="text-foreground">Caller </span>
            <span className="text-blue-500">X</span>
          </h1>
          
          <div className="flex items-center space-x-2">
            <ThemeToggle />
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

  console.log('Rendering CallingScreen with session state:', sessionState);

  return (
    <CallingScreen 
      leads={leadsData} 
      fileName={currentLeadList.name} 
      onBack={handleBack}
      onLeadsImported={handleLeadsImported}
      sessionState={sessionState}
      onSessionUpdate={updateSessionState}
    />
  );
};

export default Index;
