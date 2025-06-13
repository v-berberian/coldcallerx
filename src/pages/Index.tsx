
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import CallingScreen from '@/components/CallingScreen';
import CloudSyncButton from '@/components/CloudSyncButton';
import UserProfile from '@/components/UserProfile';
import CSVImporter from '@/components/CSVImporter';
import { useCloudLeadsData } from '@/hooks/useCloudLeadsData';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { Lead } from '@/types/lead';

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
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

  const { syncStatus, startSync, syncSuccess, syncError } = useSyncStatus();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleLeadsImported = async (importedLeads: Lead[], importedFileName: string) => {
    startSync();
    const success = await importLeadsFromCSV(importedLeads, importedFileName);
    if (success) {
      syncSuccess();
    } else {
      syncError();
      console.error('Failed to import leads to cloud');
    }
  };

  const handleSessionUpdate = async (updates: any) => {
    startSync();
    const success = await updateSessionState(updates);
    if (success) {
      syncSuccess();
    } else {
      syncError();
    }
  };

  const handleManualSync = async () => {
    startSync();
    // Trigger a session save to test sync
    const success = await updateSessionState({});
    if (success) {
      syncSuccess();
    } else {
      syncError();
    }
  };

  const handleBack = async () => {
    await signOut();
  };

  if (authLoading || leadsLoading) {
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
            <CloudSyncButton status={syncStatus} onSync={handleManualSync} />
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
    <CallingScreen 
      leads={leadsData} 
      fileName={currentLeadList.name} 
      onBack={handleBack}
      onLeadsImported={handleLeadsImported}
      sessionState={sessionState}
      onSessionUpdate={handleSessionUpdate}
      syncStatus={syncStatus}
      onSync={handleManualSync}
    />
  );
};

export default Index;
