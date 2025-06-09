
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

  const handleNext = (baseLeads: Lead[], autoCall: boolean, executeAutoCall: (lead: Lead) => void) => {
    // Prevent navigation if filters are currently changing
    if (isFilterChanging || isAutoCallInProgress) {
      console.log('Skipping navigation because filters are changing or auto-call in progress');
      return;
    }
    
    let nextIndex: number;
    let leadToCall: Lead;
    
    if (shuffleMode) {
      const result = getNextLeadInShuffle(baseLeads, currentIndex, callFilter);
      nextIndex = result.index;
      leadToCall = result.lead;
    } else {
      const result = getNextLeadInSequential(baseLeads, currentIndex);
      nextIndex = result.index;
      leadToCall = result.lead;
    }
    
    console.log('Navigating to index:', nextIndex, 'lead:', leadToCall?.name);
    
    // Only update navigation once
    updateNavigation(nextIndex);
    
    // Auto-call the specific lead we navigated to
    if (autoCall && leadToCall) {
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

  const selectLead = (lead: Lead, baseLeads: Lead[]) => {
    if (isAutoCallInProgress) {
      console.log('Skipping lead selection because auto-call in progress');
      return;
    }
    
    const leadIndex = baseLeads.findIndex(l => l.name === lead.name && l.phone === lead.phone);
    if (leadIndex !== -1) {
      resetNavigation(leadIndex);
    }
  };

  return {
    handleNext,
    handlePrevious,
    selectLead
  };
};
