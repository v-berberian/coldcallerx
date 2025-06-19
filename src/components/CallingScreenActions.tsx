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
    }
    
    setSearchQuery('');
    setShowAutocomplete(false);
  };

  // Handle manual call button click - only makes the call, doesn't mark as called yet
  const handleCallClick = async (phone?: string) => {
    try {
      const currentLeads = getBaseLeads();
      const currentLead = currentLeads[currentIndex];
      if (!currentLead) return;
      const phoneToCall = phone || currentLead.phone;
      // Use the provided phone number for the call
      makeCall({ ...currentLead, phone: phoneToCall });
    } catch (error) {
    }
  };

  // Create wrapper functions for navigation that mark lead as called if call was made
  const handleNextWrapper = () => {
    try {
      const currentLeads = getBaseLeads();
      const currentLead = currentLeads[currentIndex];
      
      // The navigation logic will handle marking the lead as called if a call was made
      handleNext(currentLeads);
    } catch (error) {
    }
  };

  const handlePreviousWrapper = () => {
    try {
      const currentLeads = getBaseLeads();
      handlePrevious(currentLeads);
    } catch (error) {
    }
  };

  // Handle reset call count
  const handleResetCallCount = async (lead: Lead) => {
    try {
      const updatedLeads = resetCallCount(leadsData, lead);
      onLeadsDataUpdate(updatedLeads);
    } catch (error) {
    }
  };

  // Handle reset all call counts
  const handleResetAllCallCounts = async () => {
    try {
      const updatedLeads = resetAllCallCounts(leadsData);
      onLeadsDataUpdate(updatedLeads);
    } catch (error) {
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
