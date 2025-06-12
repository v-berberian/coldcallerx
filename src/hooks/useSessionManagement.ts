
import { useState, useCallback, useRef } from 'react';
import { sessionService, SessionState } from '../services/sessionService';
import { useDeviceId } from './useDeviceId';

export const useSessionManagement = () => {
  const deviceId = useDeviceId();
  const [isSessionConflict, setIsSessionConflict] = useState(false);
  const [lastRemoteUpdate, setLastRemoteUpdate] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSaveTimeRef = useRef<number>(0);

  const debouncedSaveSession = useCallback(async (sessionState: SessionState): Promise<boolean> => {
    if (!deviceId) {
      console.log('Device ID not ready, skipping session save');
      return false;
    }

    // Debounce saves to prevent excessive database calls
    const now = Date.now();
    if (now - lastSaveTimeRef.current < 1000) {
      // Clear existing timeout and set a new one
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      return new Promise((resolve) => {
        saveTimeoutRef.current = setTimeout(async () => {
          lastSaveTimeRef.current = Date.now();
          const success = await sessionService.saveUserSession(sessionState, deviceId);
          resolve(success);
        }, 1000);
      });
    }

    lastSaveTimeRef.current = now;
    return await sessionService.saveUserSession(sessionState, deviceId);
  }, [deviceId]);

  const loadSession = useCallback(async () => {
    if (!deviceId) {
      console.log('Device ID not ready, skipping session load');
      return null;
    }

    // First try to get this device's session
    let session = await sessionService.getUserSession(deviceId);
    
    // If no session for this device, get the most recent session from any device
    if (!session) {
      const mostRecentSession = await sessionService.getMostRecentSession();
      if (mostRecentSession) {
        setLastRemoteUpdate(mostRecentSession.last_updated_at);
        setIsSessionConflict(true);
        return mostRecentSession;
      }
    } else {
      // Check if there's a more recent session from another device
      const mostRecentSession = await sessionService.getMostRecentSession();
      if (mostRecentSession && 
          mostRecentSession.device_id !== deviceId &&
          new Date(mostRecentSession.last_updated_at) > new Date(session.last_updated_at)) {
        setLastRemoteUpdate(mostRecentSession.last_updated_at);
        setIsSessionConflict(true);
      }
    }

    return session;
  }, [deviceId]);

  const syncFromRemoteSession = useCallback(async (): Promise<SessionState | null> => {
    const mostRecentSession = await sessionService.getMostRecentSession();
    if (mostRecentSession) {
      setIsSessionConflict(false);
      setLastRemoteUpdate(null);
      
      // Convert to SessionState format
      return {
        currentLeadListId: mostRecentSession.current_lead_list_id,
        currentLeadIndex: mostRecentSession.current_lead_index,
        timezoneFilter: mostRecentSession.timezone_filter,
        callFilter: mostRecentSession.call_filter,
        shuffleMode: mostRecentSession.shuffle_mode,
        autoCall: mostRecentSession.auto_call,
        callDelay: mostRecentSession.call_delay
      };
    }
    return null;
  }, []);

  const clearSessionConflict = useCallback(() => {
    setIsSessionConflict(false);
    setLastRemoteUpdate(null);
  }, []);

  return {
    deviceId,
    isSessionConflict,
    lastRemoteUpdate,
    saveSession: debouncedSaveSession,
    loadSession,
    syncFromRemoteSession,
    clearSessionConflict
  };
};
