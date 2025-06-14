
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
    resetLeadsData,
    updateCurrentIndexSilently
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
    toggleAutoCall: originalToggleAutoCall,
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

  // Enhanced auto-call toggle that triggers countdown immediately
  const toggleAutoCall = useCallback(() => {
    console.log('TOGGLE AUTO-CALL: Current autoCall state:', autoCall);
    
    const wasAutoCallOff = !autoCall;
    originalToggleAutoCall();
    
    // If we're turning auto-call ON and we have a current lead, trigger countdown immediately
    if (wasAutoCallOff && componentReady && leadsInitialized) {
      console.log('TOGGLE AUTO-CALL: Turning ON auto-call, triggering immediate countdown');
      
      // Small delay to allow state to update
      setTimeout(() => {
        const currentLeads = getBaseLeads();
        if (currentLeads.length > 0 && currentIndex >= 0 && currentIndex < currentLeads.length) {
          const currentLead = currentLeads[currentIndex];
          console.log('TOGGLE AUTO-CALL: Triggering countdown for current lead:', currentLead.name);
          executeAutoCall(currentLead);
        } else {
          console.log('TOGGLE AUTO-CALL: No valid current lead found');
        }
      }, 100);
    } else if (!wasAutoCallOff) {
      // If we're turning auto-call OFF, reset any active countdown
      console.log('TOGGLE AUTO-CALL: Turning OFF auto-call, resetting countdown');
      resetAutoCall();
    }
  }, [autoCall, originalToggleAutoCall, componentReady, leadsInitialized, getBaseLeads, currentIndex, executeAutoCall, resetAutoCall]);

  // Handle real-time session updates from other devices/tabs - PRESERVE card state
  const handleSessionUpdate = useCallback((updatedSession: SessionState) => {
    console.log('Applying real-time session update:', updatedSession);
    
    // Update current index WITHOUT forcing card reload
    if (updatedSession.currentLeadIndex !== undefined && leadsData.length > 0) {
      const validIndex = Math.max(0, Math.min(updatedSession.currentLeadIndex, leadsData.length - 1));
      console.log('Real-time update: Updating index to', validIndex, 'without card reset');
      updateCurrentIndexSilently(validIndex);
    }
  }, [leadsData.length, updateCurrentIndexSilently]);

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
