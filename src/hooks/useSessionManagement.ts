
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
  const saveHandlerRef = useRef<((index: number) => Promise<void>) | null>(null);

  // Memoized session update function to prevent re-render loops
  const updateSession = useCallback(async (index: number) => {
    if (!onSessionUpdate || !onSync) return;
    
    console.log('Saving session index:', index);
    onSync(); // Start sync status
    
    try {
      await onSessionUpdate({ currentLeadIndex: index });
      console.log('Session saved successfully');
    } catch (error) {
      console.error('Failed to save session:', error);
      // Don't block the UI if session save fails
    }
  }, [onSessionUpdate, onSync]);

  // Initialize from session state
  useEffect(() => {
    if (sessionState && onSessionUpdate && !isInitializedRef.current) {
      isInitializedRef.current = true;
      
      try {
        console.log('Initializing session management with state:', sessionState);
        const { saveCurrentIndex } = initializeFromSessionState(sessionState, onSessionUpdate);
        saveHandlerRef.current = saveCurrentIndex;
        
        console.log('Session management initialized successfully');
      } catch (error) {
        console.error('Failed to initialize session management:', error);
        // Reset initialization flag on error
        isInitializedRef.current = false;
      }
    }
  }, [sessionState, onSessionUpdate, initializeFromSessionState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      saveHandlerRef.current = null;
    };
  }, []);

  // Return the update function for use by navigation
  return {
    updateSession
  };
};
