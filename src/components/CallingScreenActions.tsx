
import { Lead } from '../types/lead';

interface CallingScreenActionsProps {
  getBaseLeads: () => Lead[];
  currentIndex: number;
  makeCall: (lead: Lead) => void;
  handleNext: (baseLeads: Lead[]) => void;
  handlePrevious: (baseLeads: Lead[]) => void;
  selectLead: (lead: Lead, baseLeads: Lead[], leadsData: Lead[]) => void;
  leadsData: Lead[];
  setSearchQuery: (query: string) => void;
  setShowAutocomplete: (show: boolean) => void;
}

export const useCallingScreenActions = ({
  getBaseLeads,
  currentIndex,
  makeCall,
  handleNext,
  handlePrevious,
  selectLead,
  leadsData,
  setSearchQuery,
  setShowAutocomplete
}: CallingScreenActionsProps) => {
  
  const handleLeadSelect = (lead: Lead) => {
    const baseLeads = getBaseLeads();
    const leadIndexInBaseLeads = baseLeads.findIndex(l => 
      l.name === lead.name && l.phone === lead.phone
    );
    
    if (leadIndexInBaseLeads !== -1) {
      selectLead(lead, baseLeads, leadsData);
      console.log('CallingScreenActions: Selected lead from autocomplete:', lead.name, 'at base index:', leadIndexInBaseLeads);
    }
    
    setSearchQuery('');
    setShowAutocomplete(false);
  };

  // Handle manual call button click
  const handleCallClick = async () => {
    try {
      const currentLeads = getBaseLeads();
      const currentLead = currentLeads[currentIndex];
      
      console.log('CallingScreenActions: Manual call button clicked for:', currentLead.name);
      makeCall(currentLead);
    } catch (error) {
      console.error('CallingScreenActions: Error in handleCallClick:', error);
    }
  };

  // Create wrapper functions for navigation that pass the required baseLeads parameter
  const handleNextWrapper = () => {
    try {
      const currentLeads = getBaseLeads();
      console.log('CallingScreenActions: Next button clicked, triggering navigation with', currentLeads.length, 'leads');
      handleNext(currentLeads);
    } catch (error) {
      console.error('CallingScreenActions: Error in handleNextWrapper:', error);
    }
  };

  const handlePreviousWrapper = () => {
    try {
      const currentLeads = getBaseLeads();
      console.log('CallingScreenActions: Previous button clicked, triggering navigation with', currentLeads.length, 'leads');
      handlePrevious(currentLeads);
    } catch (error) {
      console.error('CallingScreenActions: Error in handlePreviousWrapper:', error);
    }
  };

  // Handle reset call count - local only now
  const handleResetCallCount = async (lead: Lead) => {
    try {
      console.log('CallingScreenActions: Reset call count for:', lead.name, '(local only)');
      // This would reset the local call count only
    } catch (error) {
      console.error('CallingScreenActions: Error in handleResetCallCount:', error);
    }
  };

  // Handle reset all call counts - local only now
  const handleResetAllCallCounts = async () => {
    try {
      console.log('CallingScreenActions: Reset all call counts (local only)');
      // This would reset all local call counts only
    } catch (error) {
      console.error('CallingScreenActions: Error in handleResetAllCallCounts:', error);
    }
  };

  return {
    handleLeadSelect,
    handleCallClick,
    handleNextWrapper,
    handlePreviousWrapper,
    handleResetCallCount,
    handleResetAllCallCounts
  };
};
