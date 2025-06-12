
import { Lead } from '../types/lead';
import { LeadList } from '../services/leadService';

interface UseCallingScreenHandlersProps {
  getBaseLeads: () => Lead[];
  leadsData: Lead[];
  selectLead: (lead: Lead, baseLeads: Lead[], allLeads: Lead[]) => void;
  setSearchQuery: (query: string) => void;
  setShowAutocomplete: (show: boolean) => void;
  switchToLeadList: (leadList: LeadList) => Promise<boolean>;
  deleteLeadList: (leadListId: string) => Promise<boolean>;
  makeCall: (lead: Lead) => void;
  incrementDailyCallCount: () => void;
  handleNext: (baseLeads: Lead[]) => void;
  handlePrevious: (baseLeads: Lead[]) => void;
  resetCallCount: (lead: Lead) => void;
  currentIndex: number;
}

export const useCallingScreenHandlers = ({
  getBaseLeads,
  leadsData,
  selectLead,
  setSearchQuery,
  setShowAutocomplete,
  switchToLeadList,
  deleteLeadList,
  makeCall,
  incrementDailyCallCount,
  handleNext,
  handlePrevious,
  resetCallCount,
  currentIndex
}: UseCallingScreenHandlersProps) => {

  const handleLeadSelect = (lead: Lead) => {
    const baseLeads = getBaseLeads();
    const leadIndexInBaseLeads = baseLeads.findIndex(l => 
      l.name === lead.name && l.phone === lead.phone
    );
    
    if (leadIndexInBaseLeads !== -1) {
      selectLead(lead, baseLeads, leadsData);
      console.log('Selected lead from autocomplete:', lead.name, 'at base index:', leadIndexInBaseLeads);
    }
    
    setSearchQuery('');
    setShowAutocomplete(false);
  };

  const handleLeadListSelect = async (leadList: LeadList) => {
    const success = await switchToLeadList(leadList);
    if (success) {
      console.log('Switched to lead list:', leadList.name);
    }
  };

  const handleLeadListDelete = async (leadListId: string) => {
    const success = await deleteLeadList(leadListId);
    if (success) {
      console.log('Deleted lead list:', leadListId);
    }
  };

  const handleCallClick = () => {
    const currentLeads = getBaseLeads();
    const currentLead = currentLeads[currentIndex];
    makeCall(currentLead);
    incrementDailyCallCount();
  };

  const handleNextWrapper = () => {
    const currentLeads = getBaseLeads();
    handleNext(currentLeads);
  };

  const handlePreviousWrapper = () => {
    const currentLeads = getBaseLeads();
    handlePrevious(currentLeads);
  };

  const handleResetCallCount = () => {
    const currentLeads = getBaseLeads();
    const currentLead = currentLeads[currentIndex];
    resetCallCount(currentLead);
  };

  return {
    handleLeadSelect,
    handleLeadListSelect,
    handleLeadListDelete,
    handleCallClick,
    handleNextWrapper,
    handlePreviousWrapper,
    handleResetCallCount
  };
};
