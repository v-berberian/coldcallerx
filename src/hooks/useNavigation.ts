
import { Lead, CallFilter } from '../types/lead';
import { useLeadSelection } from './useLeadSelection';

export const useNavigation = (
  currentIndex: number,
  updateNavigation: (index: number) => void,
  resetNavigation: (index: number) => void,
  shuffleMode: boolean,
  callFilter: CallFilter,
  isFilterChanging: boolean,
  isAutoCallInProgress: boolean,
  markLeadAsCalledOnNavigation: (lead: Lead) => void,
  shownLeadsInShuffle: Set<string>,
  setShownLeadsInShuffle: (shown: Set<string>) => void
) => {
  const { getNextLeadInSequential, getNextLeadInShuffle } = useLeadSelection();

  const handleNext = (baseLeads: Lead[]) => {
    // Prevent navigation if filters are currently changing
    if (isFilterChanging || isAutoCallInProgress) {
      console.log('Skipping navigation because filters are changing or auto-call in progress');
      return;
    }
    
    if (baseLeads.length === 0) {
      console.log('No leads available for navigation');
      return;
    }

    // Mark current lead as called when navigating away (for uncalled filter behavior)
    const currentLead = baseLeads[currentIndex];
    if (currentLead) {
      markLeadAsCalledOnNavigation(currentLead);
    }
    
    let nextIndex: number;
    let nextLead: Lead;
    
    if (shuffleMode) {
      console.log('Using shuffle mode for navigation');
      const result = getNextLeadInShuffle(baseLeads, currentIndex, callFilter, shownLeadsInShuffle);
      nextIndex = result.index;
      nextLead = result.lead;
      
      // Add the new lead to shown leads set
      if (nextLead) {
        const leadKey = `${nextLead.name}-${nextLead.phone}`;
        const newShownLeads = new Set(shownLeadsInShuffle);
        newShownLeads.add(leadKey);
        setShownLeadsInShuffle(newShownLeads);
        console.log('Added to shown leads:', leadKey, 'Total shown:', newShownLeads.size);
      }
    } else {
      console.log('Using sequential mode for navigation');
      const result = getNextLeadInSequential(baseLeads, currentIndex);
      nextIndex = result.index;
      nextLead = result.lead;
    }
    
    console.log('Navigation to index:', nextIndex, 'lead:', nextLead?.name, 'shuffle:', shuffleMode);
    updateNavigation(nextIndex);
  };

  const handlePrevious = (goToPrevious: () => void) => {
    if (isAutoCallInProgress) {
      console.log('Skipping previous navigation because auto-call in progress');
      return;
    }
    goToPrevious();
  };

  const selectLead = (lead: Lead, baseLeads: Lead[], allLeads: Lead[]) => {
    if (isAutoCallInProgress) {
      console.log('Skipping lead selection because auto-call in progress');
      return;
    }
    
    // Find the lead's index in the filtered baseLeads array for proper navigation context
    const leadIndex = baseLeads.findIndex(l => l.name === lead.name && l.phone === lead.phone);
    if (leadIndex !== -1) {
      console.log('Selecting lead:', lead.name, 'at filtered array index:', leadIndex);
      updateNavigation(leadIndex);
      
      // If in shuffle mode, add this lead to shown leads
      if (shuffleMode) {
        const leadKey = `${lead.name}-${lead.phone}`;
        const newShownLeads = new Set(shownLeadsInShuffle);
        newShownLeads.add(leadKey);
        setShownLeadsInShuffle(newShownLeads);
        console.log('Added selected lead to shown leads:', leadKey);
      }
    }
  };

  return {
    handleNext,
    handlePrevious,
    selectLead
  };
};
