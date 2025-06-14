
import { useEffect } from 'react';
import { Lead } from '../types/lead';

interface UseAutoCallEffectsProps {
  shouldAutoCall: boolean;
  autoCall: boolean;
  componentReady: boolean;
  leadsInitialized: boolean;
  currentIndex: number;
  callDelay: number;
  getBaseLeads: () => Lead[];
  setCurrentLeadForAutoCall: (lead: Lead | null) => void;
  executeAutoCall: (lead: Lead) => void;
  setShouldAutoCall: (should: boolean) => void;
  markLeadAsCalled?: (lead: Lead) => Promise<boolean>;
}

export const useAutoCallEffects = ({
  shouldAutoCall,
  autoCall,
  componentReady,
  leadsInitialized,
  currentIndex,
  callDelay,
  getBaseLeads,
  setCurrentLeadForAutoCall,
  executeAutoCall,
  setShouldAutoCall,
  markLeadAsCalled
}: UseAutoCallEffectsProps) => {
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
