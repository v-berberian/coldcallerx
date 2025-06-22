import { useState, useEffect, useRef } from 'react';
import { Lead } from '../types/lead';

interface UseAutoCallProps {
  makeCall: (lead: Lead, markAsCalled?: boolean, onCallMade?: () => void, onTransitionDetected?: () => void) => void;
  callDelay: number;
}

export const useAutoCall = (
  makeCall: (lead: Lead, markAsCalled?: boolean, onCallMade?: () => void, onTransitionDetected?: () => void) => void,
  callDelay: number = 15
) => {
  const [isAutoCallInProgress, setIsAutoCallInProgress] = useState(false);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [countdownTime, setCountdownTime] = useState(0);
  const [pendingLead, setPendingLead] = useState<Lead | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const executeAutoCall = (lead: Lead) => {
    if (!lead) {
      return;
    }
    
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    let actualDelay: number;
    
    if (callDelay === 0) {
      // Rocket mode - no delay, call immediately
      actualDelay = 0;
    } else if (callDelay === 5) {
      // 5 second mode - fixed 5 second delay
      actualDelay = 5;
    } else if (callDelay === 10) {
      // 10 second mode - fixed 10 second delay
      actualDelay = 10;
    } else {
      // Timer mode (callDelay === 15) - random delay between 14-32 seconds
      actualDelay = Math.floor(Math.random() * 19) + 14; // 14 to 32 seconds
    }
    
    if (actualDelay === 0) {
      // No delay, make call immediately
      setIsAutoCallInProgress(true);
      makeCall(lead, false);
      setTimeout(() => {
        setIsAutoCallInProgress(false);
      }, 500);
    } else {
      // Start countdown with specified delay
      setPendingLead(lead);
      setIsCountdownActive(true);
      setIsAutoCallInProgress(true);
      setCountdownTime(actualDelay);
      
      // Start the countdown timer
      intervalRef.current = setInterval(() => {
        setCountdownTime((prev) => {
          if (prev <= 1) {
            // Clear interval
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            
            // Reset countdown state
            setIsCountdownActive(false);
            
            // Make the call
            makeCall(lead, false);
            
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
    }
  };

  const resetAutoCall = () => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setIsCountdownActive(false);
    setIsAutoCallInProgress(false);
    setCountdownTime(0);
    setPendingLead(null);
  };

  // Check if navigation should be blocked (when countdown is 1 second or less)
  const shouldBlockNavigation = () => {
    return isCountdownActive && countdownTime <= 1;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

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
    resetAutoCall,
    shouldBlockNavigation
  };
};
