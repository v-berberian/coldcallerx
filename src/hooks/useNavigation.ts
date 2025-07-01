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
    console.log('useNavigation: selectLead called for lead:', lead.name, lead.phone);
    console.log('useNavigation: baseLeads length:', baseLeads.length, 'allLeads length:', allLeads.length);
    console.log('useNavigation: currentIndex:', currentIndex);
    console.log('useNavigation: isFilterChanging:', isFilterChanging, 'shouldBlockNavigation:', shouldBlockNavigation);
    
    // Block selection during filter changes or when countdown is 1 second or less
    if (isFilterChanging) {
      console.log('useNavigation: selection blocked - isFilterChanging');
      return;
    }
    
    if (shouldBlockNavigation) {
      console.log('useNavigation: selection blocked - shouldBlockNavigation');
      return;
    }
    
    // First, find the lead in the allLeads array to ensure it exists
    const leadInAllLeads = allLeads.find(l => l.name === lead.name && l.phone === lead.phone);
    if (!leadInAllLeads) {
      console.log('useNavigation: Lead not found in allLeads:', lead.name, lead.phone);
      return;
    }
    console.log('useNavigation: Lead found in allLeads at index:', allLeads.indexOf(leadInAllLeads));
    
    // Find the lead's index in the filtered baseLeads array for proper navigation context
    let leadIndex = baseLeads.findIndex(l => l.name === lead.name && l.phone === lead.phone);
    console.log('useNavigation: leadIndex in baseLeads:', leadIndex);
    
    // If the lead is not in the current filtered view, we need to handle this case
    if (leadIndex === -1) {
      console.log('useNavigation: Lead not in current filtered view, finding in allLeads:', lead.name, lead.phone);
      // Find the index in allLeads
      const allLeadsIndex = allLeads.findIndex(l => l.name === lead.name && l.phone === lead.phone);
      if (allLeadsIndex !== -1) {
        // Use the index from allLeads directly - this will work because the navigation system
        // uses the same index for both filtered and unfiltered arrays
        leadIndex = allLeadsIndex;
        console.log('useNavigation: Using allLeads index:', leadIndex);
      } else {
        console.log('useNavigation: Lead not found in either array');
        return;
      }
    }
    
    if (leadIndex !== -1) {
      console.log('useNavigation: Selecting lead at index:', leadIndex, 'lead:', lead.name);
      console.log('useNavigation: shuffleMode:', shuffleMode);
      
      if (shuffleMode) {
        // Use history-aware navigation for shuffle mode
        console.log('useNavigation: calling updateNavigationWithHistory with index:', leadIndex);
        updateNavigationWithHistory(leadIndex, true);
      } else {
        // Use regular navigation for sequential mode
        console.log('useNavigation: calling updateNavigation with index:', leadIndex);
        updateNavigation(leadIndex);
      }
      
      // If in shuffle mode, add this lead to shown leads
      if (shuffleMode) {
        const leadKey = `${lead.name}-${lead.phone}`;
        const newShownLeads = new Set(shownLeadsInShuffle);
        newShownLeads.add(leadKey);
        setShownLeadsInShuffle(newShownLeads);
        console.log('useNavigation: Added lead to shown leads in shuffle mode');
      }
    }
  };

  return {
    handleNext,
    handlePrevious,
    selectLead
  };
};
