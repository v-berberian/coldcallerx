
import { useState, useCallback, useEffect, useRef } from 'react';
import { Lead } from '../types/lead';
import { SessionState } from '@/services/sessionService';
import { useSearchState } from '../components/SearchState';
import { useLeadNavigation } from './useLeadNavigation';

interface UseSimplifiedCallingScreenStateProps {
  leads: Lead[];
  sessionState?: SessionState;
}

export const useSimplifiedCallingScreenState = ({ leads, sessionState }: UseSimplifiedCallingScreenStateProps) => {
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
    restoreFromLocalStorage,
    getDelayDisplayType
  } = useLeadNavigation(leads);

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

  // Memoize resetLeadsData to prevent infinite loops
  const memoizedResetLeadsData = useCallback((newLeads: Lead[]) => {
    resetLeadsData(newLeads);
  }, [resetLeadsData]);

  // Only restore from localStorage when leads are ready - no cloud session restoration
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
    resetCallCount: () => {}, // These will be handled by parent
    resetAllCallCounts: () => {},
    searchQuery,
    setSearchQuery,
    searchResults,
    showAutocomplete,
    setShowAutocomplete,
    clearSearch,
    handleSearchFocus,
    handleSearchBlur,
    getDelayDisplayType
  };
};
