
import { useState, useEffect } from 'react';
import { Lead } from '../types/lead';

export const useAutoCall = (
  makeCall: (lead: Lead, markAsCalled?: boolean) => void,
  callDelay: number = 15,
  showTimer: boolean = true
) => {
  const [isAutoCallInProgress, setIsAutoCallInProgress] = useState(false);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [countdownTime, setCountdownTime] = useState(callDelay);
  const [pendingLead, setPendingLead] = useState<Lead | null>(null);
  const [intervalRef, setIntervalRef] = useState<NodeJS.Timeout | null>(null);

  const executeAutoCall = (lead: Lead) => {
    if (!lead) {
      console.log('No lead provided for auto-call');
      return;
    }
    
    if (!showTimer) {
      // Immediate call when timer is hidden
      console.log('AUTO-CALL: Making immediate call to:', lead.name, lead.phone);
      setIsAutoCallInProgress(true);
      makeCall(lead, false);
      setTimeout(() => {
        setIsAutoCallInProgress(false);
      }, 500);
      return;
    }
    
    // Generate random delay between 15-22 seconds when timer is shown
    const randomDelay = Math.floor(Math.random() * 8) + 15; // 15 to 22 seconds
    
    console.log(`AUTO-CALL: Starting countdown for ${lead.name} ${lead.phone} with ${randomDelay}s delay`);
    
    // Start countdown with random delay
    setPendingLead(lead);
    setIsCountdownActive(true);
    setIsAutoCallInProgress(true);
    setCountdownTime(randomDelay);
  };

  const cancelAutoCall = () => {
    console.log('AUTO-CALL: Canceling auto-call');
    if (intervalRef) {
      clearInterval(intervalRef);
      setIntervalRef(null);
    }
    setIsCountdownActive(false);
    setIsAutoCallInProgress(false);
    setPendingLead(null);
    setCountdownTime(callDelay);
  };

  // Handle countdown timer
  useEffect(() => {
    if (!isCountdownActive || !pendingLead) {
      if (intervalRef) {
        clearInterval(intervalRef);
        setIntervalRef(null);
      }
      return;
    }

    const interval = setInterval(() => {
      setCountdownTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIntervalRef(null);
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

    setIntervalRef(interval);

    return () => {
      clearInterval(interval);
    };
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
    handleCountdownComplete,
    cancelAutoCall
  };
};
