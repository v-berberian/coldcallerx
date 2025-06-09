
import { Lead, CallFilter } from '../types/lead';

export const useLeadSelection = () => {
  const getNextLeadInSequential = (baseLeads: Lead[], currentIndex: number) => {
    const nextIndex = (currentIndex + 1) % baseLeads.length;
    return {
      index: nextIndex,
      lead: baseLeads[nextIndex]
    };
  };

  const getNextLeadInShuffle = (
    baseLeads: Lead[], 
    currentIndex: number, 
    callFilter: CallFilter
  ) => {
    let availableLeads = baseLeads;
    
    if (callFilter === 'UNCALLED') {
      const uncalledLeads = baseLeads.filter(lead => !lead.called || lead.called === 0);
      if (uncalledLeads.length > 0) {
        availableLeads = uncalledLeads;
      }
    }
    
    if (availableLeads.length > 0) {
      const randomLead = availableLeads[Math.floor(Math.random() * availableLeads.length)];
      const nextIndex = baseLeads.findIndex(lead => 
        lead.name === randomLead.name && lead.phone === randomLead.phone
      );
      return {
        index: nextIndex,
        lead: randomLead
      };
    } else {
      return {
        index: currentIndex,
        lead: baseLeads[currentIndex]
      };
    }
  };

  return {
    getNextLeadInSequential,
    getNextLeadInShuffle
  };
};
