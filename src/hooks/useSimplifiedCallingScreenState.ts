
import { useState, useCallback } from 'react';
import { Lead } from '../types/lead';
import { SessionState } from '@/services/sessionService';
import { useSearchState } from '../components/SearchState';
import { useLeadsData } from './useLeadsData';
import { useComponentLifecycle } from './useComponentLifecycle';
import { useCallingScreenFilters } from './useCallingScreenFilters';
import { useCallingScreenNavigation } from './useCallingScreenNavigation';

interface UseSimplifiedCallingScreenStateProps {
  leads: Lead[];
  sessionState?: SessionState;
}

export const useSimplifiedCallingScreenState = ({ leads, sessionState }: UseSimplifiedCallingScreenStateProps) => {
  const { componentReady, setComponentReady, leadsInitialized, setLeadsInitialized } = useComponentLifecycle();

  const {
    leadsData,
    setLeadsData,
    makeCall,
    markLeadAsCalled,
    markLeadAsCalledOnNavigation,
    resetCallCount,
    resetAllCallCounts
  } = useLeadsData(leads);

  const {
    timezoneFilter,
    callFilter,
    shuffleMode,
    autoCall,
    callDelay,
    isFilterChanging,
    getBaseLeads,
    getDelayDisplayType,
    toggleTimezoneFilter,
    toggleCallFilter,
    toggleShuffle,
    toggleAutoCall,
    toggleCallDelay,
    resetCallDelay,
    setFilterChanging
  } = useCallingScreenFilters({ leadsData });

  const {
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
  } = useCallingScreenNavigation({
    leadsData,
    makeCall,
    markLeadAsCalledOnNavigation,
    callDelay,
    shuffleMode,
    callFilter,
    isFilterChanging
  });

  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    showAutocomplete,
    setShowAutocomplete,
    clearSearch,
    handleSearchFocus,
    handleSearchBlur
  } = useSearchState({ 
    leads, 
    getBaseLeads, 
    leadsData, 
    timezoneFilter, 
    callFilter 
  });

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
  const resetLeadsData = useCallback((newLeads: Lead[]) => {
    const formattedLeads = newLeads.map(lead => ({
      ...lead,
      called: lead.called || 0,
      lastCalled: lead.lastCalled || undefined
    }));
    setLeadsData(formattedLeads);
    
    // Try to restore the last viewed lead index
    const savedIndex = localStorage.getItem('coldcaller-current-index');
    const startIndex = savedIndex ? parseInt(savedIndex, 10) : 0;
    const validIndex = Math.max(0, Math.min(startIndex, formattedLeads.length - 1));
    
    resetNavigation(validIndex);
    resetShownLeads();
    resetCallState();
    
    console.log('Restored to lead index:', validIndex);
  }, [setLeadsData, resetNavigation, resetShownLeads, resetCallState]);

  // Memoize resetLeadsData to prevent infinite loops
  const memoizedResetLeadsData = useCallback((newLeads: Lead[]) => {
    resetLeadsData(newLeads);
  }, [resetLeadsData]);

  return {
    componentReady,
    setComponentReady,
    leadsInitialized,
    setLeadsInitialized,
    leadsData,
    currentIndex,
    cardKey,
    timezoneFilter,
    callFilter,
    shuffleMode,
    autoCall,
    callDelay,
    shouldAutoCall,
    setShouldAutoCall,
    currentLeadForAutoCall,
    setCurrentLeadForAutoCall,
    isCountdownActive,
    countdownTime,
    getBaseLeads,
    getDelayDisplayType,
    makeCall,
    executeAutoCall,
    handleCountdownComplete,
    handleNext,
    handlePrevious,
    selectLead,
    toggleTimezoneFilter: toggleTimezoneFilterWrapper,
    toggleCallFilter: toggleCallFilterWrapper,
    toggleShuffle: toggleShuffleWrapper,
    toggleAutoCall: toggleAutoCallWrapper,
    toggleCallDelay,
    resetCallDelay,
    memoizedResetLeadsData,
    resetCallCount,
    resetAllCallCounts,
    searchQuery,
    setSearchQuery,
    searchResults,
    showAutocomplete,
    setShowAutocomplete,
    clearSearch,
    handleSearchFocus,
    handleSearchBlur
  };
};
