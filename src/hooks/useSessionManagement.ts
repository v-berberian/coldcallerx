
import { useState, useCallback } from 'react';
import { SessionState } from '../services/sessionService';
import { sessionStateService } from '../services/sessionStateService';

export const useSessionManagement = () => {
  const [sessionState, setSessionState] = useState<SessionState>(sessionStateService.getCurrentState());

  const updateSessionState = useCallback(async (updates: Partial<SessionState>): Promise<boolean> => {
    try {
      console.log('useSessionManagement: Updating session state:', updates);
      const newSessionState = sessionStateService.updateState(updates);
      setSessionState(newSessionState);
      await sessionStateService.saveState();
      return true;
    } catch (error) {
      console.error('useSessionManagement: Error updating session state:', error);
      return false;
    }
  }, []);

  const loadSessionState = useCallback(async (): Promise<SessionState | null> => {
    try {
      console.log('useSessionManagement: Loading saved session state');
      const savedState = await sessionStateService.loadSavedState();
      if (savedState) {
        setSessionState(savedState);
        return savedState;
      }
      return null;
    } catch (error) {
      console.error('useSessionManagement: Error loading session state:', error);
      return null;
    }
  }, []);

  const setInitialSessionState = useCallback((state: SessionState) => {
    sessionStateService.setState(state);
    setSessionState(state);
  }, []);

  return {
    sessionState,
    updateSessionState,
    loadSessionState,
    setInitialSessionState
  };
};
