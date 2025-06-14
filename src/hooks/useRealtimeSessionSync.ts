
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SessionState } from '@/services/sessionService';

interface UseRealtimeSessionSyncProps {
  componentReady: boolean;
  leadsInitialized: boolean;
  currentIndex: number;
  timezoneFilter: string;
  callFilter: string;
  shuffleMode: boolean;
  autoCall: boolean;
  callDelay: number;
  updateSessionState?: (updates: Partial<SessionState>) => Promise<boolean>;
  onSessionUpdate?: (sessionState: SessionState) => void;
}

export const useRealtimeSessionSync = ({
  componentReady,
  leadsInitialized,
  currentIndex,
  timezoneFilter,
  callFilter,
  shuffleMode,
  autoCall,
  callDelay,
  updateSessionState,
  onSessionUpdate
}: UseRealtimeSessionSyncProps) => {
  const lastSavedIndexRef = useRef<number>(-1);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Save session state immediately when currentIndex changes
  useEffect(() => {
    if (updateSessionState && componentReady && leadsInitialized) {
      // Only save if the index actually changed
      if (currentIndex !== lastSavedIndexRef.current) {
        console.log('Real-time sync: Index changed from', lastSavedIndexRef.current, 'to', currentIndex);
        lastSavedIndexRef.current = currentIndex;
        
        // Clear any pending save
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        
        // Save immediately for index changes
        const saveSession = async () => {
          try {
            await updateSessionState({
              currentLeadIndex: currentIndex,
              timezoneFilter,
              callFilter,
              shuffleMode,
              autoCall,
              callDelay
            });
            console.log('Real-time sync: Session saved for index', currentIndex);
          } catch (error) {
            console.error('Real-time sync: Error saving session state:', error);
          }
        };

        saveSession();
      }
    }
  }, [currentIndex, updateSessionState, componentReady, leadsInitialized]);

  // Save other state changes with a short debounce
  useEffect(() => {
    if (updateSessionState && componentReady && leadsInitialized) {
      // Clear any pending save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Debounce other changes
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await updateSessionState({
            currentLeadIndex: currentIndex,
            timezoneFilter,
            callFilter,
            shuffleMode,
            autoCall,
            callDelay
          });
          console.log('Real-time sync: Debounced session save');
        } catch (error) {
          console.error('Real-time sync: Error saving session state:', error);
        }
      }, 200); // Shorter debounce for better responsiveness
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [timezoneFilter, callFilter, shuffleMode, autoCall, callDelay, updateSessionState, componentReady, leadsInitialized]);

  // Listen for real-time session updates from other devices/tabs
  useEffect(() => {
    if (!componentReady || !leadsInitialized || !onSessionUpdate) return;

    console.log('Real-time sync: Setting up real-time listener');
    
    const channel = supabase
      .channel('user-session-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_sessions'
        },
        (payload) => {
          console.log('Real-time sync: Received session update:', payload);
          
          if (payload.new) {
            const updatedSession: SessionState = {
              currentLeadListId: payload.new.current_lead_list_id,
              currentLeadIndex: payload.new.current_lead_index,
              timezoneFilter: payload.new.timezone_filter,
              callFilter: payload.new.call_filter,
              shuffleMode: payload.new.shuffle_mode,
              autoCall: payload.new.auto_call,
              callDelay: payload.new.call_delay
            };
            
            // Only apply if the index is different from what we have locally
            if (updatedSession.currentLeadIndex !== currentIndex) {
              console.log('Real-time sync: Applying remote session update');
              onSessionUpdate(updatedSession);
            }
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Real-time sync: Cleaning up real-time listener');
      supabase.removeChannel(channel);
    };
  }, [componentReady, leadsInitialized, onSessionUpdate, currentIndex]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);
};
