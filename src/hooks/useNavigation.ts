
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
    // This function is only used for manual navigation when auto-call is OFF
    if (autoCall) {
      console.log('Manual navigation skipped - auto-call is handling navigation');
      return;
    }
    
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
    
    console.log('Manual navigation to index:', nextIndex, 'lead:', leadToCall?.name);
    updateNavigation(nextIndex);
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
