
import { Lead } from '../types/lead';
import { useNavigationState } from './useNavigationState';
import { useFilters } from './useFilters';
import { useLeadsData } from './useLeadsData';
import { useLeadFiltering } from './useLeadFiltering';
import { useAutoCall } from './useAutoCall';
import { useNavigation } from './useNavigation';
import { useAutoCallNavigation } from './useAutoCallNavigation';
import { useFilterChangeEffects } from './useFilterChangeEffects';

export const useLeadNavigation = (initialLeads: Lead[]) => {
  const {
    currentIndex,
    cardKey,
    historyIndex,
    updateNavigation,
    goToPrevious,
    resetNavigation,
    setCurrentIndex,
    setCardKey
  } = useNavigationState();

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

  const {
    leadsData,
    makeCall,
    markLeadAsCalled,
    resetCallCount,
    resetAllCallCounts
  } = useLeadsData(initialLeads);

  const { getBaseLeads } = useLeadFiltering(leadsData, timezoneFilter, callFilter);

  const { isAutoCallInProgress, pendingCallLead, executeAutoCall, markPendingCallAsCompleted } = useAutoCall(makeCall, markLeadAsCalled);

  const { handleNext: navigationHandleNext, handlePrevious, selectLead } = useNavigation(
    currentIndex,
    updateNavigation,
    resetNavigation,
    shuffleMode,
    callFilter,
    isFilterChanging,
    isAutoCallInProgress
  );

  const { handleNext } = useAutoCallNavigation(
    autoCall,
    pendingCallLead,
    currentIndex,
    markPendingCallAsCompleted,
    getBaseLeads,
    updateNavigation,
    executeAutoCall,
    isAutoCallInProgress,
    navigationHandleNext
  );

  useFilterChangeEffects(
    leadsData,
    timezoneFilter,
    callFilter,
    currentIndex,
    isAutoCallInProgress,
    isFilterChanging,
    setFilterChanging,
    setCurrentIndex,
    setCardKey,
    getBaseLeads,
    resetNavigation
  );

  const handlePreviousWrapper = () => {
    handlePrevious(goToPrevious);
  };

  const selectLeadWrapper = (lead: Lead) => {
    const baseLeads = getBaseLeads();
    selectLead(lead, baseLeads);
  };

  return {
    leadsData,
    currentIndex,
    cardKey,
    timezoneFilter,
    callFilter,
    shuffleMode,
    autoCall,
    historyIndex,
    getBaseLeads,
    makeCall,
    handleNext,
    handlePrevious: handlePreviousWrapper,
    resetCallCount,
    resetAllCallCounts,
    selectLead: selectLeadWrapper,
    toggleTimezoneFilter,
    toggleCallFilter,
    toggleShuffle,
    toggleAutoCall
  };
};
