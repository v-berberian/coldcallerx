
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
    // When using shuffle mode, we want to pick a random lead from the available leads
    // But we need to ensure we're working with the already filtered baseLeads
    // and not re-filtering them here
    
    if (baseLeads.length > 0) {
      const randomLead = baseLeads[Math.floor(Math.random() * baseLeads.length)];
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
