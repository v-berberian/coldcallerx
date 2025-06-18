
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
  shouldBlockNavigation: boolean,
  markLeadAsCalledOnNavigation: (lead: Lead) => void,
  shownLeadsInShuffle: Set<string>,
  setShownLeadsInShuffle: (shown: Set<string>) => void
) => {
  const { getNextLeadInSequential, getNextLeadInShuffle } = useLeadSelection();

  const handleNext = (baseLeads: Lead[]) => {
    // Block navigation during filter changes or when countdown is 1 second or less
    if (isFilterChanging) {
      console.log('Skipping navigation because filters are changing');
      return;
    }
    
    if (shouldBlockNavigation) {
      console.log('Skipping navigation because countdown is less than 1 second');
      return;
    }
    
    if (baseLeads.length === 0) {
      console.log('No leads available for navigation');
      return;
    }

    // Get current lead before navigation
    const currentLead = baseLeads[currentIndex];
    
    let nextIndex: number;
    let nextLead: Lead | null = null;
    
    if (shuffleMode) {
      console.log('Using shuffle mode for navigation');
      const result = getNextLeadInShuffle(baseLeads, currentIndex, callFilter, shownLeadsInShuffle);
      nextIndex = result.index;
      nextLead = result.lead;
      
      // Add the current lead to shown leads in shuffle
      if (currentLead) {
        const leadKey = `${currentLead.name}-${currentLead.phone}`;
        const newShownLeads = new Set(shownLeadsInShuffle);
        newShownLeads.add(leadKey);
        setShownLeadsInShuffle(newShownLeads);
        console.log('Added lead to shown leads in shuffle:', leadKey);
      }
    } else {
      console.log('Using sequential mode for navigation');
      const result = getNextLeadInSequential(baseLeads, currentIndex);
      nextIndex = result.index;
      nextLead = result.lead;
    }
    
    // Only navigate if we have a valid lead
    if (nextLead) {
      console.log('Navigation to next index:', nextIndex, 'from current:', currentIndex, 'shuffle mode:', shuffleMode);
      updateNavigation(nextIndex);
    } else {
      console.log('No valid lead found for navigation');
    }
  };

  const handlePrevious = () => {
    // Block navigation during filter changes or when countdown is 1 second or less
    if (isFilterChanging) {
      console.log('Skipping previous navigation because filters are changing');
      return;
    }
    
    if (shouldBlockNavigation) {
      console.log('Skipping previous navigation because countdown is less than 1 second');
      return;
    }
    
    // Simple list-based navigation - just go to previous index
    // This will be handled by the calling component which knows the baseLeads length
  };

  const selectLead = (lead: Lead, baseLeads: Lead[], allLeads: Lead[]) => {
    // Block selection during filter changes or when countdown is 1 second or less
    if (isFilterChanging) {
      console.log('Skipping lead selection because filters are changing');
      return;
    }
    
    if (shouldBlockNavigation) {
      console.log('Skipping lead selection because countdown is less than 1 second');
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
