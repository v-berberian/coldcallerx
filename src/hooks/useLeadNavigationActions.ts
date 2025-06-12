
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
  saveCurrentIndex: (index: number) => Promise<void>;
}

export const useLeadNavigationActions = ({
  currentIndex,
  updateNavigation,
  shuffleMode,
  handleNext,
  handlePrevious,
  selectLead,
  setCallMadeToCurrentLead,
  autoCall,
  setShouldAutoCall,
  saveCurrentIndex,
  isFilterChanging
}: UseLeadNavigationActionsProps) => {

  const handleNextWrapper = async (baseLeads: Lead[]) => {
    if (isFilterChanging) return;
    
    console.log('handleNextWrapper called with', baseLeads.length, 'leads');
    handleNext(baseLeads);
    
    // Reset call state when navigating
    setCallMadeToCurrentLead(false);
    
    // Set flag to trigger auto-call after navigation
    if (autoCall) {
      setShouldAutoCall(true);
    }

    // Save to cloud after navigation completes
    const nextIndex = currentIndex >= baseLeads.length - 1 ? 0 : currentIndex + 1;
    await saveCurrentIndex(nextIndex);
  };

  const handlePreviousWrapper = async (baseLeads: Lead[]) => {
    if (isFilterChanging) return;
    
    console.log('handlePreviousWrapper called with', baseLeads.length, 'leads');
    if (baseLeads.length === 0) return;
    
    // Simple list-based previous navigation
    const prevIndex = currentIndex === 0 ? baseLeads.length - 1 : currentIndex - 1;
    console.log('Previous navigation: from index', currentIndex, 'to index', prevIndex);
    updateNavigation(prevIndex);
    
    // Reset call state when navigating
    setCallMadeToCurrentLead(false);

    // Save to cloud
    await saveCurrentIndex(prevIndex);
  };

  const selectLeadWrapper = async (lead: Lead, baseLeads: Lead[], leadsData: Lead[]) => {
    if (isFilterChanging) return;
    
    console.log('selectLeadWrapper called for lead:', lead.name);
    selectLead(lead, baseLeads, leadsData);
    // Reset call state when selecting a new lead
    setCallMadeToCurrentLead(false);

    // Save to cloud
    const leadIndex = baseLeads.findIndex(l => l.name === lead.name && l.phone === lead.phone);
    if (leadIndex !== -1) {
      await saveCurrentIndex(leadIndex);
    }
  };

  return {
    handleNextWrapper,
    handlePreviousWrapper,
    selectLeadWrapper
  };
};
