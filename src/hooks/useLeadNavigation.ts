
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

  const { isAutoCallInProgress, executeAutoCall } = useAutoCall(makeCall, markLeadAsCalled);

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
    currentIndex,
    getBaseLeads,
    updateNavigation,
    executeAutoCall,
    isAutoCallInProgress,
    shuffleMode,
    callFilter
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

  const handleNextWrapper = () => {
    if (autoCall) {
      // Use auto-call navigation (which includes shuffle logic)
      handleNext();
    } else {
      // Use manual navigation (which also includes shuffle logic)
      const baseLeads = getBaseLeads();
      navigationHandleNext(baseLeads);
    }
  };

  const handlePreviousWrapper = () => {
    handlePrevious(goToPrevious);
  };

  const selectLeadWrapper = (lead: Lead) => {
    const baseLeads = getBaseLeads();
    // Pass both baseLeads and full leadsData array
    selectLead(lead, baseLeads, leadsData);
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
    handleNext: handleNextWrapper,
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
