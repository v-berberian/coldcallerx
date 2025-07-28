import { useEffect, useRef } from 'react';
import { Lead, TimezoneFilter, CallFilter } from '../types/lead';
import { filterLeadsByTimezone } from '../utils/timezoneUtils';
import { getPhoneDigits } from '../utils/phoneUtils';

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
  resetNavigation: (index: number) => void,
  updateNavigationWithHistory: (index: number, addToHistory?: boolean) => void
) => {
  // Store the last viewed lead object to reference across filter changes
  const lastViewedLeadRef = useRef<Lead | null>(null);

  // Update the ref whenever currentIndex changes or leadsData updates
  useEffect(() => {
    if (leadsData && leadsData.length > 0 && currentIndex >= 0 && currentIndex < leadsData.length) {
      lastViewedLeadRef.current = leadsData[currentIndex];
    }
  }, [currentIndex, leadsData]);

  useEffect(() => {
    // Don't auto-navigate during auto-call operations to prevent jumping away from called leads
    if (isAutoCallInProgress) {
      return;
    }

    // Early return if leadsData is not ready
    if (!leadsData || leadsData.length === 0) {
      return;
    }

    setFilterChanging(true);
      
    try {
      // Use the previously stored lead object to avoid index mismatches after filtering
      const currentlyViewedLead = lastViewedLeadRef.current;
      
      let newFilteredLeads = filterLeadsByTimezone(leadsData, timezoneFilter);
      if (callFilter === 'UNCALLED') {
        newFilteredLeads = newFilteredLeads.filter(lead => !lead.lastCalled);
      }
      
      // Safety check: if no leads match the filter, reset to first available lead
      if (newFilteredLeads.length === 0) {
        updateNavigationWithHistory(0, false);
        setTimeout(() => {
          setFilterChanging(false);
        }, 100);
        return;
      }
      
      if (currentlyViewedLead) {
        const currentDigits = getPhoneDigits(currentlyViewedLead.phone);
        const currentLeadMatchesNewFilter = newFilteredLeads.some(lead => {
          return lead.name === currentlyViewedLead.name && getPhoneDigits(lead.phone) === currentDigits;
        });
        
        if (currentLeadMatchesNewFilter) {
          // Current lead is still visible in new filter, stay on it
          const newIndexOfCurrentLead = newFilteredLeads.findIndex(lead => 
            lead.name === currentlyViewedLead.name && getPhoneDigits(lead.phone) === currentDigits
          );
          updateNavigationWithHistory(newIndexOfCurrentLead, false);
          setTimeout(() => {
            setFilterChanging(false);
          }, 100);
          return;
        }
        
        // Current lead is not visible in new filter - need to find appropriate replacement
        if (callFilter === 'UNCALLED') {
          // Switching to UNCALLED filter - find the closest uncalled lead
          // First try to find an uncalled lead at or before the current position
          let closestUncalledIndex = -1;
          
          // Search backwards from current position to find the closest uncalled lead
          for (let i = currentIndex; i >= 0; i--) {
            const lead = leadsData[i]; // Use leadsData directly
            if (lead && !lead.lastCalled) {
              closestUncalledIndex = i;
              break;
            }
          }
          
          // If not found before current position, search forward
          if (closestUncalledIndex === -1) {
            for (let i = currentIndex + 1; i < leadsData.length; i++) {
              const lead = leadsData[i]; // Use leadsData directly
              if (lead && !lead.lastCalled) {
                closestUncalledIndex = i;
                break;
              }
            }
          }
          
          if (closestUncalledIndex !== -1) {
            // Find this lead in the new filtered list
            const targetLead = leadsData[closestUncalledIndex]; // Use leadsData directly
            const targetDigits = getPhoneDigits(targetLead.phone);
            const newIndex = newFilteredLeads.findIndex(lead => 
              lead.name === targetLead.name && getPhoneDigits(lead.phone) === targetDigits
            );
            if (newIndex !== -1) {
              updateNavigationWithHistory(newIndex, false); // Don't add to history since this is a filter change
            } else {
              // Fallback to first uncalled lead
              updateNavigationWithHistory(0, false);
            }
          } else {
            // No uncalled leads found, go to first uncalled lead
            updateNavigationWithHistory(0, false);
          }
        } else {
          // Switching to ALL filter - find the same lead in the full list
          // Since we're using the same timezone filter, the index should be the same
          const newIndex = newFilteredLeads.findIndex(lead => 
            lead.name === currentlyViewedLead.name && getPhoneDigits(lead.phone) === currentDigits
          );
          if (newIndex !== -1) {
            updateNavigationWithHistory(newIndex, false); // Don't add to history since this is a filter change
          } else {
            // Fallback to first lead
            updateNavigationWithHistory(0, false);
          }
        }
      } else if (newFilteredLeads.length > 0) {
        updateNavigationWithHistory(0, false);
      }
    } catch (error) {
      // Fallback: reset to first lead if there's an error
      updateNavigationWithHistory(0, false);
    }
    
    setTimeout(() => {
      setFilterChanging(false);
    }, 100);
  }, [timezoneFilter, callFilter]); // Remove leadsData dependency to prevent navigation when leads are called

  useEffect(() => {
    const baseLeads = getBaseLeads();
    // Only reset if current index is truly out of bounds and we have leads
    if (baseLeads && baseLeads.length > 0 && currentIndex >= baseLeads.length) {
      // Find the closest valid index instead of always resetting to 0
      const closestIndex = Math.min(currentIndex, baseLeads.length - 1);
      if (closestIndex !== currentIndex) {
        resetNavigation(closestIndex);
      }
    }
  }, [timezoneFilter, callFilter, currentIndex, getBaseLeads, resetNavigation]);
};

