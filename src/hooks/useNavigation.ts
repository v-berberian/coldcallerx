import { Lead, CallFilter } from '../types/lead';
import { useLeadSelection } from './useLeadSelection';

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
  setShownLeadsInShuffle: (shown: Set<string>) => void
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
        // Use the index from allLeads directly - this will work because the navigation system
        // uses the same index for both filtered and unfiltered arrays
        leadIndex = allLeadsIndex;
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
