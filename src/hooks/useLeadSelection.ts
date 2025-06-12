
import { Lead } from '../types/lead';

interface UseLeadSelectionProps {
  getBaseLeads: () => Lead[];
  leadsData: Lead[];
  selectLead: (lead: Lead, baseLeads: Lead[], leadsData: Lead[]) => void;
  setSearchQuery: (query: string) => void;
  setShowAutocomplete: (show: boolean) => void;
}

export const useLeadSelectionHandlers = ({
  getBaseLeads,
  leadsData,
  selectLead,
  setSearchQuery,
  setShowAutocomplete
}: UseLeadSelectionProps) => {
  const handleLeadSelect = async (lead: Lead) => {
    const baseLeads = getBaseLeads();
    const leadIndexInBaseLeads = baseLeads.findIndex(l => 
      l.name === lead.name && l.phone === lead.phone
    );
    
    if (leadIndexInBaseLeads !== -1) {
      selectLead(lead, baseLeads, leadsData);
      console.log('Selected lead from autocomplete:', lead.name, 'at base index:', leadIndexInBaseLeads);
      
      // Save the new index to session with sync
      if ((window as any).saveCurrentIndex) {
        await (window as any).saveCurrentIndex(leadIndexInBaseLeads);
      }
    }
    
    setSearchQuery('');
    setShowAutocomplete(false);
  };

  return {
    handleLeadSelect
  };
};
