
import { useState, useCallback } from 'react';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export const useSyncStatus = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');

  const startSync = useCallback(() => {
    setSyncStatus('syncing');
  }, []);

  const syncSuccess = useCallback(() => {
    setSyncStatus('success');
  }, []);

  const syncError = useCallback(() => {
    setSyncStatus('error');
  }, []);

  const resetSync = useCallback(() => {
    setSyncStatus('idle');
  }, []);

  return {
    syncStatus,
    startSync,
    syncSuccess,
    syncError,
    resetSync
  };
};
