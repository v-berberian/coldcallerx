
import { Lead } from '../types/lead';
import { useNavigationState } from './useNavigationState';
import { useFilters } from './useFilters';
import { useLeadsData } from './useLeadsData';
import { useLeadFiltering } from './useLeadFiltering';
import { useFilterChangeEffects } from './useFilterChangeEffects';
import { useAutoCallManager } from './useAutoCallManager';
import { useShuffleTracking } from './useShuffleTracking';
import { useNavigationActions } from './useNavigationActions';
import { useFilterActions } from './useFilterActions';
import { useNavigation } from './useNavigation';

export const useLeadNavigation = (initialLeads: Lead[]) => {
  const {
    currentIndex,
    cardKey,
    historyIndex,
    updateNavigation,
    resetNavigation,
    setCurrentIndex,
    setCardKey
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

  const {
    leadsData,
    setLeadsData,
    makeCall,
    markLeadAsCalledOnNavigation,
    resetCallCount,
    resetAllCallCounts
  } = useLeadsData(initialLeads);

  const { getBaseLeads } = useLeadFiltering(leadsData, timezoneFilter, callFilter);

  const {
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
    handleCountdownComplete,
    cancelAutoCall,
    toggleCallDelay
  } = useAutoCallManager(makeCall);

  const {
    shownLeadsInShuffle,
    setShownLeadsInShuffle,
    resetShownLeads
  } = useShuffleTracking();

  const { handleNext, selectLead } = useNavigation(
    currentIndex,
    updateNavigation,
    resetNavigation,
    shuffleMode,
    callFilter,
    isFilterChanging,
    isAutoCallInProgress,
    // Only mark as called if a call was made to current lead
    (lead: Lead) => {
      if (callMadeToCurrentLead) {
        markLeadAsCalledOnNavigation(lead);
      }
    },
    shownLeadsInShuffle,
    setShownLeadsInShuffle
  );

  const navigationActions = useNavigationActions({
    currentIndex,
    updateNavigation,
    resetNavigation,
    shuffleMode,
    callFilter,
    isFilterChanging,
    isAutoCallInProgress,
    isCountdownActive,
    autoCall,
    markLeadAsCalledOnNavigation,
    callMadeToCurrentLead,
    setCallMadeToCurrentLead,
    setShouldAutoCall,
    cancelAutoCall,
    shownLeadsInShuffle,
    setShownLeadsInShuffle,
    getBaseLeads,
    leadsData,
    handleNext,
    selectLead
  });

  const filterActions = useFilterActions({
    toggleTimezoneFilter,
    toggleCallFilter,
    toggleShuffle,
    toggleAutoCall,
    resetShownLeads,
    isCountdownActive,
    cancelAutoCall,
    autoCall
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

  // Enhanced make call function that tracks call state but doesn't mark as called immediately
  const makeCallWrapper = (lead: Lead) => {
    makeCall(lead, false); // Don't mark as called immediately
    setCallMadeToCurrentLead(true); // Track that a call was made
    console.log('Call made to lead:', lead.name, 'marked for call tracking on navigation');
  };

  // Function to reset leads data (for CSV import)
  const resetLeadsData = (newLeads: Lead[]) => {
    const formattedLeads = newLeads.map(lead => ({
      ...lead,
      called: lead.called || 0,
      lastCalled: lead.lastCalled || undefined
    }));
    setLeadsData(formattedLeads);
    resetNavigation(0);
    resetShownLeads();
    setCallMadeToCurrentLead(false);
    // Cancel any ongoing auto-call on new import
    if (isCountdownActive) {
      cancelAutoCall();
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
    showTimer,
    setShowTimer,
    getBaseLeads,
    makeCall: makeCallWrapper,
    executeAutoCall,
    handleCountdownComplete,
    handleNext: navigationActions.handleNext,
    handlePrevious: navigationActions.handlePrevious,
    resetCallCount,
    resetAllCallCounts,
    selectLead: navigationActions.selectLead,
    toggleTimezoneFilter: filterActions.toggleTimezoneFilter,
    toggleCallFilter: filterActions.toggleCallFilter,
    toggleShuffle: filterActions.toggleShuffle,
    toggleAutoCall: filterActions.toggleAutoCall,
    toggleCallDelay,
    resetLeadsData,
    countdownTime
  };
};
