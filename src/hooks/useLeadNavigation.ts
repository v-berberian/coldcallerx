
import { useEffect } from 'react';
import { Lead } from '../types/lead';
import { useNavigationState } from './useNavigationState';
import { useFilters } from './useFilters';
import { useLeadsData } from './useLeadsData';
import { useLeadFiltering } from './useLeadFiltering';
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

  useEffect(() => {
    console.log('Filter change effect triggered', { timezoneFilter, callFilter });
    setFilterChanging(true);
    
    const baseLeadsBeforeFilter = getBaseLeads();
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
  }, [timezoneFilter, callFilter]);

  useEffect(() => {
    const baseLeads = getBaseLeads();
    if (currentIndex >= baseLeads.length && baseLeads.length > 0) {
      resetNavigation(0);
    }
  }, [timezoneFilter, callFilter, currentIndex]);

  const handleNext = () => {
    // Prevent navigation if filters are currently changing
    if (isFilterChanging) {
      console.log('Skipping navigation because filters are changing');
      return;
    }
    
    const baseLeads = getBaseLeads();
    let nextIndex;
    
    if (shuffleMode) {
      const uncalledLeads = baseLeads.filter(lead => !lead.called || lead.called === 0);
      
      if (uncalledLeads.length > 0) {
        const randomUncalledLead = uncalledLeads[Math.floor(Math.random() * uncalledLeads.length)];
        nextIndex = baseLeads.findIndex(lead => 
          lead.name === randomUncalledLead.name && lead.phone === randomUncalledLead.phone
        );
      } else {
        do {
          nextIndex = Math.floor(Math.random() * baseLeads.length);
        } while (nextIndex === currentIndex && baseLeads.length > 1);
      }
    } else {
      nextIndex = (currentIndex + 1) % baseLeads.length;
    }
    
    const leadToCall = baseLeads[nextIndex];
    updateNavigation(nextIndex);
    
    // Auto-call the specific lead we navigated to
    if (autoCall && leadToCall) {
      setTimeout(() => {
        if (!isFilterChanging) {
          console.log('Auto-calling lead:', leadToCall.name, leadToCall.phone);
          makeCall(leadToCall);
        }
      }, 50);
    }
  };

  const handlePrevious = () => {
    goToPrevious();
  };

  const selectLead = (lead: Lead) => {
    const baseLeads = getBaseLeads();
    const leadIndex = baseLeads.findIndex(l => l.name === lead.name && l.phone === lead.phone);
    if (leadIndex !== -1) {
      resetNavigation(leadIndex);
    }
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
    handlePrevious,
    resetCallCount,
    resetAllCallCounts,
    selectLead,
    toggleTimezoneFilter,
    toggleCallFilter,
    toggleShuffle,
    toggleAutoCall
  };
};
