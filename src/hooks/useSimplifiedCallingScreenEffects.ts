
import { useEffect } from 'react';
import { Lead } from '../types/lead';
import { SessionState } from '@/services/sessionService';
import { useRealtimeSessionSync } from './useRealtimeSessionSync';

interface UseSimplifiedCallingScreenEffectsProps {
  componentReady: boolean;
  leadsInitialized: boolean;
  currentIndex: number;
  timezoneFilter: string;
  callFilter: string;
  shuffleMode: boolean;
  autoCall: boolean;
  callDelay: number;
  updateSessionState?: (updates: Partial<SessionState>) => Promise<boolean>;
  shouldAutoCall: boolean;
  setShouldAutoCall: (should: boolean) => void;
  setCurrentLeadForAutoCall: (lead: Lead | null) => void;
  executeAutoCall: (lead: Lead) => void;
  getBaseLeads: () => Lead[];
  markLeadAsCalled?: (lead: Lead) => Promise<boolean>;
  handleSessionUpdate: (sessionState: SessionState) => void;
}

export const useSimplifiedCallingScreenEffects = ({
  componentReady,
  leadsInitialized,
  currentIndex,
  timezoneFilter,
  callFilter,
  shuffleMode,
  autoCall,
  callDelay,
  updateSessionState,
  shouldAutoCall,
  setShouldAutoCall,
  setCurrentLeadForAutoCall,
  executeAutoCall,
  getBaseLeads,
  markLeadAsCalled,
  handleSessionUpdate
}: UseSimplifiedCallingScreenEffectsProps) => {
  
  // Use real-time session sync
  useRealtimeSessionSync({
    componentReady,
    leadsInitialized,
    currentIndex,
    timezoneFilter,
    callFilter,
    shuffleMode,
    autoCall,
    callDelay,
    updateSessionState,
    onSessionUpdate: handleSessionUpdate
  });

  // Trigger auto-call when auto-call is enabled and we have a current lead (for initial state)
  useEffect(() => {
    console.log('AUTO-CALL INITIAL TRIGGER: Checking initial conditions', {
      autoCall,
      componentReady,
      leadsInitialized,
      currentIndex
    });

    // Only trigger if auto-call is enabled and everything is ready
    if (autoCall && componentReady && leadsInitialized) {
      const currentLeads = getBaseLeads();
      const currentLead = currentLeads[currentIndex];
      
      if (currentLead) {
        console.log('AUTO-CALL INITIAL TRIGGER: Auto-call is enabled, triggering for current lead:', currentLead.name);
        executeAutoCall(currentLead);
      }
    }
  }, [autoCall, componentReady, leadsInitialized, currentIndex, getBaseLeads, executeAutoCall]);
};
