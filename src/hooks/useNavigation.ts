
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
    
    // Simple list-based navigation - just go to next index
    const nextIndex = (currentIndex + 1) % baseLeads.length;
    console.log('Navigation to next index:', nextIndex, 'from current:', currentIndex);
    updateNavigation(nextIndex);
  };

  const handlePrevious = () => {
    if (isAutoCallInProgress) {
      console.log('Skipping previous navigation because auto-call in progress');
      return;
    }
    
    // Simple list-based navigation - just go to previous index
    // This will be handled by the calling component which knows the baseLeads length
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
