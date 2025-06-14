
import { useEffect } from 'react';
import { Lead } from '../types/lead';
import { SessionState } from '@/services/sessionService';

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
  markLeadAsCalled
}: UseSimplifiedCallingScreenEffectsProps) => {

  // Save session state changes to cloud with debouncing
  useEffect(() => {
    if (updateSessionState && componentReady && leadsInitialized) {
      const timeoutId = setTimeout(async () => {
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
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [currentIndex, timezoneFilter, callFilter, shuffleMode, autoCall, callDelay, updateSessionState, componentReady, leadsInitialized]);

  // Handle auto-call trigger
  useEffect(() => {
    if (shouldAutoCall && autoCall && componentReady && leadsInitialized) {
      const currentLeads = getBaseLeads();
      const currentLead = currentLeads[currentIndex];
      
      if (currentLead) {
        console.log('AUTO-CALL: Triggering for lead:', currentLead.name);
        setCurrentLeadForAutoCall(currentLead);
        executeAutoCall(currentLead);
        
        // Mark as called in cloud if no delay
        if (markLeadAsCalled && callDelay === 0) {
          markLeadAsCalled(currentLead).catch(error => {
            console.error('Error marking lead as called:', error);
          });
        }
      }
      
      setShouldAutoCall(false);
    }
  }, [shouldAutoCall, autoCall, currentIndex, executeAutoCall, setCurrentLeadForAutoCall, setShouldAutoCall, markLeadAsCalled, componentReady, leadsInitialized, getBaseLeads, callDelay]);

  // Save current index to localStorage
  useEffect(() => {
    if (componentReady && leadsInitialized) {
      localStorage.setItem('coldcaller-current-index', currentIndex.toString());
    }
  }, [currentIndex, componentReady, leadsInitialized]);
};
