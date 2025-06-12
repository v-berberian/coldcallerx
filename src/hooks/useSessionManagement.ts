
import { useEffect, useRef } from 'react';
import { Lead } from '../types/lead';

interface UseSessionManagementProps {
  sessionState?: any;
  onSessionUpdate?: (updates: any) => void;
  onSync?: () => void;
  initializeFromSessionState: (sessionState: any, onSessionUpdate: (updates: any) => void) => {
    saveCurrentIndex: (index: number) => Promise<void>;
  };
}

export const useSessionManagement = ({
  sessionState,
  onSessionUpdate,
  onSync,
  initializeFromSessionState
}: UseSessionManagementProps) => {
  const isInitializedRef = useRef(false);

  // Initialize from session state
  useEffect(() => {
    if (sessionState && onSessionUpdate && !isInitializedRef.current) {
      isInitializedRef.current = true;
      
      const { saveCurrentIndex } = initializeFromSessionState(sessionState, onSessionUpdate);
      
      // Save session when navigation changes
      const handleNavigationChange = async (index: number) => {
        if (onSync) {
          onSync(); // Start sync status
        }
        
        try {
          await saveCurrentIndex(index);
        } catch (error) {
          console.error('Failed to save navigation change:', error);
          // Don't block the UI if session save fails
        }
      };

      // Store the handler for use in navigation
      (window as any).saveCurrentIndex = handleNavigationChange;
    }
  }, [sessionState, onSessionUpdate, onSync, initializeFromSessionState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if ((window as any).saveCurrentIndex) {
        delete (window as any).saveCurrentIndex;
      }
    };
  }, []);
};
