
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
    
    console.log('AUTO-CALL: Executing call for lead:', {
      name: lead.name,
      phone: lead.phone,
      called: lead.called
    });
    
    setIsAutoCallInProgress(true);
    
    // Make the call for the specific lead passed in
    makeCall(lead, true);
    
    // Clear the auto-call flag after a short delay
    setTimeout(() => {
      setIsAutoCallInProgress(false);
      console.log('AUTO-CALL: Call completed and flag cleared');
    }, 500);
  };

  return {
    isAutoCallInProgress,
    executeAutoCall
  };
};
