
import { useEffect } from 'react';
import { Lead } from '../types/lead';

interface UseAutoCallEffectsProps {
  shouldAutoCall: boolean;
  autoCall: boolean;
  currentIndex: number;
  cardKey: number;
  getBaseLeads: () => Lead[];
  setCurrentLeadForAutoCall: (lead: Lead | null) => void;
  executeAutoCall: (lead: Lead) => void;
  incrementDailyCallCount: () => void;
  setShouldAutoCall: (should: boolean) => void;
}

export const useAutoCallEffects = ({
  shouldAutoCall,
  autoCall,
  currentIndex,
  cardKey,
  getBaseLeads,
  setCurrentLeadForAutoCall,
  executeAutoCall,
  incrementDailyCallCount,
  setShouldAutoCall
}: UseAutoCallEffectsProps) => {
  // Handle auto-call using the currently displayed lead
  useEffect(() => {
    if (shouldAutoCall && autoCall) {
      const currentLeads = getBaseLeads();
      const currentLead = currentLeads[currentIndex];
      
      if (currentLead) {
        console.log('Auto-call triggered for displayed lead:', currentLead.name, currentLead.phone);
        setCurrentLeadForAutoCall(currentLead);
        executeAutoCall(currentLead);
        incrementDailyCallCount();
      }
      
      setShouldAutoCall(false);
    }
  }, [shouldAutoCall, autoCall, currentIndex, cardKey, getBaseLeads, setCurrentLeadForAutoCall, executeAutoCall, incrementDailyCallCount, setShouldAutoCall]);
};
