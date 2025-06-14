
import { Lead, CallFilter } from '../types/lead';
import { useNavigationState } from './useNavigationState';
import { useLeadNavigationState } from './useLeadNavigationState';
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
    historyIndex,
    updateNavigation,
    goToPrevious,
    resetNavigation,
    setCurrentIndex
  } = useNavigationState();

  const {
    shouldAutoCall,
    setShouldAutoCall,
    shownLeadsInShuffle,
    setShownLeadsInShuffle,
    callMadeToCurrentLead,
    setCallMadeToCurrentLead,
    currentLeadForAutoCall,
    setCurrentLeadForAutoCall,
    resetShownLeads,
    resetCallState
  } = useLeadNavigationState();

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
    shouldBlockNavigation
  };
};
