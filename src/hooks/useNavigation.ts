import { Lead, CallFilter } from '../types/lead';
import { useLeadSelection } from './useLeadSelection';

interface UseNavigationProps {
  currentIndex: number;
  updateNavigation: (index: number) => void;
  updateNavigationWithHistory: (index: number, addToHistory?: boolean) => void;
  resetNavigation: (index: number) => void;
  shuffleMode: boolean;
  callFilter: CallFilter;
  isFilterChanging: boolean;
  isAutoCallInProgress: boolean;
  shouldBlockNavigation: boolean;
  markLeadAsCalledOnNavigation: (lead: Lead) => void;
  shownLeadsInShuffle: Set<string>;
  setShownLeadsInShuffle: (shown: Set<string>) => void;
  // Add filter toggle functions
  toggleCallFilter?: () => void;
  toggleTimezoneFilter?: () => void;
}

export const useNavigation = (
  currentIndex: number,
  updateNavigation: (index: number) => void,
  updateNavigationWithHistory: (index: number, addToHistory?: boolean) => void,
  resetNavigation: (index: number) => void,
  shuffleMode: boolean,
  callFilter: CallFilter,
  isFilterChanging: boolean,
  isAutoCallInProgress: boolean,
  shouldBlockNavigation: boolean,
  markLeadAsCalledOnNavigation: (lead: Lead) => void,
  shownLeadsInShuffle: Set<string>,
  setShownLeadsInShuffle: (shown: Set<string>) => void,
  toggleCallFilter?: () => void,
  toggleTimezoneFilter?: () => void
) => {
  const { getNextLeadInSequential, getNextLeadInShuffle } = useLeadSelection();

  const handleNext = (baseLeads: Lead[]) => {
    // Block navigation when countdown is 1 second or less
    if (shouldBlockNavigation) {
      return;
    }
    
    if (baseLeads.length === 0) {
      return;
    }

    // DO NOT mark current lead as called here - this will be handled by the wrapper
    // that checks if callMadeToCurrentLead is true
    const currentLead = baseLeads[currentIndex];
    
    let nextIndex: number;
    
    if (shuffleMode) {
      const result = getNextLeadInShuffle(baseLeads, currentIndex, callFilter, shownLeadsInShuffle);
      nextIndex = result.index;
      
      // Add the current lead to shown leads in shuffle
      if (currentLead) {
        const leadKey = `${currentLead.name}-${currentLead.phone}`;
        const newShownLeads = new Set(shownLeadsInShuffle);
        newShownLeads.add(leadKey);
        setShownLeadsInShuffle(newShownLeads);
      }
      
      // Use history-aware navigation for shuffle mode
      updateNavigationWithHistory(nextIndex, true);
    } else {
      const result = getNextLeadInSequential(baseLeads, currentIndex);
      nextIndex = result.index;
      
      // Use regular navigation for sequential mode
      updateNavigation(nextIndex);
    }
  };

  const handlePrevious = () => {
    // Block navigation when countdown is 1 second or less
    if (shouldBlockNavigation) {
      return;
    }
    
    // Simple list-based navigation - just go to previous index
    // This will be handled by the calling component which knows the baseLeads length
  };

  const selectLead = (lead: Lead, baseLeads: Lead[], allLeads: Lead[]) => {
    // Block selection when countdown is 1 second or less
    if (shouldBlockNavigation) {
      return;
    }
    
    // First, find the lead in the allLeads array to ensure it exists
    const leadInAllLeads = allLeads.find(l => l.name === lead.name && l.phone === lead.phone);
    if (!leadInAllLeads) {
      return;
    }
    
    // Find the lead's index in the filtered baseLeads array for proper navigation context
    let leadIndex = baseLeads.findIndex(l => l.name === lead.name && l.phone === lead.phone);
    
    // If the lead is not in the current filtered view, we need to handle this case
    if (leadIndex === -1) {
      // Find the index in allLeads
      const allLeadsIndex = allLeads.findIndex(l => l.name === lead.name && l.phone === lead.phone);
      if (allLeadsIndex !== -1) {
        // The lead exists in allLeads but not in the current filtered view
        // This means the current filters are hiding this lead
        
        // Check if the lead is not visible due to call filter (UNCALLED filter)
        // If the lead has been called (lastCalled exists) and we're in UNCALLED filter mode,
        // we need to temporarily switch to ALL filter mode to show this lead
        if (callFilter === 'UNCALLED' && lead.lastCalled) {
          // Temporarily switch to ALL filter mode to show the called lead
          if (toggleCallFilter) {
            toggleCallFilter();
          }
          
          // Use the index from allLeads as a fallback
          leadIndex = allLeadsIndex;
        } else {
          // The lead should be visible in the current filter mode
          // This might be a timezone filter issue or other filter issue
          
          // Use the index from allLeads as a fallback
        leadIndex = allLeadsIndex;
        }
      } else {
        return;
      }
    }
    
    if (leadIndex !== -1) {
      if (shuffleMode) {
        // Use history-aware navigation for shuffle mode
        updateNavigationWithHistory(leadIndex, true);
      } else {
        // Use regular navigation for sequential mode
        updateNavigation(leadIndex);
      }
      
      // If in shuffle mode, add this lead to shown leads
      if (shuffleMode) {
        const leadKey = `${lead.name}-${lead.phone}`;
        const newShownLeads = new Set(shownLeadsInShuffle);
        newShownLeads.add(leadKey);
        setShownLeadsInShuffle(newShownLeads);
      }
    }
  };

  return {
    handleNext,
    handlePrevious,
    selectLead
  };
};
