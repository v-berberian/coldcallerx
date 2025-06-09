
import { useState } from 'react';
import { Lead } from '../types/lead';

export const useAutoCall = (
  makeCall: (lead: Lead, markAsCalled?: boolean) => void,
  markLeadAsCalled: (lead: Lead) => void
) => {
  const [isAutoCallInProgress, setIsAutoCallInProgress] = useState(false);

  const executeAutoCall = (lead: Lead) => {
    if (!lead) {
      console.log('No lead provided for auto-call');
      return;
    }
    
    console.log('Executing auto-call for lead:', lead.name, lead.phone);
    setIsAutoCallInProgress(true);
    
    // Make the call for the specific lead passed in
    makeCall(lead, true);
    
    // Clear the auto-call flag after a short delay
    setTimeout(() => {
      setIsAutoCallInProgress(false);
    }, 500);
  };

  return {
    isAutoCallInProgress,
    executeAutoCall
  };
};
