
import { useEffect } from 'react';
import { Lead } from '../types/lead';
import { SessionState } from '@/services/sessionService';

interface UseCallingScreenEffectsProps {
  componentReady: boolean;
  setComponentReady: (ready: boolean) => void;
  leadsInitialized: boolean;
  setLeadsInitialized: (initialized: boolean) => void;
  leads: Lead[];
  memoizedResetLeadsData: (leads: Lead[]) => void;
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

export const useCallingScreenEffects = ({
  componentReady,
  setComponentReady,
  leadsInitialized,
  setLeadsInitialized,
  leads,
  memoizedResetLeadsData,
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
}: UseCallingScreenEffectsProps) => {
  
  // Progressive component initialization
  useEffect(() => {
    console.log('CallingScreenLogic: Starting progressive initialization');
    
    const initializeComponent = async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      console.log('CallingScreenLogic: Component ready');
      setComponentReady(true);
    };

    initializeComponent();
  }, [setComponentReady]);

  // Handle new CSV imports by resetting the leads data - only when leads actually change
  useEffect(() => {
    if (componentReady && !leadsInitialized) {
      console.log('CallingScreenLogic: Initializing leads data for first time');
      memoizedResetLeadsData(leads);
      setLeadsInitialized(true);
    }
  }, [componentReady, leadsInitialized, leads.length, memoizedResetLeadsData, setLeadsInitialized]);

  // Save session state changes to cloud
  useEffect(() => {
    if (updateSessionState && componentReady && leadsInitialized) {
      const saveSessionState = async () => {
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
      };

      const timeoutId = setTimeout(saveSessionState, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [currentIndex, timezoneFilter, callFilter, shuffleMode, autoCall, callDelay, updateSessionState, componentReady, leadsInitialized]);

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
