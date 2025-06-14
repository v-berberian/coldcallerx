
import { useEffect } from 'react';
import { SessionState } from '@/services/sessionService';

interface UseSessionPersistenceProps {
  componentReady: boolean;
  leadsInitialized: boolean;
  currentIndex: number;
  timezoneFilter: string;
  callFilter: string;
  shuffleMode: boolean;
  autoCall: boolean;
  callDelay: number;
  updateSessionState?: (updates: Partial<SessionState>) => Promise<boolean>;
}

export const useSessionPersistence = ({
  componentReady,
  leadsInitialized,
  currentIndex,
  timezoneFilter,
  callFilter,
  shuffleMode,
  autoCall,
  callDelay,
  updateSessionState
}: UseSessionPersistenceProps) => {
  // Save session state changes to cloud
  useEffect(() => {
    if (updateSessionState && componentReady && leadsInitialized) {
      const saveSessionState = async () => {
        try {
          await updateSessionState({
            currentLeadIndex: currentIndex,
            timezoneFilter,
            callFilter,
            shuffleMode,
            autoCall,
            callDelay
          });
        } catch (error) {
          console.error('Error saving session state:', error);
        }
      };

      const timeoutId = setTimeout(saveSessionState, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [currentIndex, timezoneFilter, callFilter, shuffleMode, autoCall, callDelay, updateSessionState, componentReady, leadsInitialized]);
};
