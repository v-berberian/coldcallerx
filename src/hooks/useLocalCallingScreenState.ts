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
  const { currentIndex, updateNavigation, updateNavigationWithHistory, isLoaded: navLoaded, historyIndex, goToPrevious, goToPreviousFromHistory, resetNavigation, setCurrentIndex, restoreFromLocalStorage, syncFromCloudSession } = useNavigationState(refreshTrigger);
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
    isFilterChanging,
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
    updateNavigationWithHistory,
    goToPrevious,
    goToPreviousFromHistory,
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
      (async () => {
        try {
          const currentCSVId = await appStorage.getCurrentCSVId();
          // Only save if currentIndex is not 0, or if the user has actually navigated to 0 (not on initial load)
          // We'll use a ref to track if the index was ever set by user action
          if (currentCSVId) {
            if (currentIndex > 0) {
              await appStorage.saveCSVCurrentIndex(currentCSVId, currentIndex);
              console.log('💾 SAVED: Index', currentIndex, 'for CSV', currentCSVId);
            }
          } else {
            if (currentIndex > 0) {
              await appStorage.saveCurrentLeadIndex(currentIndex);
            }
          }
        } catch (error) {
          console.error('Error saving current index:', error);
        }
      })();
    }
  }, [leadsData, currentIndex]);

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

  // Note: Filter states are handled by useFilters hook automatically
  // The useFilters hook loads and applies filter states on initialization
  // So we don't need to manually save them here

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

          // Note: Filter states are handled by useFilters hook automatically
          // The useFilters hook loads and applies filter states on initialization
          // So we don't need to manually restore them here

          localStorageRestoredRef.current = true;
        } catch (error) {
          console.error('Error restoring state:', error);
        }
      }
    };

    restoreState();
  }, [leadsData.length, setSearchQuery]);

  // Memoize resetLeadsData to prevent infinite loops
  const memoizedResetLeadsData = useCallback((newLeads: Lead[]) => {
    resetLeadsData(newLeads);
  }, [resetLeadsData]);

  // Direct leads data update without navigation reset - now properly implemented
  const updateLeadsDataDirectlyMemoized = useCallback((updatedLeads: Lead[]) => {
    updateLeadsDataDirectly(updatedLeads);
  }, [updateLeadsDataDirectly]);

  // Only restore from localStorage when leads are ready and filtered
  useEffect(() => {
    if (
      leadsData.length > 0 && 
      leadsInitialized && 
      !localStorageRestoredRef.current
    ) {
      // Add a longer delay to ensure all state is stable before restoring
      const timer = setTimeout(async () => {
        try {
          // Get the filtered leads to ensure we have the correct total count
          const baseLeads = getBaseLeads();
          
          if (baseLeads.length > 0) {
            // Only restore if we don't already have a valid index
            if (currentIndex === 0) {
              await restoreFromLocalStorage(baseLeads.length);
            }
          }
          localStorageRestoredRef.current = true;
        } catch (error) {
          console.error('Error in delayed restoration:', error);
          localStorageRestoredRef.current = true;
        }
      }, 500); // Increased delay to 500ms
      
      return () => clearTimeout(timer);
    }
  }, [leadsData.length, leadsInitialized, restoreFromLocalStorage, getBaseLeads, currentIndex]);

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

  // Debug function to test current index saving
  const testCurrentIndexSave = useCallback(async () => {
    try {
      const currentCSVId = await appStorage.getCurrentCSVId();
      
      if (currentCSVId) {
        await appStorage.saveCSVCurrentIndex(currentCSVId, currentIndex);
        
        // Test retrieval
        const retrievedIndex = await appStorage.getCSVCurrentIndex(currentCSVId);
        console.log('🧪 TEST: Saved', currentIndex, 'retrieved', retrievedIndex, 'for CSV', currentCSVId);
      }
    } catch (error) {
      console.error('Error in test current index save:', error);
    }
  }, [currentIndex]);

  // Save current index when component unmounts or app is about to close
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Save current index immediately when app is about to close
      const saveCurrentIndex = async () => {
        try {
          const currentCSVId = await appStorage.getCurrentCSVId();
          // Only save if we have a valid index (not 0) and CSV ID
          if (currentCSVId && currentIndex > 0) {
            await appStorage.saveCSVCurrentIndex(currentCSVId, currentIndex);
          }
        } catch (error) {
          console.error('Error saving current index on app close:', error);
        }
      };
      saveCurrentIndex();
    };

    // Add event listener for beforeunload
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Cleanup function
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Also save when component unmounts, but only if we have a valid index
      if (currentIndex > 0) {
        handleBeforeUnload();
      }
    };
  }, [currentIndex]);

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
    isFilterChanging,
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
    isLoaded,
    testCurrentIndexSave
  };
};
