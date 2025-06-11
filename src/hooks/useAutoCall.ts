
import { useState, useEffect } from 'react';
import { Lead } from '../types/lead';

export const useAutoCall = (
  makeCall: (lead: Lead, markAsCalled?: boolean) => void,
  callDelay: number = 15
) => {
  const [isAutoCallInProgress, setIsAutoCallInProgress] = useState(false);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [countdownTime, setCountdownTime] = useState(callDelay);
  const [pendingLead, setPendingLead] = useState<Lead | null>(null);

  const executeAutoCall = (lead: Lead) => {
    if (!lead) {
      console.log('No lead provided for auto-call');
      return;
    }
    
    console.log(`AUTO-CALL: Starting countdown for ${lead.name} ${lead.phone} with ${callDelay}s delay`);
    
    if (callDelay === 0) {
      // No delay, make call immediately
      setIsAutoCallInProgress(true);
      makeCall(lead, false);
      setTimeout(() => {
        setIsAutoCallInProgress(false);
      }, 500);
    } else {
      // Start countdown
      setPendingLead(lead);
      setIsCountdownActive(true);
      setIsAutoCallInProgress(true);
      setCountdownTime(callDelay);
    }
  };

  // Handle countdown timer
  useEffect(() => {
    if (!isCountdownActive || !pendingLead) return;

    const interval = setInterval(() => {
      setCountdownTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsCountdownActive(false);
          
          // Make the call when countdown reaches 0
          console.log('AUTO-CALL: Countdown complete, making call to:', pendingLead.name, pendingLead.phone);
          makeCall(pendingLead, false);
          
          // Clean up after a short delay
          setTimeout(() => {
            setIsAutoCallInProgress(false);
            setPendingLead(null);
          }, 500);
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isCountdownActive, pendingLead, makeCall]);

  const handleCountdownComplete = (lead: Lead) => {
    // This function is no longer needed as the countdown automatically makes the call
    setIsCountdownActive(false);
    makeCall(lead, false);
    
    setTimeout(() => {
      setIsAutoCallInProgress(false);
    }, 500);
  };

  return {
    isAutoCallInProgress,
    isCountdownActive,
    countdownTime,
    executeAutoCall,
    handleCountdownComplete
  };
};
