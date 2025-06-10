
import { useState } from 'react';
import { Lead } from '../types/lead';

export const useAutoCall = (
  makeCall: (lead: Lead, markAsCalled?: boolean) => void
) => {
  const [isAutoCallInProgress, setIsAutoCallInProgress] = useState(false);

  const executeAutoCall = (lead: Lead) => {
    if (!lead) {
      console.log('No lead provided for auto-call');
      return;
    }
    
    console.log('AUTO-CALL: Making call to:', lead.name, lead.phone);
    setIsAutoCallInProgress(true);
    
    // Make the call without marking as called immediately
    makeCall(lead, false);
    
    // Clear the auto-call flag after a short delay
    setTimeout(() => {
      setIsAutoCallInProgress(false);
    }, 1000);
  };

  return {
    isAutoCallInProgress,
    executeAutoCall
  };
};
