
import { Lead } from '../types/lead';
import { useNavigationState } from './useNavigationState';
import { useFilters } from './useFilters';
import { useLeadsData } from './useLeadsData';
import { useLeadFiltering } from './useLeadFiltering';
import { useAutoCall } from './useAutoCall';
import { useNavigation } from './useNavigation';
import { useFilterChangeEffects } from './useFilterChangeEffects';
import { useUncalledFilter } from './useUncalledFilter';

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
    setLeadsData,
    makeCall,
    markLeadAsCalled,
    resetCallCount,
    resetAllCallCounts
  } = useLeadsData(initialLeads);

  const {
    markLeadAsPendingCall,
    commitPendingCalls,
    clearPendingCalls,
    isLeadPendingCall
  } = useUncalledFilter();

  const { getBaseLeads } = useLeadFiltering(
    leadsData, 
    timezoneFilter, 
    callFilter,
    new Set() // We'll pass the actual pending calls when needed
  );

  const { isAutoCallInProgress, executeAutoCall } = useAutoCall(makeCall, markLeadAsPendingCall);

  const commitPendingCallsWrapper = () => {
    commitPendingCalls(leadsData, setLeadsData);
  };

  const { handleNext, handlePrevious, selectLead } = useNavigation(
    currentIndex,
    updateNavigation,
    resetNavigation,
    shuffleMode,
    callFilter,
    isAutoCallInProgress,
    autoCall,
    executeAutoCall,
    commitPendingCallsWrapper
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

  const handleCall = (lead: Lead) => {
    makeCall(lead);
    if (callFilter === 'UNCALLED') {
      markLeadAsPendingCall(lead);
    } else {
      markLeadAsCalled(lead);
    }
  };

  const handleNextWrapper = () => {
    const baseLeads = getBaseLeads();
    handleNext(baseLeads);
  };

  const handlePreviousWrapper = () => {
    handlePrevious(goToPrevious);
  };

  const selectLeadWrapper = (lead: Lead) => {
    const baseLeads = getBaseLeads();
    selectLead(lead, baseLeads, leadsData);
  };

  const resetLeadsData = (newLeads: Lead[]) => {
    const formattedLeads = newLeads.map(lead => ({
      ...lead,
      called: lead.called || 0,
      lastCalled: lead.lastCalled || undefined
    }));
    setLeadsData(formattedLeads);
    clearPendingCalls();
    resetNavigation(0);
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
    makeCall: handleCall,
    handleNext: handleNextWrapper,
    handlePrevious: handlePreviousWrapper,
    resetCallCount,
    resetAllCallCounts,
    selectLead: selectLeadWrapper,
    toggleTimezoneFilter,
    toggleCallFilter,
    toggleShuffle,
    toggleAutoCall,
    resetLeadsData,
    isLeadPendingCall
  };
};
