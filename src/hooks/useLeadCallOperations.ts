import { Lead } from '../types/lead';

interface LeadList {
  id: string;
  name: string;
  file_name?: string;
  total_leads?: number;
}

interface UseLeadCallOperationsProps {
  currentLeadList: LeadList | null;
  leadsData: Lead[];
  setLeadsData: (leads: Lead[]) => void;
  loadDailyStats: () => Promise<void>;
}

export const useLeadCallOperations = ({ 
  currentLeadList, 
  leadsData, 
  setLeadsData, 
  loadDailyStats 
}: UseLeadCallOperationsProps) => {

  const markLeadAsCalled = async (lead: Lead): Promise<boolean> => {
    if (!currentLeadList) return false;

    try {
      console.log('useLeadCallOperations: Marking lead as called:', lead.name);
      const now = new Date();
      const dateString = now.toLocaleDateString();
      const timeString = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      const lastCalledString = `${dateString} at ${timeString}`;

      // Update local state
      const updatedLeads = leadsData.map(l => 
        l.name === lead.name && l.phone === lead.phone ? {
          ...l,
          lastCalled: lastCalledString
        } : l
      );
      setLeadsData(updatedLeads);

      // Save to localStorage
      localStorage.setItem('coldcaller-leads', JSON.stringify(updatedLeads));

      // Increment daily call count
      await loadDailyStats();

      return true;
    } catch (error) {
      console.error('useLeadCallOperations: Error marking lead as called:', error);
      return false;
    }
  };

  const resetCallCount = async (lead: Lead) => {
    if (!currentLeadList) return;

    console.log('useLeadCallOperations: Resetting call count for:', lead.name);
    
    // Update local state
    const updatedLeads = leadsData.map(l => 
      l.name === lead.name && l.phone === lead.phone 
        ? { ...l, lastCalled: undefined }
        : l
    );
    setLeadsData(updatedLeads);

    // Save to localStorage
    localStorage.setItem('coldcaller-leads', JSON.stringify(updatedLeads));
  };

  const resetAllCallCounts = async () => {
    if (!currentLeadList) return;

    console.log('useLeadCallOperations: Resetting all call counts');
    
    // Update local state
    const updatedLeads = leadsData.map(l => ({
      ...l,
      lastCalled: undefined
    }));
    setLeadsData(updatedLeads);

    // Save to localStorage
    localStorage.setItem('coldcaller-leads', JSON.stringify(updatedLeads));
  };

  return {
    markLeadAsCalled,
    resetCallCount,
    resetAllCallCounts
  };
};
