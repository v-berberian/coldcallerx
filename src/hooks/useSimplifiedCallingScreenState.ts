import { useState, useCallback, useEffect } from 'react';
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

  // Initialize hooks - only pass leads to useLeadNavigation
  const {
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
    restoreSessionState,
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

  // Restore session state from cloud when available
  useEffect(() => {
    if (sessionState && leadsData.length > 0 && leadsInitialized && componentReady) {
      console.log('useSimplifiedCallingScreenState: Restoring session state from cloud');
      restoreSessionState(sessionState);
    }
  }, [sessionState, leadsData.length, leadsInitialized, componentReady, restoreSessionState]);

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
