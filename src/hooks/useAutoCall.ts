
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
    
    console.log('AUTO-CALL: Preparing to call:', lead.name, lead.phone);
    setIsAutoCallInProgress(true);
    
    // Add 1 second delay to ensure lead card is fully rendered
    setTimeout(() => {
      console.log('AUTO-CALL: Making delayed call to:', lead.name, lead.phone);
      // Make the call without marking as called immediately
      makeCall(lead, false);
      
      // Clear the auto-call flag after the call is made
      setTimeout(() => {
        setIsAutoCallInProgress(false);
      }, 500);
    }, 1000);
  };

  return {
    isAutoCallInProgress,
    executeAutoCall
  };
};
