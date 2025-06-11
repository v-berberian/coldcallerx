
import { useState } from 'react';
import { Lead } from '../types/lead';

export const useLeadNavigationState = () => {
  const [shouldAutoCall, setShouldAutoCall] = useState(false);
  const [shownLeadsInShuffle, setShownLeadsInShuffle] = useState<Set<string>>(new Set());
  const [callMadeToCurrentLead, setCallMadeToCurrentLead] = useState(false);
  const [currentLeadForAutoCall, setCurrentLeadForAutoCall] = useState<Lead | null>(null);

  const resetShownLeads = () => {
    setShownLeadsInShuffle(new Set());
  };

  const resetCallState = () => {
    setCallMadeToCurrentLead(false);
  };

  return {
    shouldAutoCall,
    setShouldAutoCall,
    shownLeadsInShuffle,
    setShownLeadsInShuffle,
    callMadeToCurrentLead,
    setCallMadeToCurrentLead,
    currentLeadForAutoCall,
    setCurrentLeadForAutoCall,
    resetShownLeads,
    resetCallState
  };
};
