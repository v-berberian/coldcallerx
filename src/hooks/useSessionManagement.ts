
import { useEffect, useRef, useCallback } from 'react';

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
  const lastSavedIndexRef = useRef<number | null>(null);

  // Debounced session update function to prevent rapid updates
  const updateSession = useCallback(async (index: number) => {
    // Prevent duplicate saves
    if (lastSavedIndexRef.current === index) {
      return;
    }
    
    if (!onSessionUpdate || !onSync) return;
    
    console.log('Saving session index:', index);
    lastSavedIndexRef.current = index;
    onSync(); // Start sync status
    
    try {
      await onSessionUpdate({ currentLeadIndex: index });
      console.log('Session saved successfully');
    } catch (error) {
      console.error('Failed to save session:', error);
      // Reset on error so it can be retried
      lastSavedIndexRef.current = null;
    }
  }, [onSessionUpdate, onSync]);

  // Initialize from session state - only once
  useEffect(() => {
    if (sessionState && onSessionUpdate && !isInitializedRef.current) {
      isInitializedRef.current = true;
      
      try {
        console.log('Initializing session management with state:', sessionState);
        const result = initializeFromSessionState(sessionState, onSessionUpdate);
        console.log('Session management initialized successfully');
        
        // Set the last saved index to prevent immediate re-save
        if (sessionState.currentLeadIndex !== undefined) {
          lastSavedIndexRef.current = sessionState.currentLeadIndex;
        }
      } catch (error) {
        console.error('Failed to initialize session management:', error);
        // Reset initialization flag on error
        isInitializedRef.current = false;
      }
    }
  }, [sessionState?.currentLeadListId, onSessionUpdate, initializeFromSessionState]); // Only depend on lead list ID

  // Return the update function for use by navigation
  return {
    updateSession
  };
};
