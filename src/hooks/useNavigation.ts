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
    console.log('handleNext called - shuffleMode:', shuffleMode, 'baseLeads.length:', baseLeads.length, 'currentIndex:', currentIndex);
    
    // Block navigation during filter changes or when countdown is 1 second or less
    if (isFilterChanging) {
      console.log('Navigation blocked: isFilterChanging');
      return;
    }
    
    if (shouldBlockNavigation) {
      console.log('Navigation blocked: shouldBlockNavigation');
      return;
    }
    
    if (baseLeads.length === 0) {
      console.log('Navigation blocked: no leads');
      return;
    }

    // DO NOT mark current lead as called here - this will be handled by the wrapper
    // that checks if callMadeToCurrentLead is true
    const currentLead = baseLeads[currentIndex];
    
    let nextIndex: number;
    
    if (shuffleMode) {
      console.log('Using shuffle navigation');
      const result = getNextLeadInShuffle(baseLeads, currentIndex, callFilter, shownLeadsInShuffle);
      nextIndex = result.index;
      console.log('Shuffle result - nextIndex:', nextIndex, 'lead:', result.lead?.name);
      
      // Add the current lead to shown leads in shuffle
      if (currentLead) {
        const leadKey = `${currentLead.name}-${currentLead.phone}`;
        const newShownLeads = new Set(shownLeadsInShuffle);
        newShownLeads.add(leadKey);
        setShownLeadsInShuffle(newShownLeads);
      }
      
      // Use history-aware navigation for shuffle mode
      console.log('Calling updateNavigationWithHistory with index:', nextIndex);
      updateNavigationWithHistory(nextIndex, true);
    } else {
      console.log('Using sequential navigation');
      const result = getNextLeadInSequential(baseLeads, currentIndex);
      nextIndex = result.index;
      console.log('Sequential result - nextIndex:', nextIndex, 'lead:', result.lead?.name);
      
      // Use regular navigation for sequential mode
      updateNavigation(nextIndex);
    }
  };

  const handlePrevious = () => {
    // Block navigation during filter changes or when countdown is 1 second or less
    if (isFilterChanging) {
      return;
    }
    
    if (shouldBlockNavigation) {
      return;
    }
    
    // Simple list-based navigation - just go to previous index
    // This will be handled by the calling component which knows the baseLeads length
  };

  const selectLead = (lead: Lead, baseLeads: Lead[], allLeads: Lead[]) => {
    // Block selection during filter changes or when countdown is 1 second or less
    if (isFilterChanging) {
      return;
    }
    
    if (shouldBlockNavigation) {
      return;
    }
    
    // Find the lead's index in the filtered baseLeads array for proper navigation context
    const leadIndex = baseLeads.findIndex(l => l.name === lead.name && l.phone === lead.phone);
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
