
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
  updateLeadCallCount: (currentLeadsData: Lead[], lead: Lead) => Lead[];
  resetCallCount: (currentLeadsData: Lead[], lead: Lead) => Lead[];
  resetAllCallCounts: (currentLeadsData: Lead[]) => Lead[];
  onLeadsDataUpdate: (updatedLeads: Lead[]) => void;
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
  setShowAutocomplete,
  updateLeadCallCount,
  resetCallCount,
  resetAllCallCounts,
  onLeadsDataUpdate
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

  // Handle manual call button click - only makes the call, doesn't mark as called yet
  const handleCallClick = async () => {
    try {
      const currentLeads = getBaseLeads();
      const currentLead = currentLeads[currentIndex];
      
      console.log('CallingScreenActions: Manual call button clicked for:', currentLead.name);
      
      // Just make the call, don't update lastCalled timestamp yet
      // The lead will be marked as called when navigation happens
      makeCall(currentLead);
    } catch (error) {
      console.error('CallingScreenActions: Error in handleCallClick:', error);
    }
  };

  // Create wrapper functions for navigation that mark lead as called if call was made
  const handleNextWrapper = () => {
    try {
      const currentLeads = getBaseLeads();
      const currentLead = currentLeads[currentIndex];
      
      console.log('CallingScreenActions: Next button clicked, triggering navigation with', currentLeads.length, 'leads');
      
      // The navigation logic will handle marking the lead as called if a call was made
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

  // Handle reset call count
  const handleResetCallCount = async (lead: Lead) => {
    try {
      console.log('CallingScreenActions: Reset call count for:', lead.name);
      const updatedLeads = resetCallCount(leadsData, lead);
      onLeadsDataUpdate(updatedLeads);
    } catch (error) {
      console.error('CallingScreenActions: Error in handleResetCallCount:', error);
    }
  };

  // Handle reset all call counts
  const handleResetAllCallCounts = async () => {
    try {
      console.log('CallingScreenActions: Reset all call counts');
      const updatedLeads = resetAllCallCounts(leadsData);
      onLeadsDataUpdate(updatedLeads);
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
