
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
  executeAutoCall: (lead: Lead) => void;
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
  executeAutoCall,
  goToPrevious
}: UseLeadNavigationActionsProps) => {

  const handleNextWrapper = (baseLeads: Lead[]) => {
    console.log('NAVIGATION: Next wrapper called, autoCall:', autoCall);
    
    handleNext(baseLeads);
    
    // Reset call state when navigating
    setCallMadeToCurrentLead(false);
    
    // Trigger auto-call immediately after navigation if auto-call is enabled
    if (autoCall && baseLeads.length > 0) {
      const nextIndex = shuffleMode ? currentIndex : (currentIndex + 1) % baseLeads.length;
      const nextLead = baseLeads[nextIndex];
      if (nextLead) {
        console.log('NAVIGATION: Auto-call enabled, triggering countdown after next navigation for:', nextLead.name);
        executeAutoCall(nextLead);
      }
    }
  };

  const handlePreviousWrapper = (baseLeads: Lead[]) => {
    if (baseLeads.length === 0) return;
    
    // Check if navigation should be blocked
    if (shouldBlockNavigation) {
      console.log('Previous navigation blocked due to countdown');
      return;
    }
    
    console.log('NAVIGATION: Previous wrapper called, autoCall:', autoCall);
    
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
    
    // Trigger auto-call immediately after navigation if auto-call is enabled
    if (autoCall && baseLeads.length > 0) {
      const prevIndex = shuffleMode ? currentIndex : (currentIndex === 0 ? baseLeads.length - 1 : currentIndex - 1);
      const prevLead = baseLeads[prevIndex];
      if (prevLead) {
        console.log('NAVIGATION: Auto-call enabled, triggering countdown after previous navigation for:', prevLead.name);
        executeAutoCall(prevLead);
      }
    }
  };

  const selectLeadWrapper = (lead: Lead, baseLeads: Lead[], leadsData: Lead[]) => {
    console.log('NAVIGATION: Lead selected, autoCall:', autoCall);
    
    selectLead(lead, baseLeads, leadsData);
    // Reset call state when selecting a new lead
    setCallMadeToCurrentLead(false);
    
    // Trigger auto-call immediately after lead selection if auto-call is enabled
    if (autoCall) {
      console.log('NAVIGATION: Auto-call enabled, triggering countdown after lead selection for:', lead.name);
      executeAutoCall(lead);
    }
  };

  return {
    handleNextWrapper,
    handlePreviousWrapper,
    selectLeadWrapper
  };
};
