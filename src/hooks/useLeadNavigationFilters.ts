
import { useCallback } from 'react';
import { useFilters } from './useFilters';
import { useCallDelay } from './useCallDelay';

export const useLeadNavigationFilters = () => {
  const {
    timezoneFilter,
    callFilter,
    shuffleMode,
    autoCall,
    isFilterChanging,
    toggleTimezoneFilter,
    toggleCallFilter,
    toggleShuffle,
    toggleAutoCall,
    setFilterChanging
  } = useFilters();

  const { callDelay, toggleCallDelay, resetCallDelay, getDelayDisplayType } = useCallDelay();

  const resetShownLeadsWrapper = useCallback((resetShownLeads: () => void) => {
    return () => {
      resetShownLeads();
    };
  }, []);

  const toggleShuffleWrapper = useCallback((resetShownLeads: () => void) => {
    return () => {
      toggleShuffle();
      resetShownLeads();
    };
  }, [toggleShuffle]);

  const toggleCallFilterWrapper = useCallback((resetShownLeads: () => void) => {
    return () => {
      toggleCallFilter();
      resetShownLeads();
    };
  }, [toggleCallFilter]);

  const toggleTimezoneFilterWrapper = useCallback((resetShownLeads: () => void) => {
    return () => {
      toggleTimezoneFilter();
      resetShownLeads();
    };
  }, [toggleTimezoneFilter]);

  const toggleAutoCallWrapper = useCallback((resetAutoCall: () => void) => {
    return () => {
      const wasAutoCallOn = autoCall;
      toggleAutoCall();
      
      // If turning auto-call OFF, reset any active countdown
      if (wasAutoCallOn) {
        resetAutoCall();
        console.log('Auto-call disabled, resetting countdown');
      }
    };
  }, [autoCall, toggleAutoCall]);

  return {
    timezoneFilter,
    callFilter,
    shuffleMode,
    autoCall,
    callDelay,
    isFilterChanging,
    getDelayDisplayType,
    setFilterChanging,
    toggleTimezoneFilter: toggleTimezoneFilterWrapper,
    toggleCallFilter: toggleCallFilterWrapper,
    toggleShuffle: toggleShuffleWrapper,
    toggleAutoCall: toggleAutoCallWrapper,
    toggleCallDelay,
    resetCallDelay,
    resetShownLeadsWrapper
  };
};
