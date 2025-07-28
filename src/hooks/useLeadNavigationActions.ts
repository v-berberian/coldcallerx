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
  callMadeLeadKey: string | null;
  setCallMadeLeadKey: (key: string | null) => void;
  autoCall: boolean;
  setShouldAutoCall: (should: boolean) => void;
  goToPrevious: () => boolean;
  goToPreviousFromHistory: () => boolean;
  callMadeToCurrentLead: boolean;
  callDelay: number;
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
  goToPreviousFromHistory,
  markLeadAsCalledOnNavigation,
  callMadeToCurrentLead,
  callMadeLeadKey,
  setCallMadeLeadKey,
  callDelay
}: UseLeadNavigationActionsProps) => {

  const handleNextWrapper = (baseLeads: Lead[]) => {
    // Get current lead before navigation
    const currentLead = baseLeads[currentIndex];
    
    const currentLeadKey = currentLead ? `${currentLead.name}-${currentLead.phone}` : null;

    if (currentLead && callMadeLeadKey === currentLeadKey) {
      markLeadAsCalledOnNavigation(currentLead);
    }
    
    // Navigate to next lead
    handleNext(baseLeads);
    
    // Reset call state after navigation
    setCallMadeToCurrentLead(false);
    setCallMadeLeadKey(null);
    
    // Set flag to trigger auto-call after navigation
    if (autoCall) {
      // Rocket mode (callDelay === 0) → trigger instantly.
      // Other modes → small delay so UI settles before countdown.
      if (callDelay === 0) {
        setShouldAutoCall(true);
      } else {
        setTimeout(() => {
          setShouldAutoCall(true);
        }, 200);
      }
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
    
    const currentLeadKey = currentLead ? `${currentLead.name}-${currentLead.phone}` : null;
    if (currentLead && callMadeLeadKey === currentLeadKey) {
      markLeadAsCalledOnNavigation(currentLead);
    }
    
    if (shuffleMode) {
      // In shuffle mode, use navigation history to go to previously shown lead
      const didGoBack = goToPreviousFromHistory();
      
      // If there's no history to go back to, fall back to the last lead in the list
      if (!didGoBack) {
        const lastIndex = baseLeads.length - 1;
        updateNavigation(lastIndex);
      }
    } else {
      // In sequential mode, use simple list-based navigation
      // If there's only one lead, don't navigate
      if (baseLeads.length <= 1) {
        return;
      }
      const prevIndex = currentIndex === 0 ? baseLeads.length - 1 : currentIndex - 1;
      updateNavigation(prevIndex);
    }
    
    // Reset call state after navigation
    setCallMadeToCurrentLead(false);
    setCallMadeLeadKey(null);
    
    // Set flag to trigger auto-call after navigation (same as next button)
    if (autoCall) {
      if (callDelay === 0) {
        setShouldAutoCall(true);
      } else {
        setTimeout(() => {
          setShouldAutoCall(true);
        }, 200);
      }
    }
  };

  const selectLeadWrapper = (lead: Lead, baseLeads: Lead[], leadsData: Lead[]) => {
    // Get current lead before selection for potential call marking
    const currentLead = baseLeads[currentIndex];
    
    const prevLeadKey = currentLead ? `${currentLead.name}-${currentLead.phone}` : null;
    if (currentLead && callMadeLeadKey === prevLeadKey) {
      markLeadAsCalledOnNavigation(currentLead);
    }
    
    // Select the new lead
    selectLead(lead, baseLeads, leadsData);
    
    // Reset call state after selection
    setCallMadeToCurrentLead(false);
    setCallMadeLeadKey(null);
  };

  return {
    handleNextWrapper,
    handlePreviousWrapper,
    selectLeadWrapper
  };
};
