
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
    
    console.log('AUTO-CALL: Starting auto-call process for lead:', {
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
      console.log('AUTO-CALL: Auto-call process completed and flag cleared');
    }, 1000); // Increased timeout to give more time for filter effects to settle
  };

  return {
    isAutoCallInProgress,
    executeAutoCall
  };
};
