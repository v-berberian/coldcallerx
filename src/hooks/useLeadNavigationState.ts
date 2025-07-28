
import { useState } from 'react';
import { Lead } from '../types/lead';

export const useLeadNavigationState = () => {
  const [shouldAutoCall, setShouldAutoCall] = useState(false);
  const [shownLeadsInShuffle, setShownLeadsInShuffle] = useState<Set<string>>(new Set());
  const [callMadeToCurrentLead, setCallMadeToCurrentLead] = useState(false);
  const [callMadeLeadKey, setCallMadeLeadKey] = useState<string | null>(null);
  const [currentLeadForAutoCall, setCurrentLeadForAutoCall] = useState<Lead | null>(null);

  const resetShownLeads = () => {
    setShownLeadsInShuffle(new Set());
  };

  const resetCallState = () => {
    setCallMadeToCurrentLead(false);
    setCallMadeLeadKey(null);
  };

  return {
    shouldAutoCall,
    setShouldAutoCall,
    shownLeadsInShuffle,
    setShownLeadsInShuffle,
    callMadeToCurrentLead,
    setCallMadeToCurrentLead,
    callMadeLeadKey,
    setCallMadeLeadKey,
    currentLeadForAutoCall,
    setCurrentLeadForAutoCall,
    resetShownLeads,
    resetCallState
  };
};
