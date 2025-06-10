
import { Lead, CallFilter } from '../types/lead';
import { useLeadSelection } from './useLeadSelection';

export const useNavigation = (
  currentIndex: number,
  updateNavigation: (index: number) => void,
  resetNavigation: (index: number) => void,
  shuffleMode: boolean,
  callFilter: CallFilter,
  isAutoCallInProgress: boolean,
  autoCall: boolean,
  executeAutoCall: (lead: Lead) => void,
  commitPendingCalls: () => void
) => {
  const { getNextLeadInSequential, getNextLeadInShuffle } = useLeadSelection();

  const handleNext = (baseLeads: Lead[]) => {
    if (isAutoCallInProgress) {
      console.log('Skipping navigation because auto-call in progress');
      return;
    }
    
    if (baseLeads.length === 0) {
      console.log('No leads available for navigation');
      return;
    }

    // Commit any pending call updates when navigating away
    commitPendingCalls();
    
    let nextIndex: number;
    let nextLead: Lead;
    
    if (shuffleMode) {
      console.log('Using shuffle mode for navigation');
      const result = getNextLeadInShuffle(baseLeads, currentIndex, callFilter);
      nextIndex = result.index;
      nextLead = result.lead;
    } else {
      console.log('Using sequential mode for navigation');
      const result = getNextLeadInSequential(baseLeads, currentIndex);
      nextIndex = result.index;
      nextLead = result.lead;
    }
    
    console.log('Navigation to index:', nextIndex, 'lead:', nextLead?.name, 'shuffle:', shuffleMode, 'autoCall:', autoCall);
    updateNavigation(nextIndex);

    // If auto-call is enabled, call the next lead
    if (autoCall && nextLead) {
      console.log('Auto-call enabled - calling next lead:', nextLead.name, nextLead.phone);
      executeAutoCall(nextLead);
    }
  };

  const handlePrevious = (goToPrevious: () => void) => {
    if (isAutoCallInProgress) {
      console.log('Skipping previous navigation because auto-call in progress');
      return;
    }
    // Commit any pending call updates when navigating away
    commitPendingCalls();
    goToPrevious();
  };

  const selectLead = (lead: Lead, baseLeads: Lead[], allLeads: Lead[]) => {
    if (isAutoCallInProgress) {
      console.log('Skipping lead selection because auto-call in progress');
      return;
    }
    
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
