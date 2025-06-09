
import { useState } from 'react';
import { Lead } from '../types/lead';

export const useAutoCall = (
  makeCall: (lead: Lead, markAsCalled?: boolean) => void,
  markLeadAsCalled: (lead: Lead) => void
) => {
  const [isAutoCallInProgress, setIsAutoCallInProgress] = useState(false);
  const [pendingCallLead, setPendingCallLead] = useState<Lead | null>(null);

  const executeAutoCall = (lead: Lead) => {
    if (!lead) return;
    
    setIsAutoCallInProgress(true);
    setPendingCallLead(lead);
    console.log('Starting auto-call for:', lead.name, lead.phone);
    
    setTimeout(() => {
      console.log('Executing auto-call for:', lead.name, lead.phone, '(not marking as called yet)');
      // Make the call but don't mark as called yet
      makeCall(lead, false);
      
      // Clear the auto-call flag after the call is processed
      setTimeout(() => {
        console.log('Auto-call completed, clearing flag');
        setIsAutoCallInProgress(false);
      }, 300);
    }, 100);
  };

  const markPendingCallAsCompleted = () => {
    if (pendingCallLead) {
      console.log('Marking pending call as completed for:', pendingCallLead.name);
      // Just mark as called without triggering phone dialer again
      markLeadAsCalled(pendingCallLead);
      setPendingCallLead(null);
    }
  };

  return {
    isAutoCallInProgress,
    pendingCallLead,
    executeAutoCall,
    markPendingCallAsCompleted
  };
};
