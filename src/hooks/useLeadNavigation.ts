
import { Lead } from '../types/lead';
import { useNavigationState } from './useNavigationState';
import { useLeadNavigationCore } from './useLeadNavigationCore';
import { useLeadNavigationFilters } from './useLeadNavigationFilters';
import { useLeadNavigationOperations } from './useLeadNavigationOperations';
import { useLeadNavigationSession } from './useLeadNavigationSession';
import { useLeadFiltering } from './useLeadFiltering';
import { useNavigation } from './useNavigation';
import { useFilterChangeEffects } from './useFilterChangeEffects';
import { useLeadNavigationActions } from './useLeadNavigationActions';
import { useState } from 'react';

export const useLeadNavigation = (initialLeads: Lead[]) => {
  // Core state management
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
  const [shouldAutoCall, setShouldAutoCall] = useState(false);
  const [shownLeadsInShuffle, setShownLeadsInShuffle] = useState<Set<string>>(new Set());
  const [callMadeToCurrentLead, setCallMadeToCurrentLead] = useState(false);
  const [currentLeadForAutoCall, setCurrentLeadForAutoCall] = useState<Lead | null>(null);

  const resetShownLeads = () => setShownLeadsInShuffle(new Set());
  const resetCallState = () => {
    setCallMadeToCurrentLead(false);
    setCurrentLeadForAutoCall(null);
    setShouldAutoCall(false);
  };

  const { leadsData, setLeadsData, resetLeadsData } = useLeadNavigationCore(initialLeads);

  // Filters and settings
  const {
    timezoneFilter,
    callFilter,
    shuffleMode,
    autoCall,
    callDelay,
    isFilterChanging,
    getDelayDisplayType,
    setFilterChanging,
    toggleTimezoneFilter,
    toggleCallFilter,
    toggleShuffle,
    toggleAutoCall,
    toggleCallDelay,
    resetCallDelay
  } = useLeadNavigationFilters();

  // Operations (calls, auto-call, etc.)
  const {
    makeCall,
    markLeadAsCalled,
    markLeadAsCalledOnNavigation,
    resetCallCount,
    resetAllCallCounts,
    executeAutoCall,
    handleCountdownComplete,
    resetAutoCall,
    isAutoCallInProgress,
    isCountdownActive,
    countdownTime,
    shouldBlockNavigation
  } = useLeadNavigationOperations({
    leadsData,
    callDelay,
    setCallMadeToCurrentLead,
    currentLeadForAutoCall,
    setCurrentLeadForAutoCall
  });

  // Lead filtering
  const { getBaseLeads } = useLeadFiltering(leadsData, timezoneFilter, callFilter);

  // Navigation logic
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

  // Navigation actions wrapper
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

  // Session management
  const { restoreSessionState } = useLeadNavigationSession({
    leadsData,
    resetNavigation,
    resetShownLeads,
    resetCallState
  });

  // Filter change effects
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

  // Enhanced reset leads data function
  const resetLeadsDataWrapper = (newLeads: Lead[]) => {
    resetLeadsData(newLeads);
    
    // Don't restore from localStorage anymore - rely on cloud session state
    resetNavigation(0);
    resetShownLeads();
    resetCallState();
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
    makeCall,
    executeAutoCall,
    handleCountdownComplete,
    handleNext: handleNextWrapper,
    handlePrevious: handlePreviousWrapper,
    resetCallCount,
    resetAllCallCounts,
    selectLead: selectLeadWrapper,
    toggleTimezoneFilter: toggleTimezoneFilter(resetShownLeads),
    toggleCallFilter: toggleCallFilter(resetShownLeads),
    toggleShuffle: toggleShuffle(resetShownLeads),
    toggleAutoCall: toggleAutoCall(resetAutoCall),
    toggleCallDelay,
    resetCallDelay,
    resetLeadsData: resetLeadsDataWrapper,
    restoreSessionState,
    countdownTime
  };
};
