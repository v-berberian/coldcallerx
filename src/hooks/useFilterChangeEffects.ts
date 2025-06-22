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
        
        const originalIndex = leadsData.findIndex(lead => 
          lead.name === currentlyViewedLead.name && lead.phone === currentlyViewedLead.phone
        );
        
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
            break;
          }
        }
        
        if (!foundNextLead) {
          for (let i = 0; i <= originalIndex; i++) {
            const leadAtIndex = leadsData[i];
            const indexInFiltered = newFilteredLeads.findIndex(filteredLead => 
              filteredLead.name === leadAtIndex.name && filteredLead.phone === leadAtIndex.phone
            );
            
            if (indexInFiltered !== -1) {
              nextIndex = indexInFiltered;
              break;
            }
          }
        }
        
        setCurrentIndex(nextIndex);
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
