import { useState, useCallback, useRef, useEffect } from 'react';
import { Lead } from '../types/lead';
import { useSearchState } from '../components/SearchState';
import { useLeadNavigation } from './useLeadNavigation';
import { appStorage } from '../utils/storage';

interface UseLocalCallingScreenStateProps {
  leads: Lead[];
  onCallMade?: () => void;
}

export const useLocalCallingScreenState = ({ leads, onCallMade }: UseLocalCallingScreenStateProps) => {
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
  } = useLeadNavigation({ initialLeads: leads, onCallMade });

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
    handleSearchBlur,
    closeAutocomplete
  } = useSearchState({ 
    leads, 
    getBaseLeads, 
    leadsData, 
    timezoneFilter, 
    callFilter 
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (leadsData.length > 0) {
      appStorage.saveLeadsData(leadsData);
    }
  }, [leadsData]);

  useEffect(() => {
    appStorage.saveCurrentLeadIndex(currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    appStorage.saveSearchQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    appStorage.saveTimezoneFilter(timezoneFilter);
  }, [timezoneFilter]);

  useEffect(() => {
    appStorage.saveCallFilter(callFilter);
  }, [callFilter]);

  useEffect(() => {
    appStorage.saveShuffleMode(shuffleMode);
  }, [shuffleMode]);

  useEffect(() => {
    appStorage.saveAutoCall(autoCall);
  }, [autoCall]);

  useEffect(() => {
    appStorage.saveCallDelay(callDelay);
  }, [callDelay]);

  // Restore state from localStorage on app startup
  useEffect(() => {
    if (leadsData.length > 0 && !localStorageRestoredRef.current) {
      console.log('Restoring app state from localStorage');
      
      // Restore search query
      const savedSearchQuery = appStorage.getSearchQuery();
      if (savedSearchQuery) {
        setSearchQuery(savedSearchQuery);
      }

      // Restore filters
      const savedTimezoneFilter = appStorage.getTimezoneFilter();
      if (savedTimezoneFilter !== 'all') {
        // Note: We'll need to trigger the filter change
        console.log('Restoring timezone filter:', savedTimezoneFilter);
      }

      const savedCallFilter = appStorage.getCallFilter();
      if (savedCallFilter !== 'all') {
        console.log('Restoring call filter:', savedCallFilter);
      }

      // Restore app modes
      const savedShuffleMode = appStorage.getShuffleMode();
      if (savedShuffleMode) {
        console.log('Restoring shuffle mode:', savedShuffleMode);
      }

      const savedAutoCall = appStorage.getAutoCall();
      if (savedAutoCall) {
        console.log('Restoring auto call mode:', savedAutoCall);
      }

      const savedCallDelay = appStorage.getCallDelay();
      if (savedCallDelay > 0) {
        console.log('Restoring call delay:', savedCallDelay);
      }

      localStorageRestoredRef.current = true;
    }
  }, [leadsData.length, setSearchQuery]);

  // Check if we need to reset daily count (new day)
  useEffect(() => {
    if (appStorage.shouldResetDailyCount()) {
      console.log('New day detected, resetting daily call count');
      // Reset daily call count logic can be added here
    }
  }, []);

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
    closeAutocomplete,
    getDelayDisplayType
  };
};
