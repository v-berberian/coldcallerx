
import { useCallback } from 'react';
import { Lead } from '../types/lead';
import { useLeadsData } from './useLeadsData';
import { useAutoCall } from './useAutoCall';
import { useLeadNavigationEffects } from './useLeadNavigationEffects';

interface UseLeadNavigationOperationsProps {
  leadsData: Lead[];
  callDelay: number;
  setCallMadeToCurrentLead: (called: boolean) => void;
  currentLeadForAutoCall: Lead | null;
  setCurrentLeadForAutoCall: (lead: Lead | null) => void;
}

export const useLeadNavigationOperations = ({
  leadsData,
  callDelay,
  setCallMadeToCurrentLead,
  currentLeadForAutoCall,
  setCurrentLeadForAutoCall
}: UseLeadNavigationOperationsProps) => {
  const { makeCall, markLeadAsCalled, markLeadAsCalledOnNavigation, resetCallCount, resetAllCallCounts } = useLeadsData(leadsData);

  const { isAutoCallInProgress, isCountdownActive, countdownTime, executeAutoCall, handleCountdownComplete, resetAutoCall, shouldBlockNavigation } = useAutoCall(makeCall, callDelay);

  const { makeCallWrapper, handleCountdownCompleteWrapper } = useLeadNavigationEffects({
    makeCall,
    markLeadAsCalledOnNavigation,
    setCallMadeToCurrentLead,
    executeAutoCall,
    handleCountdownComplete,
    resetAutoCall,
    currentLeadForAutoCall,
    setCurrentLeadForAutoCall
  });

  return {
    makeCall: makeCallWrapper,
    markLeadAsCalled,
    markLeadAsCalledOnNavigation,
    resetCallCount,
    resetAllCallCounts,
    executeAutoCall,
    handleCountdownComplete: handleCountdownCompleteWrapper,
    resetAutoCall,
    isAutoCallInProgress,
    isCountdownActive,
    countdownTime,
    shouldBlockNavigation
  };
};
