
import { useEffect } from 'react';
import { Lead } from '../types/lead';

interface UseCallingScreenEffectsProps {
  leads: Lead[];
  leadsData: Lead[];
  shouldAutoCall: boolean;
  autoCall: boolean;
  currentIndex: number;
  cardKey: number;
  resetLeadsData: (leads: Lead[]) => void;
  getBaseLeads: () => Lead[];
  setCurrentLeadForAutoCall: (lead: Lead | null) => void;
  executeAutoCall: (lead: Lead) => void;
  incrementDailyCallCount: () => void;
  setShouldAutoCall: (should: boolean) => void;
}

export const useCallingScreenEffects = ({
  leads,
  leadsData,
  shouldAutoCall,
  autoCall,
  currentIndex,
  cardKey,
  resetLeadsData,
  getBaseLeads,
  setCurrentLeadForAutoCall,
  executeAutoCall,
  incrementDailyCallCount,
  setShouldAutoCall
}: UseCallingScreenEffectsProps) => {

  // Handle new CSV imports by resetting the leads data
  useEffect(() => {
    resetLeadsData(leads);
  }, [leads, resetLeadsData]);

  // Save updated leads data to localStorage whenever leadsData changes
  useEffect(() => {
    if (leadsData.length > 0) {
      localStorage.setItem('coldcaller-leads', JSON.stringify(leadsData));
    }
  }, [leadsData]);

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
