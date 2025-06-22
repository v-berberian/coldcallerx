import { useEffect } from 'react';
import { Lead } from '../types/lead';

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
  shouldAutoCall: boolean;
  setShouldAutoCall: (should: boolean) => void;
  setCurrentLeadForAutoCall: (lead: Lead | null) => void;
  executeAutoCall: (lead: Lead) => void;
  getBaseLeads: () => Lead[];
}

export const useCallingScreenEffects = ({
  componentReady,
  setComponentReady,
  leadsInitialized,
  setLeadsInitialized,
  leads,
  memoizedResetLeadsData,
  currentIndex,
  autoCall,
  callDelay,
  shouldAutoCall,
  setShouldAutoCall,
  setCurrentLeadForAutoCall,
  executeAutoCall,
  getBaseLeads
}: UseCallingScreenEffectsProps) => {
  
  // Progressive component initialization
  useEffect(() => {
    const initializeComponent = async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      setComponentReady(true);
    };

    initializeComponent();
  }, [setComponentReady]);

  // Handle new CSV imports by resetting the leads data - only when leads actually change
  useEffect(() => {
    if (componentReady && !leadsInitialized) {
      memoizedResetLeadsData(leads);
      setLeadsInitialized(true);
    }
  }, [componentReady, leadsInitialized, leads.length, memoizedResetLeadsData, setLeadsInitialized]);

  // Handle auto-call trigger - start countdown when conditions are met
  useEffect(() => {
    if (shouldAutoCall && autoCall && componentReady && leadsInitialized) {
      const currentLeads = getBaseLeads();
      const currentLead = currentLeads[currentIndex];
      
      if (currentLead) {
        setCurrentLeadForAutoCall(currentLead);
        
        // Execute auto-call with the current lead
        executeAutoCall(currentLead);
      }
      
      // Reset the trigger flag
      setShouldAutoCall(false);
    }
  }, [shouldAutoCall, autoCall, currentIndex, executeAutoCall, setCurrentLeadForAutoCall, setShouldAutoCall, componentReady, leadsInitialized, getBaseLeads, callDelay]);
};
