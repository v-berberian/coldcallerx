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
    // Add a small delay to prevent race conditions when quickly toggling filters and auto call
    const timeoutId = setTimeout(() => {
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
            // Current lead is still visible in new filter, stay on it
            const newIndexOfCurrentLead = newFilteredLeads.findIndex(lead => 
              lead.name === currentlyViewedLead.name && lead.phone === currentlyViewedLead.phone
            );
            setCurrentIndex(newIndexOfCurrentLead);
            setTimeout(() => {
              setFilterChanging(false);
            }, 100);
            return;
          }
          
          // Current lead is not visible in new filter - need to find appropriate replacement
          if (callFilter === 'UNCALLED') {
            // Switching to UNCALLED filter - find the last uncalled lead before current position
            const allLeadsWithTimezone = filterLeadsByTimezone(leadsData, timezoneFilter);
            let lastUncalledIndex = -1;
            
            // Find the last uncalled lead before the current position
            for (let i = currentIndex - 1; i >= 0; i--) {
              const lead = allLeadsWithTimezone[i];
              if (lead && !lead.lastCalled) {
                lastUncalledIndex = i;
                break;
              }
            }
            
            if (lastUncalledIndex !== -1) {
              // Find this lead in the new filtered list
              const targetLead = allLeadsWithTimezone[lastUncalledIndex];
              const newIndex = newFilteredLeads.findIndex(lead => 
                lead.name === targetLead.name && lead.phone === targetLead.phone
              );
              if (newIndex !== -1) {
                setCurrentIndex(newIndex);
              } else {
                // Fallback to first uncalled lead
                setCurrentIndex(0);
              }
            } else {
              // No uncalled leads before current position, go to first uncalled lead
              setCurrentIndex(0);
            }
          } else {
            // Switching to ALL filter - find the same lead in the full list
            const allLeadsWithTimezone = filterLeadsByTimezone(leadsData, timezoneFilter);
            const newIndex = allLeadsWithTimezone.findIndex(lead => 
              lead.name === currentlyViewedLead.name && lead.phone === currentlyViewedLead.phone
            );
            if (newIndex !== -1) {
              setCurrentIndex(newIndex);
            } else {
              // Fallback to first lead
              setCurrentIndex(0);
            }
          }
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
    }, 50); // Small delay to prevent race conditions

    return () => {
      clearTimeout(timeoutId);
    };
  }, [timezoneFilter, callFilter]); // Remove leadsData dependency to prevent navigation when leads are called

  useEffect(() => {
    const baseLeads = getBaseLeads();
    // Add null check for baseLeads
    if (baseLeads && currentIndex >= baseLeads.length && baseLeads.length > 0) {
      resetNavigation(0);
    }
  }, [timezoneFilter, callFilter, currentIndex]);
};
