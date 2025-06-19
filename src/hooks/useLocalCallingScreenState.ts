import { useState, useCallback, useRef, useEffect } from 'react';
import { Lead } from '../types/lead';
import { useSearchState } from '../components/SearchState';
import { useLeadNavigation } from './useLeadNavigation';

interface UseLocalCallingScreenStateProps {
  leads: Lead[];
}

export const useLocalCallingScreenState = ({ leads }: UseLocalCallingScreenStateProps) => {
  const [componentReady, setComponentReady] = useState(false);
  const [leadsInitialized, setLeadsInitialized] = useState(false);
  const localStorageRestoredRef = useRef(false);

  // Initialize hooks - only pass leads to useLeadNavigation
  const {
    leadsData,
    currentIndex,
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
    makeCall,
    executeAutoCall,
    handleCountdownComplete,
    handleNext,
    handlePrevious,
    selectLead,
    toggleTimezoneFilter,
    toggleCallFilter,
    toggleShuffle,
    toggleAutoCall,
    toggleCallDelay,
    resetCallDelay,
    resetLeadsData,
    updateLeadsDataDirectly,
    restoreFromLocalStorage,
    getDelayDisplayType
  } = useLeadNavigation(leads);

  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    allSearchResults,
    loadedResultsCount,
    loadMoreResults,
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

  // Memoize resetLeadsData to prevent infinite loops
  const memoizedResetLeadsData = useCallback((newLeads: Lead[]) => {
    resetLeadsData(newLeads);
  }, [resetLeadsData]);

  // Direct leads data update without navigation reset - now properly implemented
  const updateLeadsDataDirectlyMemoized = useCallback((updatedLeads: Lead[]) => {
    console.log('Updating leads data directly without navigation reset');
    updateLeadsDataDirectly(updatedLeads);
  }, [updateLeadsDataDirectly]);

  // Only restore from localStorage when leads are ready
  useEffect(() => {
    if (
      leadsData.length > 0 && 
      leadsInitialized && 
      !localStorageRestoredRef.current
    ) {
      console.log('Restoring session from localStorage only');
      restoreFromLocalStorage(leadsData.length);
      localStorageRestoredRef.current = true;
    }
  }, [leadsData.length, leadsInitialized, restoreFromLocalStorage]);

  // Local reset functions
  const resetCallCount = useCallback(async (lead: Lead) => {
    console.log('Local reset call count for:', lead.name);
    // This is just a placeholder - the actual reset logic is handled elsewhere
  }, []);

  const resetAllCallCounts = useCallback(async () => {
    console.log('Local reset all call counts');
    // This is just a placeholder - the actual reset logic is handled elsewhere
  }, []);

  return {
    componentReady,
    setComponentReady,
    leadsInitialized,
    setLeadsInitialized,
    leadsData,
    currentIndex,
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
    makeCall,
    executeAutoCall,
    handleCountdownComplete,
    handleNext,
    handlePrevious,
    selectLead,
    toggleTimezoneFilter,
    toggleCallFilter,
    toggleShuffle,
    toggleAutoCall,
    toggleCallDelay,
    resetCallDelay,
    memoizedResetLeadsData,
    updateLeadsDataDirectly: updateLeadsDataDirectlyMemoized,
    resetCallCount,
    resetAllCallCounts,
    searchQuery,
    setSearchQuery,
    searchResults,
    allSearchResults,
    loadedResultsCount,
    loadMoreResults,
    showAutocomplete,
    setShowAutocomplete,
    clearSearch,
    handleSearchFocus,
    handleSearchBlur,
    getDelayDisplayType
  };
};
