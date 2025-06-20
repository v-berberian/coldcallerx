
import { useState, useCallback } from 'react';
import { Lead } from '../types/lead';
import { useSearchState } from '../components/SearchState';
import { useLeadNavigation } from './useLeadNavigation';

interface UseCallingScreenStateProps {
  leads: Lead[];
}

export const useCallingScreenState = ({ leads }: UseCallingScreenStateProps) => {
  const [componentReady, setComponentReady] = useState(false);
  const [leadsInitialized, setLeadsInitialized] = useState(false);

  // Initialize hooks - pass leads with proper structure to useLeadNavigation
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
    resetLeadsData
  } = useLeadNavigation({ initialLeads: leads });

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
