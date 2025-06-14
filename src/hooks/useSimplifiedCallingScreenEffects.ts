
import { useEffect } from 'react';
import { Lead } from '../types/lead';

interface UseSimplifiedCallingScreenEffectsProps {
  componentReady: boolean;
  setComponentReady: (ready: boolean) => void;
  leadsInitialized: boolean;
  setLeadsInitialized: (initialized: boolean) => void;
  leads: Lead[];
  leadsData: Lead[];
  memoizedResetLeadsData: (leads: Lead[]) => void;
  currentIndex: number;
  autoCall: boolean;
  callDelay: number;
  shouldAutoCall: boolean;
  setShouldAutoCall: (should: boolean) => void;
  setCurrentLeadForAutoCall: (lead: Lead | null) => void;
  executeAutoCall: (lead: Lead) => void;
  getBaseLeads: () => Lead[];
}

export const useSimplifiedCallingScreenEffects = ({
  componentReady,
  setComponentReady,
  leadsInitialized,
  setLeadsInitialized,
  leads,
  memoizedResetLeadsData,
  shouldAutoCall,
  setShouldAutoCall,
  setCurrentLeadForAutoCall,
  executeAutoCall,
  getBaseLeads,
  currentIndex,
  autoCall,
  callDelay
}: UseSimplifiedCallingScreenEffectsProps) => {
  
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
      } else {
        console.log('AUTO-CALL EFFECT: No current lead found');
      }
      
      // Reset the trigger flag
      setShouldAutoCall(false);
    }
  }, [shouldAutoCall, autoCall, currentIndex, executeAutoCall, setCurrentLeadForAutoCall, setShouldAutoCall, componentReady, leadsInitialized, getBaseLeads, callDelay]);
};
