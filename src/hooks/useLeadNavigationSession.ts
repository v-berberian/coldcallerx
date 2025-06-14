
import { useCallback } from 'react';
import { Lead } from '../types/lead';

interface UseLeadNavigationSessionProps {
  leadsData: Lead[];
  resetNavigation: (index?: number) => void;
  resetShownLeads: () => void;
  resetCallState: () => void;
}

export const useLeadNavigationSession = ({
  leadsData,
  resetNavigation,
  resetShownLeads,
  resetCallState
}: UseLeadNavigationSessionProps) => {

  // Function to restore session state from cloud (called by parent component)
  const restoreSessionState = useCallback((sessionState: any) => {
    console.log('Restoring session state from cloud:', sessionState);
    
    // Restore the current index from cloud session
    if (sessionState.currentLeadIndex !== undefined && leadsData.length > 0) {
      const validIndex = Math.max(0, Math.min(sessionState.currentLeadIndex, leadsData.length - 1));
      console.log('Restoring current index from cloud:', validIndex);
      resetNavigation(validIndex);
    }
  }, [leadsData.length, resetNavigation]);

  return {
    restoreSessionState
  };
};
