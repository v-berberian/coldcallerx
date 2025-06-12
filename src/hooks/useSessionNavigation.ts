
import { useCallback } from 'react';

export const useSessionNavigation = (onSessionUpdate?: (updates: any) => void) => {
  const saveCurrentIndex = useCallback(async (index: number) => {
    if (onSessionUpdate) {
      console.log('Saving current index to session:', index);
      await onSessionUpdate({ currentLeadIndex: index });
    }
  }, [onSessionUpdate]);

  return {
    saveCurrentIndex
  };
};
