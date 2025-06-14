
import { Lead } from '../types/lead';
import { useNavigationState } from './useNavigationState';
import { useFilters } from './useFilters';
import { useLeadsData } from './useLeadsData';
import { useLeadFiltering } from './useLeadFiltering';
import { useAutoCall } from './useAutoCall';
import { useCallDelay } from './useCallDelay';
import { useNavigation } from './useNavigation';
import { useFilterChangeEffects } from './useFilterChangeEffects';
import { useLeadNavigationState } from './useLeadNavigationState';
import { useLeadNavigationActions } from './useLeadNavigationActions';
import { useLeadNavigationEffects } from './useLeadNavigationEffects';
import { useLeadNavigationWrappers } from './useLeadNavigationWrappers';
import { useLeadNavigationReset } from './useLeadNavigationReset';

export const useLeadNavigation = (initialLeads: Lead[]) => {
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

  const {
    currentIndex,
    historyIndex,
    updateNavigation,
    goToPrevious,
    resetNavigation,
    setCurrentIndex,
    restoreFromLocalStorage,
    syncFromCloudSession
  } = useNavigationState();

  const {
    timezoneFilter,
    callFilter,
    shuffleMode,
    autoCall,
    isFilterChanging,
    toggleTimezoneFilter,
    toggleCallFilter,
    toggleShuffle,
    toggleAutoCall,
    setFilterChanging
  } = useFilters();

  const { callDelay, toggleCallDelay, resetCallDelay, getDelayDisplayType } = useCallDelay();

  const {
    leadsData,
    setLeadsData,
    makeCall,
    markLeadAsCalled,
    markLeadAsCalledOnNavigation,
    resetCallCount,
    resetAllCallCounts
  } = useLeadsData(initialLeads);

  const { getBaseLeads } = useLeadFiltering(leadsData, timezoneFilter, callFilter);

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

  const { handleNextWrapper, handlePreviousWrapper, selectLeadWrapper } = useLeadNavigationActions({
    currentIndex,
    updateNavigation,
    resetNavigation,
    shuffleMode,
    callFilter,
    isFilterChanging,
    isAutoCallInProgress,
    shouldBlockNavigation: shouldBlockNavigation(),
    markLeadAsCalledOnNavigation,
    shownLeadsInShuffle,
    setShownLeadsInShuffle,
    handleNext,
    handlePrevious,
    selectLead,
    setCallMadeToCurrentLead,
    autoCall,
    setShouldAutoCall,
    goToPrevious
  });

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

  const {
    toggleShuffleWrapper,
    toggleCallFilterWrapper,
    toggleTimezoneFilterWrapper,
    toggleAutoCallWrapper
  } = useLeadNavigationWrappers({
    toggleShuffle,
    toggleCallFilter,
    toggleTimezoneFilter,
    toggleAutoCall,
    resetShownLeads,
    resetAutoCall,
    autoCall
  });

  const { resetLeadsData } = useLeadNavigationReset({
    setLeadsData,
    resetNavigation,
    resetShownLeads,
    resetCallState
  });

  useFilterChangeEffects(
    leadsData,
    timezoneFilter,
    callFilter,
    currentIndex,
    isAutoCallInProgress,
    isFilterChanging,
    setFilterChanging,
    setCurrentIndex,
    getBaseLeads,
    resetNavigation
  );

  return {
    leadsData,
    currentIndex,
    timezoneFilter,
    callFilter,
    shuffleMode,
    autoCall,
    callDelay,
    historyIndex,
    shouldAutoCall,
    setShouldAutoCall,
    currentLeadForAutoCall,
    setCurrentLeadForAutoCall,
    isCountdownActive,
    getBaseLeads,
    getDelayDisplayType,
    makeCall: makeCallWrapper,
    executeAutoCall,
    handleCountdownComplete: handleCountdownCompleteWrapper,
    handleNext: handleNextWrapper,
    handlePrevious: handlePreviousWrapper,
    resetCallCount,
    resetAllCallCounts,
    selectLead: selectLeadWrapper,
    toggleTimezoneFilter: toggleTimezoneFilterWrapper,
    toggleCallFilter: toggleCallFilterWrapper,
    toggleShuffle: toggleShuffleWrapper,
    toggleAutoCall: toggleAutoCallWrapper,
    toggleCallDelay,
    resetCallDelay,
    resetLeadsData,
    restoreFromLocalStorage,
    syncFromCloudSession,
    countdownTime
  };
};
