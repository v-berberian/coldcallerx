
import { useState, useCallback } from 'react';
import { useCloudLeadsData } from './useCloudLeadsData';
import { useRealtimeSync } from './useRealtimeSync';
import { useSyncStatus } from './useSyncStatus';

export const useEnhancedCloudSync = () => {
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<number>(0);
  const [conflictResolution, setConflictResolution] = useState<'local' | 'remote' | 'merge'>('merge');
  
  const cloudData = useCloudLeadsData();
  const { syncStatus, startSync, syncSuccess, syncError } = useSyncStatus();

  const handleSessionUpdate = useCallback((sessionData: any) => {
    // Check if this update is newer than our last local change
    const updateTimestamp = new Date(sessionData.updated_at).getTime();
    
    if (updateTimestamp > lastSyncTimestamp) {
      console.log('Applying remote session update');
      
      // Apply the remote changes based on conflict resolution strategy
      if (conflictResolution === 'remote' || conflictResolution === 'merge') {
        cloudData.updateSessionState({
          currentLeadListId: sessionData.current_lead_list_id,
          currentLeadIndex: sessionData.current_lead_index,
          timezoneFilter: sessionData.timezone_filter,
          callFilter: sessionData.call_filter,
          shuffleMode: sessionData.shuffle_mode,
          autoCall: sessionData.auto_call,
          callDelay: sessionData.call_delay,
          dailyCallCount: sessionData.daily_call_count,
          leadsData: sessionData.leads_data
        });
      }
    }
  }, [lastSyncTimestamp, conflictResolution, cloudData]);

  const handleLeadsUpdate = useCallback((payload: any) => {
    console.log('Handling leads update:', payload);
    // Trigger a refresh of leads data
    cloudData.loadDailyStats();
  }, [cloudData]);

  const { setupRealtimeSubscription } = useRealtimeSync({
    onSessionUpdate: handleSessionUpdate,
    onLeadsUpdate: handleLeadsUpdate
  });

  const performSync = useCallback(async () => {
    startSync();
    try {
      const timestamp = Date.now();
      setLastSyncTimestamp(timestamp);
      
      // Force a session update to trigger sync
      await cloudData.updateSessionState({});
      
      syncSuccess();
      console.log('Enhanced sync completed successfully');
    } catch (error) {
      console.error('Enhanced sync failed:', error);
      syncError();
    }
  }, [startSync, syncSuccess, syncError, cloudData]);

  const setConflictResolutionStrategy = useCallback((strategy: 'local' | 'remote' | 'merge') => {
    setConflictResolution(strategy);
  }, []);

  return {
    ...cloudData,
    syncStatus,
    performSync,
    setConflictResolutionStrategy,
    lastSyncTimestamp
  };
};
