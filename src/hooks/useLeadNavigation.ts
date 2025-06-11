import { useState } from 'react';
import { Lead } from '../types/lead';
import { useNavigationState } from './useNavigationState';
import { useFilters } from './useFilters';
import { useLeadsData } from './useLeadsData';
import { useLeadFiltering } from './useLeadFiltering';
import { useAutoCall } from './useAutoCall';
import { useCallDelay } from './useCallDelay';
import { useNavigation } from './useNavigation';
import { useFilterChangeEffects } from './useFilterChangeEffects';

export const useLeadNavigation = (initialLeads: Lead[]) => {
  const [shouldAutoCall, setShouldAutoCall] = useState(false);
  const [shownLeadsInShuffle, setShownLeadsInShuffle] = useState<Set<string>>(new Set());
  const [callMadeToCurrentLead, setCallMadeToCurrentLead] = useState(false);
  const [currentLeadForAutoCall, setCurrentLeadForAutoCall] = useState<Lead | null>(null);

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

  const { callDelay, toggleCallDelay } = useCallDelay();

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

  const { isAutoCallInProgress, isCountdownActive, countdownTime, executeAutoCall, handleCountdownComplete } = useAutoCall(makeCall, callDelay);

  const { handleNext, handlePrevious, selectLead } = useNavigation(
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

  const handleNextWrapper = () => {
    const baseLeads = getBaseLeads();
    handleNext(baseLeads);
    
    // Reset call state when navigating
    setCallMadeToCurrentLead(false);
    
    // Set flag to trigger auto-call after navigation
    if (autoCall) {
      setShouldAutoCall(true);
    }
  };

  const handlePreviousWrapper = () => {
    const baseLeads = getBaseLeads();
    if (baseLeads.length === 0) return;
    
    // Simple list-based previous navigation
    const prevIndex = currentIndex === 0 ? baseLeads.length - 1 : currentIndex - 1;
    console.log('Previous navigation: from index', currentIndex, 'to index', prevIndex);
    updateNavigation(prevIndex);
    
    // Reset call state when navigating
    setCallMadeToCurrentLead(false);
  };

  const selectLeadWrapper = (lead: Lead) => {
    const baseLeads = getBaseLeads();
    selectLead(lead, baseLeads, leadsData);
    // Reset call state when selecting a new lead
    setCallMadeToCurrentLead(false);
  };

  // Enhanced make call function that tracks call state but doesn't mark as called immediately
  const makeCallWrapper = (lead: Lead) => {
    makeCall(lead, false); // Don't mark as called immediately
    setCallMadeToCurrentLead(true); // Track that a call was made
    console.log('Call made to lead:', lead.name, 'marked for call tracking on navigation');
  };

  // Enhanced toggle functions to reset shown leads tracker
  const toggleShuffleWrapper = () => {
    toggleShuffle();
    setShownLeadsInShuffle(new Set()); // Reset when toggling shuffle mode
  };

  const toggleCallFilterWrapper = () => {
    toggleCallFilter();
    setShownLeadsInShuffle(new Set()); // Reset when changing call filter
  };

  const toggleTimezoneFilterWrapper = () => {
    toggleTimezoneFilter();
    setShownLeadsInShuffle(new Set()); // Reset when changing timezone filter
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
    setShownLeadsInShuffle(new Set()); // Reset shown leads on new import
    setCallMadeToCurrentLead(false); // Reset call state on new import
  };

  const handleCountdownCompleteWrapper = () => {
    // This is no longer needed as countdown auto-completes, but keeping for compatibility
    if (currentLeadForAutoCall) {
      handleCountdownComplete(currentLeadForAutoCall);
      setCurrentLeadForAutoCall(null);
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
    makeCall: makeCallWrapper, // Use the wrapper that tracks call state
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
    toggleAutoCall,
    toggleCallDelay,
    resetLeadsData,
    countdownTime
  };
};
