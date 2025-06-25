import { useEffect } from 'react';
import { Lead, TimezoneFilter, CallFilter } from '../types/lead';
import { filterLeadsByTimezone } from '../utils/timezoneUtils';

export const useFilterChangeEffects = (
  leadsData: Lead[],
  timezoneFilter: TimezoneFilter,
  callFilter: CallFilter,
  currentIndex: number,
  isAutoCallInProgress: boolean,
  isFilterChanging: boolean,
  setFilterChanging: (isChanging: boolean) => void,
  setCurrentIndex: (index: number) => void,
  getBaseLeads: () => Lead[],
  resetNavigation: (index: number) => void
) => {
  useEffect(() => {
    // Don't auto-navigate during auto-call operations or when filters are changing
    // IMPORTANT: Don't navigate during auto-call to prevent jumping away from called leads
    if (isAutoCallInProgress || isFilterChanging) {
      return;
    }

    // Early return if leadsData is not ready
    if (!leadsData || leadsData.length === 0) {
      return;
    }

    setFilterChanging(true);
    
    try {
      const baseLeadsBeforeFilter = filterLeadsByTimezone(leadsData, 'ALL');
      const currentlyViewedLead = baseLeadsBeforeFilter[currentIndex];
      
      let newFilteredLeads = filterLeadsByTimezone(leadsData, timezoneFilter);
      if (callFilter === 'UNCALLED') {
        newFilteredLeads = newFilteredLeads.filter(lead => !lead.lastCalled);
      }
      
      // Safety check: if no leads match the filter, reset to first available lead
      if (newFilteredLeads.length === 0) {
        setCurrentIndex(0);
        setTimeout(() => {
          setFilterChanging(false);
        }, 100);
        return;
      }
      
      if (currentlyViewedLead) {
        const currentLeadMatchesNewFilter = newFilteredLeads.some(lead => 
          lead.name === currentlyViewedLead.name && lead.phone === currentlyViewedLead.phone
        );
        
        if (currentLeadMatchesNewFilter) {
          const newIndexOfCurrentLead = newFilteredLeads.findIndex(lead => 
            lead.name === currentlyViewedLead.name && lead.phone === currentlyViewedLead.phone
          );
          setCurrentIndex(newIndexOfCurrentLead);
          setTimeout(() => {
            setFilterChanging(false);
          }, 100);
          return;
        }
        
        // --- Improved: Find the closest lead in the new filtered list by original index ---
        // Map each filtered lead to its index in the original leadsData
        const filteredWithOriginalIndices = newFilteredLeads.map(lead => ({
          lead,
          originalIndex: leadsData.findIndex(l => l.name === lead.name && l.phone === lead.phone)
        }));
        // Find the one with the minimal absolute difference to currentIndex
        let minDiff = Infinity;
        let closestIndex = 0;
        for (let i = 0; i < filteredWithOriginalIndices.length; i++) {
          const diff = Math.abs(filteredWithOriginalIndices[i].originalIndex - currentIndex);
          if (
            diff < minDiff ||
            (diff === minDiff && filteredWithOriginalIndices[i].originalIndex > currentIndex) // prefer after if tied
          ) {
            minDiff = diff;
            closestIndex = i;
          }
        }
        setCurrentIndex(closestIndex);
      } else if (newFilteredLeads.length > 0) {
        setCurrentIndex(0);
      }
    } catch (error) {
      // Fallback: reset to first lead if there's an error
      setCurrentIndex(0);
    }
    
    setTimeout(() => {
      setFilterChanging(false);
    }, 100);
  }, [timezoneFilter, callFilter]); // Remove leadsData dependency to prevent navigation when leads are called

  useEffect(() => {
    const baseLeads = getBaseLeads();
    // Add null check for baseLeads
    if (baseLeads && currentIndex >= baseLeads.length && baseLeads.length > 0) {
      resetNavigation(0);
    }
  }, [timezoneFilter, callFilter, currentIndex]);
};
