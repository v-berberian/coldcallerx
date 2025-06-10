
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
  autoCall: boolean,
  executeAutoCall: (lead: Lead) => void,
  markLeadAsCalledOnNavigation: (lead: Lead) => void
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
    
    if (shuffleMode) {
      console.log('Using shuffle mode for navigation');
      const result = getNextLeadInShuffle(baseLeads, currentIndex, callFilter);
      nextIndex = result.index;
    } else {
      console.log('Using sequential mode for navigation');
      const result = getNextLeadInSequential(baseLeads, currentIndex);
      nextIndex = result.index;
    }
    
    console.log('Navigation to index:', nextIndex, 'shuffle:', shuffleMode, 'autoCall:', autoCall);
    updateNavigation(nextIndex);

    // If auto-call is enabled, get the lead from the baseLeads array using the nextIndex
    // This ensures we're calling the exact same lead that will be displayed
    if (autoCall && nextIndex >= 0 && nextIndex < baseLeads.length) {
      const leadToCall = baseLeads[nextIndex];
      console.log('Auto-call enabled - calling lead at index', nextIndex, ':', leadToCall.name, leadToCall.phone);
      executeAutoCall(leadToCall);
    }
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
    }
  };

  return {
    handleNext,
    handlePrevious,
    selectLead
  };
};
