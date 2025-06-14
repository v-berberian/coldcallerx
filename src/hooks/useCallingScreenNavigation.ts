
import React from 'react';
import { Lead, CallFilter } from '../types/lead';
import { useNavigationState } from './useNavigationState';
import { useNavigation } from './useNavigation';
import { useAutoCall } from './useAutoCall';

interface UseCallingScreenNavigationProps {
  leadsData: Lead[];
  makeCall: (lead: Lead, markAsCalled?: boolean) => void;
  markLeadAsCalledOnNavigation: (lead: Lead) => void;
  callDelay: number;
  shuffleMode: boolean;
  callFilter: CallFilter;
  isFilterChanging: boolean;
}

export const useCallingScreenNavigation = ({
  leadsData,
  makeCall,
  markLeadAsCalledOnNavigation,
  callDelay,
  shuffleMode,
  callFilter,
  isFilterChanging
}: UseCallingScreenNavigationProps) => {
  const {
    currentIndex,
    cardKey,
    historyIndex,
    updateNavigation,
    goToPrevious,
    resetNavigation,
    setCurrentIndex,
    setCardKey
  } = useNavigationState();

  // Lead navigation state - moved inline since the hook was deleted
  const [shouldAutoCall, setShouldAutoCall] = React.useState(false);
  const [shownLeadsInShuffle, setShownLeadsInShuffle] = React.useState<Set<string>>(new Set());
  const [callMadeToCurrentLead, setCallMadeToCurrentLead] = React.useState(false);
  const [currentLeadForAutoCall, setCurrentLeadForAutoCall] = React.useState<Lead | null>(null);

  const resetShownLeads = () => setShownLeadsInShuffle(new Set());
  const resetCallState = () => {
    setCallMadeToCurrentLead(false);
    setCurrentLeadForAutoCall(null);
    setShouldAutoCall(false);
  };

  const { isAutoCallInProgress, isCountdownActive, countdownTime, executeAutoCall, handleCountdownComplete, resetAutoCall, shouldBlockNavigation } = useAutoCall(makeCall, callDelay);

  const { handleNext, handlePrevious, selectLead } = useNavigation(
    currentIndex,
    updateNavigation,
    resetNavigation,
    shuffleMode,
    callFilter,
    isFilterChanging,
    isAutoCallInProgress,
    shouldBlockNavigation(),
    // Only mark as called if a call was made to current lead
    (lead: Lead) => {
      if (callMadeToCurrentLead) {
        markLeadAsCalledOnNavigation(lead);
      }
    },
    shownLeadsInShuffle,
    setShownLeadsInShuffle
  );

  return {
    currentIndex,
    cardKey,
    historyIndex,
    shouldAutoCall,
    setShouldAutoCall,
    currentLeadForAutoCall,
    setCurrentLeadForAutoCall,
    callMadeToCurrentLead,
    setCallMadeToCurrentLead,
    isCountdownActive,
    countdownTime,
    isAutoCallInProgress,
    executeAutoCall,
    handleCountdownComplete,
    resetAutoCall,
    handleNext,
    handlePrevious,
    selectLead,
    resetNavigation,
    resetShownLeads,
    resetCallState,
    setCurrentIndex,
    setCardKey,
    shouldBlockNavigation
  };
};
