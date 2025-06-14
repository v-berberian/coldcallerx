
import { useState, useCallback, useRef } from 'react';
import { Lead } from '../types/lead';
import { SessionState } from '@/services/sessionService';
import { useSearchState } from '../components/SearchState';
import { useCallingScreenCore } from './useCallingScreenCore';
import { useCallingScreenFilters } from './useCallingScreenFilters';
import { useCallingScreenNavigation } from './useCallingScreenNavigation';
import { useCallingScreenOperations } from './useCallingScreenOperations';
import { useRealtimeSessionSync } from './useRealtimeSessionSync';

interface UseSimplifiedCallingScreenStateProps {
  leads: Lead[];
  sessionState?: SessionState;
}

export const useSimplifiedCallingScreenState = ({ leads, sessionState }: UseSimplifiedCallingScreenStateProps) => {
  const {
    componentReady,
    leadsInitialized,
    leadsData,
    currentIndex,
    cardKey,
    setCurrentIndex,
    setCardKey,
    resetLeadsData
  } = useCallingScreenCore({ leads, sessionState });

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
    resetCallDelay
  } = useCallingScreenFilters({ leadsData });

  const {
    shouldAutoCall,
    setShouldAutoCall,
    currentLeadForAutoCall,
    setCurrentLeadForAutoCall,
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
    shouldBlockNavigation
  } = useCallingScreenNavigation({
    leadsData,
    makeCall: (lead: Lead) => console.log('Making call to:', lead.name, lead.phone),
    markLeadAsCalledOnNavigation: () => {},
    callDelay,
    shuffleMode,
    callFilter,
    isFilterChanging
  });

  const {
    makeCall,
    resetCallCount,
    resetAllCallCounts
  } = useCallingScreenOperations({
    leadsData,
    setCurrentIndex,
    setCardKey
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

  // Handle real-time session updates from other devices/tabs
  const handleSessionUpdate = useCallback((updatedSession: SessionState) => {
    console.log('Applying real-time session update:', updatedSession);
    
    // Update current index and force re-render
    if (updatedSession.currentLeadIndex !== undefined && leadsData.length > 0) {
      const validIndex = Math.max(0, Math.min(updatedSession.currentLeadIndex, leadsData.length - 1));
      setCurrentIndex(validIndex);
      setCardKey(prev => prev + 1);
    }
  }, [leadsData.length, setCurrentIndex, setCardKey]);

  // Memoize resetLeadsData to prevent infinite loops
  const memoizedResetLeadsData = useCallback((newLeads: Lead[]) => {
    resetLeadsData(newLeads);
  }, [resetLeadsData]);

  return {
    componentReady,
    leadsInitialized,
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
    getDelayDisplayType,
    handleSessionUpdate
  };
};
