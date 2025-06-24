import { useState, useCallback, useRef, useEffect } from 'react';
import { Lead } from '../types/lead';
import { useSearchState } from '../components/SearchState';
import { useLeadNavigation } from './useLeadNavigation';
import { appStorage } from '../utils/storage';
import { useNavigationState } from './useNavigationState';
import { useLeadsData } from './useLeadsData';

interface UseLocalCallingScreenStateProps {
  leads: Lead[];
  onCallMade?: () => void;
  refreshTrigger?: number;
}

export const useLocalCallingScreenState = ({ leads, onCallMade, refreshTrigger = 0 }: UseLocalCallingScreenStateProps) => {
  const [componentReady, setComponentReady] = useState(false);
  const [leadsInitialized, setLeadsInitialized] = useState(false);
  const localStorageRestoredRef = useRef(false);

  // Use the new async hooks
  const { currentIndex, updateNavigation, isLoaded: navLoaded, historyIndex, goToPrevious, resetNavigation, setCurrentIndex, restoreFromLocalStorage, syncFromCloudSession } = useNavigationState();
  const { leadsData, setLeadsData, isLoaded: leadsLoaded } = useLeadsData(leads);

  // Wait for both to load
  const isLoaded = navLoaded && leadsLoaded;

  // Initialize hooks - only pass leads to useLeadNavigation
  const {
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
    getDelayDisplayType,
    resetCallCount: leadNavigationResetCallCount,
    resetAllCallCounts: leadNavigationResetAllCallCounts
  } = useLeadNavigation({ 
    initialLeads: leads, 
    onCallMade,
    currentIndex,
    historyIndex,
    updateNavigation,
    goToPrevious,
    resetNavigation,
    setCurrentIndex,
    restoreFromLocalStorage,
    syncFromCloudSession,
    refreshTrigger
  });

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
      try {
        const currentCSVId = localStorage.getItem('coldcaller-current-csv-id');
        if (currentCSVId) {
          const key = `coldcaller-csv-${currentCSVId}-leads`;
          localStorage.setItem(key, JSON.stringify(leadsData));
        }
      } catch (error) {
        console.error('Error saving leads data:', error);
      }
    }
  }, [leadsData]);

  useEffect(() => {
    const saveCurrentIndex = async () => {
      try {
        await appStorage.saveCurrentLeadIndex(currentIndex);
      } catch (error) {
        console.error('Error saving current index:', error);
      }
    };
    saveCurrentIndex();
  }, [currentIndex]);

  useEffect(() => {
    const saveSearchQuery = async () => {
      try {
        await appStorage.saveSearchQuery(searchQuery);
      } catch (error) {
        console.error('Error saving search query:', error);
      }
    };
    saveSearchQuery();
  }, [searchQuery]);

  useEffect(() => {
    const saveTimezoneFilter = async () => {
      try {
        await appStorage.saveTimezoneFilter(timezoneFilter);
      } catch (error) {
        console.error('Error saving timezone filter:', error);
      }
    };
    saveTimezoneFilter();
  }, [timezoneFilter]);

  useEffect(() => {
    const saveCallFilter = async () => {
      try {
        await appStorage.saveCallFilter(callFilter);
      } catch (error) {
        console.error('Error saving call filter:', error);
      }
    };
    saveCallFilter();
  }, [callFilter]);

  useEffect(() => {
    const saveShuffleMode = async () => {
      try {
        await appStorage.saveShuffleMode(shuffleMode);
      } catch (error) {
        console.error('Error saving shuffle mode:', error);
      }
    };
    saveShuffleMode();
  }, [shuffleMode]);

  useEffect(() => {
    const saveAutoCall = async () => {
      try {
        await appStorage.saveAutoCall(autoCall);
      } catch (error) {
        console.error('Error saving auto call:', error);
      }
    };
    saveAutoCall();
  }, [autoCall]);

  useEffect(() => {
    const saveCallDelay = async () => {
      try {
        await appStorage.saveCallDelay(callDelay);
      } catch (error) {
        console.error('Error saving call delay:', error);
      }
    };
    saveCallDelay();
  }, [callDelay]);

  // Restore state from localStorage on app startup
  useEffect(() => {
    const restoreState = async () => {
      if (leadsData.length > 0 && !localStorageRestoredRef.current) {
        try {
          // Restore search query
          const savedSearchQuery = await appStorage.getSearchQuery();
          if (savedSearchQuery) {
            setSearchQuery(savedSearchQuery);
          }

          // Restore filters
          const savedTimezoneFilter = await appStorage.getTimezoneFilter();
          if (savedTimezoneFilter !== 'all') {
            // Note: We'll need to trigger the filter change
            // This will be handled by the filter hooks
          }

          const savedCallFilter = await appStorage.getCallFilter();
          if (savedCallFilter !== 'all') {
            // This will be handled by the filter hooks
          }

          // Restore app modes
          const savedShuffleMode = await appStorage.getShuffleMode();
          if (savedShuffleMode) {
            // This will be handled by the mode hooks
          }

          const savedAutoCall = await appStorage.getAutoCall();
          if (savedAutoCall) {
            // This will be handled by the auto call hooks
          }

          const savedCallDelay = await appStorage.getCallDelay();
          if (savedCallDelay > 0) {
            // This will be handled by the call delay hooks
          }

          localStorageRestoredRef.current = true;
        } catch (error) {
          console.error('Error restoring state:', error);
        }
      }
    };

    restoreState();
  }, [leadsData.length, setSearchQuery]);

  // Check if we need to reset daily count (new day)
  useEffect(() => {
    const checkDailyReset = async () => {
      try {
        const shouldReset = await appStorage.shouldResetDailyCount();
        if (shouldReset) {
          // Reset daily call count logic can be added here
        }
      } catch (error) {
        console.error('Error checking daily reset:', error);
      }
    };

    checkDailyReset();
  }, []);

  // Memoize resetLeadsData to prevent infinite loops
  const memoizedResetLeadsData = useCallback((newLeads: Lead[]) => {
    resetLeadsData(newLeads);
  }, [resetLeadsData]);

  // Direct leads data update without navigation reset - now properly implemented
  const updateLeadsDataDirectlyMemoized = useCallback((updatedLeads: Lead[]) => {
    updateLeadsDataDirectly(updatedLeads);
  }, [updateLeadsDataDirectly]);

  // Only restore from localStorage when leads are ready
  useEffect(() => {
    if (
      leadsData.length > 0 && 
      leadsInitialized && 
      !localStorageRestoredRef.current
    ) {
      restoreFromLocalStorage(leadsData.length);
      localStorageRestoredRef.current = true;
    }
  }, [leadsData.length, leadsInitialized, restoreFromLocalStorage]);

  // Local reset functions - use the actual ones from useLeadNavigation
  const resetCallCount = useCallback(async (lead: Lead) => {
    try {
      await leadNavigationResetCallCount(lead);
    } catch (error) {
      console.error('Error in resetCallCount:', error);
    }
  }, [leadNavigationResetCallCount]);

  const resetAllCallCounts = useCallback(async () => {
    try {
      await leadNavigationResetAllCallCounts();
    } catch (error) {
      console.error('Error in resetAllCallCounts:', error);
    }
  }, [leadNavigationResetAllCallCounts]);

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
    getDelayDisplayType,
    updateNavigation,
    isLoaded
  };
};
