
import { useState, useEffect } from 'react';
import { Lead } from '../types/lead';

export const useAutoCall = (
  makeCall: (lead: Lead, markAsCalled?: boolean) => void,
  callDelay: number = 15
) => {
  const [isAutoCallInProgress, setIsAutoCallInProgress] = useState(false);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [countdownTime, setCountdownTime] = useState(callDelay);

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
      setIsCountdownActive(true);
      setIsAutoCallInProgress(true);
      setCountdownTime(callDelay);
    }
  };

  // Handle countdown timer
  useEffect(() => {
    if (!isCountdownActive) return;

    const interval = setInterval(() => {
      setCountdownTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsCountdownActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isCountdownActive]);

  const handleCountdownComplete = (lead: Lead) => {
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
