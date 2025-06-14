
import { useCallback } from 'react';
import { Lead } from '../types/lead';
import { SessionState } from '@/services/sessionService';
import { useSearchState } from '../components/SearchState';
import { useCallingScreenCore } from './useCallingScreenCore';
import { useSimplifiedNavigation } from './useSimplifiedNavigation';
import { useLeadsData } from './useLeadsData';
import { useAutoCall } from './useAutoCall';

interface UseSimplifiedCallingScreenStateProps {
  leads: Lead[];
  sessionState?: SessionState;
}

export const useSimplifiedCallingScreenState = ({ leads, sessionState }: UseSimplifiedCallingScreenStateProps) => {
  const {
    componentReady,
    setComponentReady,
    leadsInitialized,
    setLeadsInitialized,
    leadsData,
    setLeadsData,
    currentIndex,
    setCurrentIndex,
    cardKey,
    setCardKey,
    timezoneFilter,
    setTimezoneFilter,
    callFilter,
    setCallFilter,
    shuffleMode,
    setShuffleMode,
    autoCall,
    setAutoCall,
    callDelay,
    setCallDelay,
    shouldAutoCall,
    setShouldAutoCall,
    currentLeadForAutoCall,
    setCurrentLeadForAutoCall,
    isCountdownActive,
    setIsCountdownActive,
    countdownTime,
    setCountdownTime,
    navigationHistory,
    setNavigationHistory,
    historyIndex,
    setHistoryIndex,
    shownLeadsInShuffle,
    setShownLeadsInShuffle,
    resetLeadsData
  } = useCallingScreenCore({ leads, sessionState });

  const { makeCall, markLeadAsCalled, resetCallCount, resetAllCallCounts } = useLeadsData(leadsData);

  const {
    getFilteredLeads,
    handleNext,
    handlePrevious,
    selectLead
  } = useSimplifiedNavigation({
    leadsData,
    currentIndex,
    setCurrentIndex,
    setCardKey,
    timezoneFilter,
    callFilter,
    shuffleMode,
    navigationHistory,
    setNavigationHistory,
    historyIndex,
    setHistoryIndex,
    shownLeadsInShuffle,
    setShownLeadsInShuffle
  });

  const { executeAutoCall, handleCountdownComplete } = useAutoCall(makeCall, callDelay);

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
    getBaseLeads: getFilteredLeads, 
    leadsData, 
    timezoneFilter, 
    callFilter 
  });

  // Filter toggle functions
  const toggleTimezoneFilter = useCallback(() => {
    setTimezoneFilter(prev => prev === 'ALL' ? 'EST_CST' : 'ALL');
    setShownLeadsInShuffle(new Set()); // Reset shuffle tracking
  }, [setTimezoneFilter, setShownLeadsInShuffle]);

  const toggleCallFilter = useCallback(() => {
    setCallFilter(prev => prev === 'ALL' ? 'UNCALLED' : 'ALL');
    setShownLeadsInShuffle(new Set()); // Reset shuffle tracking
  }, [setCallFilter, setShownLeadsInShuffle]);

  const toggleShuffle = useCallback(() => {
    setShuffleMode(prev => !prev);
    setShownLeadsInShuffle(new Set()); // Reset shuffle tracking
  }, [setShuffleMode, setShownLeadsInShuffle]);

  const toggleAutoCall = useCallback(() => {
    setAutoCall(prev => !prev);
  }, [setAutoCall]);

  const toggleCallDelay = useCallback(() => {
    setCallDelay(prev => {
      const delays = [0, 5, 10, 15];
      const currentIndex = delays.indexOf(prev);
      return delays[(currentIndex + 1) % delays.length];
    });
  }, [setCallDelay]);

  const resetCallDelay = useCallback(() => {
    setCallDelay(15);
  }, [setCallDelay]);

  const getDelayDisplayType = useCallback(() => {
    if (callDelay === 0) return 'rocket';
    if (callDelay === 5) return '5s';
    if (callDelay === 10) return '10s';
    return 'timer';
  }, [callDelay]);

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
    getBaseLeads: getFilteredLeads,
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
    resetCallCount,
    resetAllCallCounts,
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
