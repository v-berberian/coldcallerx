import { useEffect } from 'react';
import { Lead } from '../types/lead';

interface UseAutoCallEffectsProps {
  shouldAutoCall: boolean;
  autoCall: boolean;
  componentReady: boolean;
  leadsInitialized: boolean;
  currentIndex: number;
  callDelay: number;
  isFilterChanging?: boolean;
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
  isFilterChanging = false,
  getBaseLeads,
  setCurrentLeadForAutoCall,
  executeAutoCall,
  setShouldAutoCall,
  markLeadAsCalled
}: UseAutoCallEffectsProps) => {
  // Handle auto-call trigger - start countdown when conditions are met
  useEffect(() => {
    // Don't start auto call if filters are currently changing
    if (shouldAutoCall && autoCall && componentReady && leadsInitialized && !isFilterChanging) {
      const currentLeads = getBaseLeads();
      const currentLead = currentLeads[currentIndex];
      
      if (currentLead) {
        setCurrentLeadForAutoCall(currentLead);
        
        // Execute auto-call with the current lead
        executeAutoCall(currentLead);
        
        // Mark as called in cloud if function is provided and no delay
        if (markLeadAsCalled && callDelay === 0) {
          markLeadAsCalled(currentLead).catch(error => {
            console.error('Error marking lead as called:', error);
          });
        }
      }
      
      // Reset the trigger flag
      setShouldAutoCall(false);
    }
  }, [shouldAutoCall, autoCall, executeAutoCall, setCurrentLeadForAutoCall, setShouldAutoCall, markLeadAsCalled, componentReady, leadsInitialized, getBaseLeads, callDelay, isFilterChanging]);
};
