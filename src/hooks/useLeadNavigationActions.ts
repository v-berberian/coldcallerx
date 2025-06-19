import { Lead } from '../types/lead';

interface UseLeadNavigationActionsProps {
  currentIndex: number;
  updateNavigation: (index: number) => void;
  resetNavigation: (index: number) => void;
  shuffleMode: boolean;
  callFilter: string;
  isFilterChanging: boolean;
  isAutoCallInProgress: boolean;
  shouldBlockNavigation: boolean;
  markLeadAsCalledOnNavigation: (lead: Lead) => void;
  shownLeadsInShuffle: Set<string>;
  setShownLeadsInShuffle: (shown: Set<string>) => void;
  handleNext: (baseLeads: Lead[]) => void;
  handlePrevious: () => void;
  selectLead: (lead: Lead, baseLeads: Lead[], allLeads: Lead[]) => void;
  setCallMadeToCurrentLead: (called: boolean) => void;
  autoCall: boolean;
  setShouldAutoCall: (should: boolean) => void;
  goToPrevious: () => boolean;
  callMadeToCurrentLead: boolean;
}

export const useLeadNavigationActions = ({
  currentIndex,
  updateNavigation,
  shuffleMode,
  shouldBlockNavigation,
  handleNext,
  handlePrevious,
  selectLead,
  setCallMadeToCurrentLead,
  autoCall,
  setShouldAutoCall,
  goToPrevious,
  markLeadAsCalledOnNavigation,
  callMadeToCurrentLead
}: UseLeadNavigationActionsProps) => {

  const handleNextWrapper = (baseLeads: Lead[]) => {
    // Get current lead before navigation
    const currentLead = baseLeads[currentIndex];
    
    // Only mark current lead as called if a call was actually made
    if (currentLead && callMadeToCurrentLead) {
      markLeadAsCalledOnNavigation(currentLead);
    }
    
    // Navigate to next lead
    handleNext(baseLeads);
    
    // Reset call state after navigation
    setCallMadeToCurrentLead(false);
    
    // Set flag to trigger auto-call after navigation
    if (autoCall) {
      setShouldAutoCall(true);
    }
  };

  const handlePreviousWrapper = (baseLeads: Lead[]) => {
    if (baseLeads.length === 0) return;
    
    // Check if navigation should be blocked
    if (shouldBlockNavigation) {
      return;
    }
    
    // Get current lead before navigation for potential call marking
    const currentLead = baseLeads[currentIndex];
    
    // Only mark current lead as called if a call was actually made
    if (currentLead && callMadeToCurrentLead) {
      markLeadAsCalledOnNavigation(currentLead);
    }
    
    if (shuffleMode) {
      // In shuffle mode, use navigation history to go to previously shown lead
      const didGoBack = goToPrevious();
    } else {
      // In sequential mode, use simple list-based navigation
      const prevIndex = currentIndex === 0 ? baseLeads.length - 1 : currentIndex - 1;
      updateNavigation(prevIndex);
    }
    
    // Reset call state after navigation
    setCallMadeToCurrentLead(false);
  };

  const selectLeadWrapper = (lead: Lead, baseLeads: Lead[], leadsData: Lead[]) => {
    // Get current lead before selection for potential call marking
    const currentLead = baseLeads[currentIndex];
    
    // Only mark previous lead as called if a call was actually made
    if (currentLead && callMadeToCurrentLead) {
      markLeadAsCalledOnNavigation(currentLead);
    }
    
    // Select the new lead
    selectLead(lead, baseLeads, leadsData);
    
    // Reset call state after selection
    setCallMadeToCurrentLead(false);
  };

  return {
    handleNextWrapper,
    handlePreviousWrapper,
    selectLeadWrapper
  };
};
