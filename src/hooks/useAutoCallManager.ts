
import { useState } from 'react';
import { Lead } from '../types/lead';
import { useAutoCall } from './useAutoCall';
import { useCallDelay } from './useCallDelay';

export const useAutoCallManager = (makeCall: (lead: Lead, markAsCalled?: boolean) => void) => {
  const [shouldAutoCall, setShouldAutoCall] = useState(false);
  const [callMadeToCurrentLead, setCallMadeToCurrentLead] = useState(false);
  const [currentLeadForAutoCall, setCurrentLeadForAutoCall] = useState<Lead | null>(null);
  const [showTimer, setShowTimer] = useState(true);

  const { callDelay, toggleCallDelay } = useCallDelay();

  const { 
    isAutoCallInProgress, 
    isCountdownActive, 
    countdownTime, 
    executeAutoCall, 
    handleCountdownComplete,
    cancelAutoCall
  } = useAutoCall(makeCall, callDelay, showTimer);

  const handleCountdownCompleteWrapper = () => {
    if (currentLeadForAutoCall) {
      handleCountdownComplete(currentLeadForAutoCall);
      setCurrentLeadForAutoCall(null);
    }
  };

  return {
    shouldAutoCall,
    setShouldAutoCall,
    callMadeToCurrentLead,
    setCallMadeToCurrentLead,
    currentLeadForAutoCall,
    setCurrentLeadForAutoCall,
    showTimer,
    setShowTimer,
    callDelay,
    isAutoCallInProgress,
    isCountdownActive,
    countdownTime,
    executeAutoCall,
    handleCountdownComplete: handleCountdownCompleteWrapper,
    cancelAutoCall,
    toggleCallDelay
  };
};
