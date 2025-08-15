import { Lead } from '../types/lead';
import { useFilters } from './useFilters';
import { useLeadsData } from './useLeadsData';
import { useLeadFiltering } from './useLeadFiltering';
import { useAutoCall } from './useAutoCall';
import { useCallDelay } from './useCallDelay';
import { useNavigation } from './useNavigation';
import { useFilterChangeEffects } from './useFilterChangeEffects';
import { useLeadNavigationState } from './useLeadNavigationState';
import { useLeadNavigationActions } from './useLeadNavigationActions';
import { useLeadNavigationEffects } from './useLeadNavigationEffects';
import { useLeadNavigationWrappers } from './useLeadNavigationWrappers';
import { useLeadNavigationReset } from './useLeadNavigationReset';
import { useNavigationState } from './useNavigationState';

interface UseLeadNavigationProps {
  initialLeads: Lead[];
  onCallMade?: () => void;
  refreshTrigger?: number;
  currentCSVId?: string | null;
  // Navigation state from parent
  currentIndex: number;
  historyIndex: number;
  updateNavigation: (index: number) => void;
  updateNavigationWithHistory: (index: number, addToHistory?: boolean) => void;
  goToPrevious: () => boolean;
  goToPreviousFromHistory: () => boolean;
  resetNavigation: (index: number) => void;
  setCurrentIndex: (index: number) => void;
  restoreFromLocalStorage: (totalLeads: number) => Promise<void>;
  syncFromCloudSession: (index: number) => void;
}

