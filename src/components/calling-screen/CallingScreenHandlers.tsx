
import { Lead } from '../../types/lead';

interface CallingScreenHandlersProps {
  getBaseLeads: () => Lead[];
  currentIndex: number;
  makeCall: (lead: Lead, markAsCalled?: boolean) => void;
  handleNext: () => void;
  handlePrevious: () => void;
  selectLead: (index: number) => void;
  leadsData: Lead[];
  setSearchQuery: (query: string) => void;
  setShowAutocomplete: (show: boolean) => void;
  updateLeadCallCount: (lead: Lead) => Promise<void>;
  resetCallCount: (lead: Lead) => Promise<void>;
  resetAllCallCounts: () => Promise<void>;
  onLeadsDataUpdate: (leads: Lead[]) => void;
}

export const useCallingScreenHandlers = ({
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
}: CallingScreenHandlersProps) => {
  const handleLeadSelect = (lead: Lead) => {
    console.log('Lead selected from search:', lead.name);
    const leadIndex = leadsData.findIndex(l => l.phone === lead.phone && l.name === lead.name);
    if (leadIndex !== -1) {
      selectLead(leadIndex);
      setSearchQuery('');
      setShowAutocomplete(false);
    }
  };

  const handleCallClick = async () => {
    const currentLeads = getBaseLeads();
    const currentLead = currentLeads[currentIndex];
    
    if (currentLead) {
      console.log('Making call to:', currentLead.name, currentLead.phone);
      makeCall(currentLead, true);
      
      try {
        await updateLeadCallCount(currentLead);
        console.log('Call count updated successfully');
      } catch (error) {
        console.error('Failed to update call count:', error);
      }
    }
  };

  const handleNextWrapper = () => {
    console.log('Next button clicked');
    handleNext();
  };

  const handlePreviousWrapper = () => {
    console.log('Previous button clicked');
    handlePrevious();
  };

  const handleResetCallCount = async (lead: Lead) => {
    try {
      await resetCallCount(lead);
      console.log('Call count reset successfully for:', lead.name);
    } catch (error) {
      console.error('Failed to reset call count:', error);
    }
  };

  const handleResetAllCallCounts = async () => {
    try {
      await resetAllCallCounts();
      console.log('All call counts reset successfully');
    } catch (error) {
      console.error('Failed to reset all call counts:', error);
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
