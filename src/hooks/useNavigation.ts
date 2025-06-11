
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
  isCountdownActive: boolean, // Add this parameter to differentiate countdown vs just enabled
  markLeadAsCalledOnNavigation: (lead: Lead) => void,
  shownLeadsInShuffle: Set<string>,
  setShownLeadsInShuffle: (shown: Set<string>) => void
) => {
  const { getNextLeadInSequential, getNextLeadInShuffle } = useLeadSelection();

  const handleNext = (baseLeads: Lead[]) => {
    // Only prevent navigation during active countdown, not when auto-call is just enabled
    if (isFilterChanging || isCountdownActive) {
      console.log('Skipping navigation because filters are changing or countdown is active');
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
    
    if (shuffleMode) {
      console.log('Using shuffle mode for navigation');
      const result = getNextLeadInShuffle(baseLeads, currentIndex, callFilter, shownLeadsInShuffle);
      nextIndex = result.index;
      
      // Add the current lead to shown leads in shuffle
      const leadKey = `${currentLead.name}-${currentLead.phone}`;
      const newShownLeads = new Set(shownLeadsInShuffle);
      newShownLeads.add(leadKey);
      setShownLeadsInShuffle(newShownLeads);
      console.log('Added lead to shown leads in shuffle:', leadKey);
    } else {
      console.log('Using sequential mode for navigation');
      const result = getNextLeadInSequential(baseLeads, currentIndex);
      nextIndex = result.index;
    }
    
    console.log('Navigation to next index:', nextIndex, 'from current:', currentIndex, 'shuffle mode:', shuffleMode);
    updateNavigation(nextIndex);
  };

  const handlePrevious = () => {
    // Only prevent navigation during active countdown, not when auto-call is just enabled
    if (isCountdownActive) {
      console.log('Skipping previous navigation because countdown is active');
      return;
    }
    
    // Simple list-based navigation - just go to previous index
    // This will be handled by the calling component which knows the baseLeads length
  };

  const selectLead = (lead: Lead, baseLeads: Lead[], allLeads: Lead[]) => {
    // Only prevent selection during active countdown, not when auto-call is just enabled
    if (isCountdownActive) {
      console.log('Skipping lead selection because countdown is active');
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