const useLeadNavigationImpl = ({ 
  initialLeads, 
  onCallMade,
  refreshTrigger = 0,
  currentIndex,
  historyIndex,
  updateNavigation,
  updateNavigationWithHistory,
  goToPrevious,
  goToPreviousFromHistory,
  resetNavigation,
  setCurrentIndex,
  restoreFromLocalStorage,
  syncFromCloudSession
}: UseLeadNavigationProps) => {
  const {
    shouldAutoCall,
    setShouldAutoCall,
    shownLeadsInShuffle,
    setShownLeadsInShuffle,
    callMadeToCurrentLead,
    setCallMadeToCurrentLead,
    currentLeadForAutoCall,
    setCurrentLeadForAutoCall,
    resetShownLeads,
    resetCallState,
    callMadeLeadKey,
    setCallMadeLeadKey
  } = useLeadNavigationState();

  const {
    timezoneFilter,
    callFilter,
    temperatureFilter,
    shuffleMode,
    autoCall,
    isFilterChanging,
    toggleTimezoneFilter,
    toggleCallFilter,
    setTemperatureFilterValue,
    toggleShuffle,
    toggleAutoCall,
    setFilterChanging
  } = useFilters();

  const { callDelay, toggleCallDelay, resetCallDelay, getDelayDisplayType } = useCallDelay();

  const {
    leadsData,
    setLeadsData,
    makeCall: originalMakeCall,
    markLeadAsCalled,
    markLeadAsCalledOnNavigation,
    resetCallCount,
    resetAllCallCounts
  } = useLeadsData(initialLeads, refreshTrigger);

  // Wrap makeCall to include daily call tracking
  const makeCall = (lead: Lead, markAsCalled: boolean = true, onCallMade?: () => void, onTransitionDetected?: () => void) => {
    originalMakeCall(lead, markAsCalled, onCallMade, onTransitionDetected);
  };

  const { getBaseLeads } = useLeadFiltering(leadsData, timezoneFilter, callFilter);

  const { isAutoCallInProgress, isCountdownActive, countdownTime, executeAutoCall, handleCountdownComplete, resetAutoCall, shouldBlockNavigation } = useAutoCall(makeCall, callDelay);

  // Enhanced toggleCallDelay wrapper that resets countdown when active
  const toggleCallDelayWrapper = () => {
    // If countdown is active, reset it first
    if (isCountdownActive) {
      resetAutoCall();
    }
    // Then toggle the delay setting
    toggleCallDelay();
  };

  const { handleNext, handlePrevious, selectLead } = useNavigation(
    currentIndex,
    updateNavigation,
    updateNavigationWithHistory,
    resetNavigation,
    shuffleMode,
    callFilter,
    isFilterChanging,
    isAutoCallInProgress,
    shouldBlockNavigation(),
    // Pass the markLeadAsCalledOnNavigation function but don't call it unconditionally
    markLeadAsCalledOnNavigation,
    shownLeadsInShuffle,
    setShownLeadsInShuffle,
    toggleCallFilter,
    toggleTimezoneFilter
  );

  const { handleNextWrapper, handlePreviousWrapper, selectLeadWrapper } = useLeadNavigationActions({
    currentIndex,
    updateNavigation,
    resetNavigation,
    shuffleMode,
    callFilter,
    isFilterChanging,
    isAutoCallInProgress,
    shouldBlockNavigation: shouldBlockNavigation(),
    markLeadAsCalledOnNavigation,
    shownLeadsInShuffle,
    setShownLeadsInShuffle,
    handleNext,
    handlePrevious,
    selectLead,
    setCallMadeToCurrentLead,
    callMadeLeadKey,
    setCallMadeLeadKey,
    autoCall,
    setShouldAutoCall,
    goToPrevious,
    goToPreviousFromHistory,
    callMadeToCurrentLead,
    callDelay
  });

  const { makeCallWrapper, handleCountdownCompleteWrapper } = useLeadNavigationEffects({
    makeCall,
    markLeadAsCalledOnNavigation,
    setCallMadeToCurrentLead,
    setCallMadeLeadKey,
    executeAutoCall,
    handleCountdownComplete,
    resetAutoCall,
    currentLeadForAutoCall,
    setCurrentLeadForAutoCall
  });

  const {
    toggleShuffleWrapper,
    toggleCallFilterWrapper,
    toggleTimezoneFilterWrapper,
    toggleAutoCallWrapper
  } = useLeadNavigationWrappers({
    toggleShuffle,
    toggleCallFilter,
    toggleTimezoneFilter,
    toggleAutoCall,
    resetShownLeads,
    resetAutoCall,
    autoCall
  });

  const { resetLeadsData } = useLeadNavigationReset({
    setLeadsData,
    resetNavigation,
    resetShownLeads,
    resetCallState
  });

  useFilterChangeEffects(
    leadsData,
    timezoneFilter,
    callFilter,
    currentIndex,
    isAutoCallInProgress,
    isFilterChanging,
    setFilterChanging,
    setCurrentIndex,
    getBaseLeads,
    resetNavigation,
    updateNavigationWithHistory
  );

  return {
    leadsData,
    currentIndex,
    timezoneFilter,
    callFilter,
    temperatureFilter,
    shuffleMode,
    autoCall,
    callDelay,
    historyIndex,
    shouldAutoCall,
    setShouldAutoCall,
    currentLeadForAutoCall,
    setCurrentLeadForAutoCall,
    isCountdownActive,
    isFilterChanging,
    getBaseLeads,
    getDelayDisplayType,
    makeCall: makeCallWrapper,
    executeAutoCall,
    handleCountdownComplete: handleCountdownCompleteWrapper,
    handleNext: handleNextWrapper,
    handlePrevious: handlePreviousWrapper,
    resetCallCount,
    resetAllCallCounts,
    selectLead: selectLeadWrapper,
    toggleTimezoneFilter: toggleTimezoneFilterWrapper,
    toggleCallFilter: toggleCallFilterWrapper,
    setTemperatureFilterValue,
    toggleShuffle: toggleShuffleWrapper,
    toggleAutoCall: toggleAutoCallWrapper,
    toggleCallDelay: toggleCallDelayWrapper,
    resetCallDelay,
    resetLeadsData,
    updateLeadsDataDirectly: setLeadsData, // Expose direct leads data update
    restoreFromLocalStorage,
    syncFromCloudSession,
    countdownTime
  };
};

// Backward-compatible wrapper: allow calling with just an array of leads
export function useLeadNavigation(arg: any): any {
  if (Array.isArray(arg)) {
    const {
      currentIndex,
      historyIndex,
      updateNavigation,
      updateNavigationWithHistory,
      goToPrevious,
      goToPreviousFromHistory,
      resetNavigation,
      setCurrentIndex,
      restoreFromLocalStorage,
      syncFromCloudSession
    } = useNavigationState();

    return useLeadNavigationImpl({
      initialLeads: arg,
      onCallMade: undefined,
      refreshTrigger: 0,
      currentIndex,
      historyIndex,
      updateNavigation,
      updateNavigationWithHistory,
      goToPrevious,
      goToPreviousFromHistory,
      resetNavigation,
      setCurrentIndex,
      restoreFromLocalStorage,
      syncFromCloudSession
    });
  }

  return useLeadNavigationImpl(arg);
}
