
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
  markLeadAsCalledOnNavigation
}: UseLeadNavigationActionsProps) => {

  const handleNextWrapper = (baseLeads: Lead[]) => {
    // Get current lead before navigation
    const currentLead = baseLeads[currentIndex];
    
    // Navigate to next lead
    handleNext(baseLeads);
    
    // Mark current lead as called if a call was made (this will update lastCalled timestamp)
    if (currentLead) {
      markLeadAsCalledOnNavigation(currentLead);
    }
    
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
      console.log('Previous navigation blocked due to countdown');
      return;
    }
    
    // Get current lead before navigation for potential call marking
    const currentLead = baseLeads[currentIndex];
    
    if (shuffleMode) {
      // In shuffle mode, use navigation history to go to previously shown lead
      const didGoBack = goToPrevious();
      if (didGoBack) {
        console.log('Shuffle mode: Used navigation history to go to previous lead');
      } else {
        console.log('Shuffle mode: No previous lead in history');
      }
    } else {
      // In sequential mode, use simple list-based navigation
      const prevIndex = currentIndex === 0 ? baseLeads.length - 1 : currentIndex - 1;
      console.log('Sequential mode: Previous navigation from index', currentIndex, 'to index', prevIndex);
      updateNavigation(prevIndex);
    }
    
    // Mark current lead as called if a call was made (this will update lastCalled timestamp)
    if (currentLead) {
      markLeadAsCalledOnNavigation(currentLead);
    }
    
    // Reset call state after navigation
    setCallMadeToCurrentLead(false);
  };

  const selectLeadWrapper = (lead: Lead, baseLeads: Lead[], leadsData: Lead[]) => {
    // Get current lead before selection for potential call marking
    const currentLead = baseLeads[currentIndex];
    
    // Select the new lead
    selectLead(lead, baseLeads, leadsData);
    
    // Mark previous lead as called if a call was made
    if (currentLead) {
      markLeadAsCalledOnNavigation(currentLead);
    }
    
    // Reset call state after selection
    setCallMadeToCurrentLead(false);
  };

  return {
    handleNextWrapper,
    handlePreviousWrapper,
    selectLeadWrapper
  };
};
