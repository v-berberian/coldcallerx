
import { Lead } from '../types/lead';

interface UseLeadNavigationResetProps {
  setLeadsData: (leads: Lead[]) => void;
  resetNavigation: (index: number, silent?: boolean) => void;
  resetShownLeads: () => void;
  resetCallState: () => void;
}

export const useLeadNavigationReset = ({
  setLeadsData,
  resetNavigation,
  resetShownLeads,
  resetCallState
}: UseLeadNavigationResetProps) => {
  // Function to reset leads data (for CSV import)
  const resetLeadsData = (newLeads: Lead[]) => {
    const formattedLeads = newLeads.map(lead => ({
      ...lead,
      called: lead.called || 0,
      lastCalled: lead.lastCalled || undefined
    }));
    setLeadsData(formattedLeads);
    
    // Reset navigation to 0 and clear localStorage
    resetNavigation(0, false);
    localStorage.removeItem('coldcaller-current-index');
    resetShownLeads();
    resetCallState();
    
    console.log('Reset leads data with', formattedLeads.length, 'leads');
  };

  return {
    resetLeadsData
  };
};
