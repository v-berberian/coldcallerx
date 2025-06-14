
import { Lead } from '../types/lead';

interface CallingScreenActionsProps {
  getBaseLeads: () => Lead[];
  currentIndex: number;
  makeCall: (lead: Lead) => void;
  markLeadAsCalled?: (lead: Lead) => Promise<boolean>;
  resetCallCount?: (lead: Lead) => void;
  resetAllCallCounts?: () => void;
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
  markLeadAsCalled,
  resetCallCount,
  resetAllCallCounts,
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
      
      // Mark as called in cloud if function is provided
      if (markLeadAsCalled) {
        try {
          await markLeadAsCalled(currentLead);
          console.log('CallingScreenActions: Successfully marked lead as called in cloud');
        } catch (error) {
          console.error('CallingScreenActions: Error marking lead as called in cloud:', error);
        }
      }
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

  // Handle reset call count with cloud sync
  const handleResetCallCount = async (lead: Lead) => {
    try {
      if (resetCallCount) {
        resetCallCount(lead);
        console.log('CallingScreenActions: Reset call count for:', lead.name);
      }
    } catch (error) {
      console.error('CallingScreenActions: Error in handleResetCallCount:', error);
    }
  };

  // Handle reset all call counts with cloud sync
  const handleResetAllCallCounts = async () => {
    try {
      if (resetAllCallCounts) {
        resetAllCallCounts();
        console.log('CallingScreenActions: Reset all call counts');
      }
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
