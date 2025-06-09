import { useEffect } from 'react';
import { Lead } from '../types/lead';
import { useNavigationState } from './useNavigationState';
import { useFilters } from './useFilters';
import { useLeadsData } from './useLeadsData';
import { useLeadFiltering } from './useLeadFiltering';
import { useAutoCall } from './useAutoCall';
import { useNavigation } from './useNavigation';
import { filterLeadsByTimezone } from '../utils/timezoneUtils';

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
    resetCallCount,
    resetAllCallCounts
  } = useLeadsData(initialLeads);

  const { getBaseLeads } = useLeadFiltering(leadsData, timezoneFilter, callFilter);

  const { isAutoCallInProgress, executeAutoCall } = useAutoCall(makeCall);

  const { handleNext: navigationHandleNext, handlePrevious, selectLead } = useNavigation(
    currentIndex,
    updateNavigation,
    resetNavigation,
    shuffleMode,
    callFilter,
    isFilterChanging,
    isAutoCallInProgress
  );

  useEffect(() => {
    // Don't auto-navigate during auto-call operations or when filters are changing
    // IMPORTANT: Also don't navigate if auto-call is enabled to prevent double navigation
    if (isAutoCallInProgress || isFilterChanging || autoCall) {
      console.log('Skipping filter navigation because auto-call is in progress, filters are changing, or auto-call is enabled');
      return;
    }

    console.log('Filter change effect triggered', { timezoneFilter, callFilter });
    setFilterChanging(true);
    
    const baseLeadsBeforeFilter = filterLeadsByTimezone(leadsData, 'ALL');
    const currentlyViewedLead = baseLeadsBeforeFilter[currentIndex];
    
    console.log('Currently viewed lead:', currentlyViewedLead?.name);
    
    let newFilteredLeads = filterLeadsByTimezone(leadsData, timezoneFilter);
    if (callFilter === 'UNCALLED') {
      newFilteredLeads = newFilteredLeads.filter(lead => !lead.called || lead.called === 0);
    }
    
    console.log('New filtered leads count:', newFilteredLeads.length);
    
    if (currentlyViewedLead) {
      const currentLeadMatchesNewFilter = newFilteredLeads.some(lead => 
        lead.name === currentlyViewedLead.name && lead.phone === currentlyViewedLead.phone
      );
      
      if (currentLeadMatchesNewFilter) {
        const newIndexOfCurrentLead = newFilteredLeads.findIndex(lead => 
          lead.name === currentlyViewedLead.name && lead.phone === currentlyViewedLead.phone
        );
        console.log('Current lead matches new filter, keeping at index:', newIndexOfCurrentLead);
        setCurrentIndex(newIndexOfCurrentLead);
        setCardKey(prev => prev + 1);
        setTimeout(() => setFilterChanging(false), 100);
        return;
      }
      
      const originalIndex = leadsData.findIndex(lead => 
        lead.name === currentlyViewedLead.name && lead.phone === currentlyViewedLead.phone
      );
      
      console.log('Original index of current lead:', originalIndex);
      
      let nextIndex = 0;
      let foundNextLead = false;
      
      for (let i = originalIndex + 1; i < leadsData.length; i++) {
        const leadAtIndex = leadsData[i];
        const indexInFiltered = newFilteredLeads.findIndex(filteredLead => 
          filteredLead.name === leadAtIndex.name && filteredLead.phone === leadAtIndex.phone
        );
        
        if (indexInFiltered !== -1) {
          nextIndex = indexInFiltered;
          foundNextLead = true;
          console.log('Found next lead after current position at filtered index:', nextIndex, 'lead:', leadAtIndex.name);
          break;
        }
      }
      
      if (!foundNextLead) {
        console.log('No lead found after current position, wrapping to beginning');
        for (let i = 0; i <= originalIndex; i++) {
          const leadAtIndex = leadsData[i];
          const indexInFiltered = newFilteredLeads.findIndex(filteredLead => 
            filteredLead.name === leadAtIndex.name && filteredLead.phone === leadAtIndex.phone
          );
          
          if (indexInFiltered !== -1) {
            nextIndex = indexInFiltered;
            console.log('Found wrapped lead at filtered index:', nextIndex, 'lead:', leadAtIndex.name);
            break;
          }
        }
      }
      
      setCurrentIndex(nextIndex);
      setCardKey(prev => prev + 1);
    } else if (newFilteredLeads.length > 0) {
      console.log('No current lead, setting to first');
      setCurrentIndex(0);
      setCardKey(prev => prev + 1);
    }
    
    setTimeout(() => setFilterChanging(false), 100);
  }, [timezoneFilter, callFilter, leadsData]);

  useEffect(() => {
    const baseLeads = getBaseLeads();
    if (currentIndex >= baseLeads.length && baseLeads.length > 0) {
      resetNavigation(0);
    }
  }, [timezoneFilter, callFilter, currentIndex]);

  const handleNext = () => {
    // Prevent next if auto-call is in progress
    if (isAutoCallInProgress) {
      console.log('Preventing next navigation because auto-call is in progress');
      return;
    }
    
    const baseLeads = getBaseLeads();
    navigationHandleNext(baseLeads, autoCall, executeAutoCall);
  };

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
