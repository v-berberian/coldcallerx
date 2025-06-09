
import { useState } from 'react';
import { Lead } from '../types/lead';

export const useAutoCall = (makeCall: (lead: Lead) => void) => {
  const [isAutoCallInProgress, setIsAutoCallInProgress] = useState(false);

  const executeAutoCall = (lead: Lead) => {
    if (!lead) return;
    
    setIsAutoCallInProgress(true);
    console.log('Starting auto-call for:', lead.name, lead.phone);
    
    setTimeout(() => {
      console.log('Executing auto-call for:', lead.name, lead.phone);
      makeCall(lead);
      
      // Clear the auto-call flag after the call is processed
      setTimeout(() => {
        console.log('Auto-call completed, clearing flag');
        setIsAutoCallInProgress(false);
      }, 300);
    }, 100);
  };

  return {
    isAutoCallInProgress,
    executeAutoCall
  };
};
