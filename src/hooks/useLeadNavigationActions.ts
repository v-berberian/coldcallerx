
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
  goToPrevious
}: UseLeadNavigationActionsProps) => {

  const handleNextWrapper = (baseLeads: Lead[]) => {
    handleNext(baseLeads);
    
    // Reset call state when navigating
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
    
    // Reset call state when navigating
    setCallMadeToCurrentLead(false);
  };

  const selectLeadWrapper = (lead: Lead, baseLeads: Lead[], leadsData: Lead[]) => {
    selectLead(lead, baseLeads, leadsData);
    // Reset call state when selecting a new lead
    setCallMadeToCurrentLead(false);
  };

  return {
    handleNextWrapper,
    handlePreviousWrapper,
    selectLeadWrapper
  };
};
