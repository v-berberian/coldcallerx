
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
import { useEffect } from 'react';

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
    cardKey,
    historyIndex,
    updateNavigation,
    goToPrevious,
    resetNavigation,
    setCurrentIndex,
    setCardKey,
    restoreFromLocalStorage
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

  useFilterChangeEffects(
    leadsData,
    timezoneFilter,
    callFilter,
    currentIndex,
    isAutoCallInProgress,
    isFilterChanging,
    setFilterChanging,
    setCurrentIndex,
    setCardKey,
    getBaseLeads,
    resetNavigation
  );

  // Enhanced toggle functions to reset shown leads tracker
  const toggleShuffleWrapper = () => {
    toggleShuffle();
    resetShownLeads();
  };

  const toggleCallFilterWrapper = () => {
    toggleCallFilter();
    resetShownLeads();
  };

  const toggleTimezoneFilterWrapper = () => {
    toggleTimezoneFilter();
    resetShownLeads();
  };

  // Enhanced toggle auto-call to reset countdown when disabled
  const toggleAutoCallWrapper = () => {
    const wasAutoCallOn = autoCall;
    toggleAutoCall();
    
    // If turning auto-call OFF, reset any active countdown
    if (wasAutoCallOn) {
      resetAutoCall();
      console.log('Auto-call disabled, resetting countdown');
    }
  };

  // Function to reset leads data (for CSV import)
  const resetLeadsData = (newLeads: Lead[]) => {
    const formattedLeads = newLeads.map(lead => ({
      ...lead,
      called: lead.called || 0,
      lastCalled: lead.lastCalled || undefined
    }));
    setLeadsData(formattedLeads);
    
    // Reset navigation to 0 and clear localStorage
    resetNavigation(0, false); // Not silent for new data
    localStorage.removeItem('coldcaller-current-index');
    resetShownLeads();
    resetCallState();
    
    console.log('Reset leads data with', formattedLeads.length, 'leads');
  };

  // Function to restore session state from cloud (silent restoration to prevent card remount)
  const restoreSessionState = (sessionState: any) => {
    console.log('Restoring session state from cloud (silent):', sessionState);
    
    // Restore the current index from cloud session silently
    if (sessionState.currentLeadIndex !== undefined && leadsData.length > 0) {
      const validIndex = Math.max(0, Math.min(sessionState.currentLeadIndex, leadsData.length - 1));
      console.log('Restoring current index from cloud (silent):', validIndex);
      
      // Use silent navigation to prevent card remount
      updateNavigation(validIndex, false, true);
    }
  };

  return {
    leadsData,
    currentIndex,
    cardKey,
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
    restoreSessionState,
    restoreFromLocalStorage,
    countdownTime
  };
};
