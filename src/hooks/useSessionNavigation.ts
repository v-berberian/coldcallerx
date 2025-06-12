
import { useCallback } from 'react';

export const useSessionNavigation = (
  sessionState: any,
  onSessionUpdate?: (updates: any) => void
) => {
  const saveCurrentIndex = useCallback(async (index: number) => {
    if (onSessionUpdate) {
      console.log('Saving current index to session:', index);
      await onSessionUpdate({ currentLeadIndex: index });
    }
  }, [onSessionUpdate]);

  const initializeFromSessionState = useCallback((
    currentIndex: number,
    setCurrentIndex: (index: number) => void,
    setCardKey: (fn: (prev: number) => number) => void
  ) => {
    console.log('Initializing from session state:', sessionState);
    
    // Set initial index if we have valid session data and it's different from current
    if (sessionState?.currentLeadIndex !== undefined && 
        sessionState.currentLeadIndex !== currentIndex &&
        sessionState.currentLeadIndex >= 0) {
      console.log('Setting initial index from session:', sessionState.currentLeadIndex, 'current:', currentIndex);
      setCurrentIndex(sessionState.currentLeadIndex);
      setCardKey(prev => prev + 1);
    }

    return { saveCurrentIndex };
  }, [sessionState, saveCurrentIndex]);

  return {
    initializeFromSessionState,
    saveCurrentIndex
  };
};
