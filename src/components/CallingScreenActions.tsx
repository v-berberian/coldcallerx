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
  updateLeadCallCount: (currentLeadsData: Lead[], lead: Lead) => Promise<Lead[]>;
  resetCallCount: (currentLeadsData: Lead[], lead: Lead) => Promise<Lead[]>;
  resetAllCallCounts: (currentLeadsData: Lead[]) => Promise<Lead[]>;
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
    console.log('CallingScreenActions: handleLeadSelect called for lead:', lead.name, lead.phone);
    
    const baseLeads = getBaseLeads();
    console.log('CallingScreenActions: baseLeads length:', baseLeads.length);
    
    const leadIndexInBaseLeads = baseLeads.findIndex(l => 
      l.name === lead.name && l.phone === lead.phone
    );
    console.log('CallingScreenActions: leadIndexInBaseLeads:', leadIndexInBaseLeads);
    
    if (leadIndexInBaseLeads !== -1) {
      console.log('CallingScreenActions: calling selectLead with lead:', lead.name);
      selectLead(lead, baseLeads, leadsData);
    } else {
      console.log('CallingScreenActions: lead not found in baseLeads, calling selectLead anyway');
      selectLead(lead, baseLeads, leadsData);
    }
    
    console.log('CallingScreenActions: clearing search query and closing autocomplete');
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
      makeCall({ ...currentLead, phone: phoneToCall });
    } catch (error) {
      console.error('CallingScreenActions: Error in handleCallClick:', error);
    }
  };

  // Create wrapper functions for navigation that mark lead as called if call was made
  const handleNextWrapper = () => {
    try {
      const currentLeads = getBaseLeads();
      const currentLead = currentLeads[currentIndex];
      
      handleNext(currentLeads);
    } catch (error) {
      console.error('CallingScreenActions: Error in handleNextWrapper:', error);
    }
  };

  const handlePreviousWrapper = () => {
    try {
      const currentLeads = getBaseLeads();
      handlePrevious(currentLeads);
    } catch (error) {
      console.error('CallingScreenActions: Error in handlePreviousWrapper:', error);
    }
  };

  // Handle reset call count
  const handleResetCallCount = async (lead: Lead) => {
    try {
      const updatedLeads = await resetCallCount(leadsData, lead);
      onLeadsDataUpdate(updatedLeads);
    } catch (error) {
      console.error('CallingScreenActions: Error in handleResetCallCount:', error);
    }
  };

  // Handle reset all call counts
  const handleResetAllCallCounts = async () => {
    try {
      const updatedLeads = await resetAllCallCounts(leadsData);
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
