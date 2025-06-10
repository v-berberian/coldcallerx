
import { Lead, CallFilter } from '../types/lead';
import { useLeadSelection } from './useLeadSelection';

export const useNavigation = (
  currentIndex: number,
  updateNavigation: (index: number) => void,
  resetNavigation: (index: number) => void,
  shuffleMode: boolean,
  callFilter: CallFilter,
  isFilterChanging: boolean,
  isAutoCallInProgress: boolean
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
    
    let nextIndex: number;
    let leadToCall: Lead;
    
    if (shuffleMode) {
      console.log('Using shuffle mode for navigation');
      const result = getNextLeadInShuffle(baseLeads, currentIndex, callFilter);
      nextIndex = result.index;
      leadToCall = result.lead;
    } else {
      console.log('Using sequential mode for navigation');
      const result = getNextLeadInSequential(baseLeads, currentIndex);
      nextIndex = result.index;
      leadToCall = result.lead;
    }
    
    console.log('Manual navigation to index:', nextIndex, 'lead:', leadToCall?.name, 'shuffle:', shuffleMode);
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
      // Use updateNavigation to maintain navigation history and enable proper previous functionality
      updateNavigation(leadIndex);
    }
  };

  return {
    handleNext,
    handlePrevious,
    selectLead
  };
};
