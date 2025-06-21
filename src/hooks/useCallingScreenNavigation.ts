import { Lead, CallFilter } from '../types/lead';
import { useNavigationState } from './useNavigationState';
import { useLeadNavigationState } from './useLeadNavigationState';
import { useNavigation } from './useNavigation';
import { useAutoCall } from './useAutoCall';

interface UseCallingScreenNavigationProps {
  leadsData: Lead[];
  currentIndex: number;
  updateNavigation: (index: number) => void;
  resetNavigation: (index: number) => void;
  shuffleMode: boolean;
  callFilter: CallFilter;
  isFilterChanging: boolean;
  isAutoCallInProgress: boolean;
  shouldBlockNavigation: boolean;
  makeCall: (lead: Lead, markAsCalled?: boolean, onCallMade?: () => void, onTransitionDetected?: () => void) => void;
  markLeadAsCalledOnNavigation: (lead: Lead) => void;
  shownLeadsInShuffle: Set<string>;
  setShownLeadsInShuffle: (shown: Set<string>) => void;
  handleNext: (baseLeads: Lead[]) => void;
  handlePrevious: () => void;
  selectLead: (lead: Lead, baseLeads: Lead[], allLeads: Lead[]) => void;
  setCallMadeToCurrentLead: (called: boolean) => void;
  autoCall: boolean;
  setShouldAutoCall: (should: boolean) => void;
  goToPrevious: () => boolean;
  callMadeToCurrentLead: boolean;
  callDelay: number;
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
    // Pass the markLeadAsCalledOnNavigation function but don't call it here
    // The wrapper functions will handle the conditional calling
    markLeadAsCalledOnNavigation,
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
