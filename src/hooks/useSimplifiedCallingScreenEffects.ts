
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

  // Handle auto-call trigger - start countdown when conditions are met
  useEffect(() => {
    console.log('AUTO-CALL EFFECT: Checking conditions', {
      shouldAutoCall,
      autoCall,
      componentReady,
      leadsInitialized,
      currentIndex
    });

    if (shouldAutoCall && autoCall && componentReady && leadsInitialized) {
      const currentLeads = getBaseLeads();
      const currentLead = currentLeads[currentIndex];
      
      if (currentLead) {
        console.log('AUTO-CALL EFFECT: Triggering countdown for lead:', currentLead.name, currentLead.phone);
        setCurrentLeadForAutoCall(currentLead);
        
        // Execute auto-call with the current lead
        executeAutoCall(currentLead);
        
        // Mark as called in cloud if function is provided and no delay
        if (markLeadAsCalled && callDelay === 0) {
          markLeadAsCalled(currentLead).catch(error => {
            console.error('Error marking lead as called:', error);
          });
        }
      } else {
        console.log('AUTO-CALL EFFECT: No current lead found');
      }
      
      // Reset the trigger flag
      setShouldAutoCall(false);
    }
  }, [shouldAutoCall, autoCall, currentIndex, executeAutoCall, setCurrentLeadForAutoCall, setShouldAutoCall, markLeadAsCalled, componentReady, leadsInitialized, getBaseLeads, callDelay]);
};
