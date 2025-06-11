
import { Lead } from '../types/lead';

interface UseNavigationActionsProps {
  currentIndex: number;
  updateNavigation: (newIndex: number, addToHistory?: boolean) => void;
  resetNavigation: (index?: number) => void;
  shuffleMode: boolean;
  callFilter: 'ALL' | 'UNCALLED';
  isFilterChanging: boolean;
  isAutoCallInProgress: boolean;
  isCountdownActive: boolean;
  autoCall: boolean;
  markLeadAsCalledOnNavigation: (lead: Lead) => void;
  callMadeToCurrentLead: boolean;
  setCallMadeToCurrentLead: (made: boolean) => void;
  setShouldAutoCall: (should: boolean) => void;
  cancelAutoCall: () => void;
  shownLeadsInShuffle: Set<string>;
  setShownLeadsInShuffle: (leads: Set<string>) => void;
  getBaseLeads: () => Lead[];
  leadsData: Lead[];
  handleNext: (baseLeads: Lead[]) => void;
  selectLead: (lead: Lead, baseLeads: Lead[], leadsData: Lead[]) => void;
}

export const useNavigationActions = ({
  currentIndex,
  updateNavigation,
  shuffleMode,
  callFilter,
  isFilterChanging,
  isAutoCallInProgress,
  isCountdownActive,
  autoCall,
  markLeadAsCalledOnNavigation,
  callMadeToCurrentLead,
  setCallMadeToCurrentLead,
  setShouldAutoCall,
  cancelAutoCall,
  getBaseLeads,
  handleNext,
  selectLead,
  leadsData
}: UseNavigationActionsProps) => {

  const handleNextWrapper = () => {
    const baseLeads = getBaseLeads();
    
    // Cancel any ongoing auto-call when switching leads
    if (isCountdownActive) {
      cancelAutoCall();
    }
    
    handleNext(baseLeads);
    
    // Reset call state when navigating
    setCallMadeToCurrentLead(false);
    
    // Set flag to trigger auto-call after navigation if auto-call is enabled
    if (autoCall) {
      setShouldAutoCall(true);
    }
  };

  const handlePreviousWrapper = () => {
    const baseLeads = getBaseLeads();
    if (baseLeads.length === 0) return;
    
    // Cancel any ongoing auto-call when switching leads
    if (isCountdownActive) {
      cancelAutoCall();
    }
    
    // Simple list-based previous navigation
    const prevIndex = currentIndex === 0 ? baseLeads.length - 1 : currentIndex - 1;
    console.log('Previous navigation: from index', currentIndex, 'to index', prevIndex);
    updateNavigation(prevIndex);
    
    // Reset call state when navigating
    setCallMadeToCurrentLead(false);
    
    // Set flag to trigger auto-call after navigation if auto-call is enabled
    if (autoCall) {
      setShouldAutoCall(true);
    }
  };

  const selectLeadWrapper = (lead: Lead) => {
    const baseLeads = getBaseLeads();
    
    // Cancel any ongoing auto-call when switching leads
    if (isCountdownActive) {
      cancelAutoCall();
    }
    
    selectLead(lead, baseLeads, leadsData);
    // Reset call state when selecting a new lead
    setCallMadeToCurrentLead(false);
    
    // Set flag to trigger auto-call after navigation if auto-call is enabled
    if (autoCall) {
      setShouldAutoCall(true);
    }
  };

  return {
    handleNext: handleNextWrapper,
    handlePrevious: handlePreviousWrapper,
    selectLead: selectLeadWrapper
  };
};
