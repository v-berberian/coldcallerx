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
}

export const useLocalCallingScreenState = ({ leads, onCallMade }: UseLocalCallingScreenStateProps) => {
  const [componentReady, setComponentReady] = useState(false);
  const [leadsInitialized, setLeadsInitialized] = useState(false);
  const localStorageRestoredRef = useRef(false);

  // Use the new async hooks
  const { currentIndex, updateNavigation, isLoaded: navLoaded, historyIndex, goToPrevious, resetNavigation, setCurrentIndex, restoreFromLocalStorage, syncFromCloudSession } = useNavigationState();
  const { leadsData, setLeadsData, isLoaded: leadsLoaded } = useLeadsData(leads);

  // Debug effect to track currentIndex changes
  useEffect(() => {
    console.log('useLocalCallingScreenState: currentIndex changed to:', currentIndex);
  }, [currentIndex]);

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
    getDelayDisplayType
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
    syncFromCloudSession
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
    const saveLeadsData = async () => {
      if (leadsData.length > 0) {
        try {
          await appStorage.saveLeadsData(leadsData);
        } catch (error) {
          console.error('Error saving leads data:', error);
        }
      }
    };
    saveLeadsData();
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
        console.log('Restoring app state from localStorage');
        
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
            console.log('Restoring timezone filter:', savedTimezoneFilter);
          }

          const savedCallFilter = await appStorage.getCallFilter();
          if (savedCallFilter !== 'all') {
            console.log('Restoring call filter:', savedCallFilter);
          }

          // Restore app modes
          const savedShuffleMode = await appStorage.getShuffleMode();
          if (savedShuffleMode) {
            console.log('Restoring shuffle mode:', savedShuffleMode);
          }

          const savedAutoCall = await appStorage.getAutoCall();
          if (savedAutoCall) {
            console.log('Restoring auto call mode:', savedAutoCall);
          }

          const savedCallDelay = await appStorage.getCallDelay();
          if (savedCallDelay > 0) {
            console.log('Restoring call delay:', savedCallDelay);
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
          console.log('New day detected, resetting daily call count');
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
    getDelayDisplayType,
    updateNavigation,
    isLoaded
  };
};
