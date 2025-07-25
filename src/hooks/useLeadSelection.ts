import { Lead, CallFilter } from '../types/lead';

export const useLeadSelection = () => {
  const getNextLeadInSequential = (baseLeads: Lead[], currentIndex: number) => {
    // If there's only one lead or no leads, don't navigate
    if (baseLeads.length <= 1) {
      return {
        index: currentIndex,
        lead: baseLeads[currentIndex]
      };
    }
    
    const nextIndex = (currentIndex + 1) % baseLeads.length;
    return {
      index: nextIndex,
      lead: baseLeads[nextIndex]
    };
  };

  const getNextLeadInShuffle = (
    baseLeads: Lead[], 
    currentIndex: number, 
    callFilter: CallFilter,
    shownLeadsInShuffle: Set<string>
  ) => {
    if (baseLeads.length === 0) {
      return {
        index: currentIndex,
        lead: baseLeads[currentIndex]
      };
    }

    // Create a key for each lead to track if it's been shown
    const createLeadKey = (lead: Lead) => `${lead.name}-${lead.phone}`;
    
    // Filter out leads that have already been shown in this shuffle session
    const unshownLeads = baseLeads.filter(lead => 
      !shownLeadsInShuffle.has(createLeadKey(lead))
    );

    console.log('Shuffle selection - Total leads:', baseLeads.length, 'Unshown leads:', unshownLeads.length, 'Shown leads:', shownLeadsInShuffle.size);

    // If we have unshown leads, pick from them
    if (unshownLeads.length > 0) {
      const randomIndex = Math.floor(Math.random() * unshownLeads.length);
      const randomLead = unshownLeads[randomIndex];
      const nextIndex = baseLeads.findIndex(lead => 
        lead.name === randomLead.name && lead.phone === randomLead.phone
      );
      console.log('Selected unshown lead:', randomLead.name, 'at index:', nextIndex);
      return {
        index: nextIndex,
        lead: randomLead
      };
    } else {
      // All leads have been shown, pick any random lead (cycle complete)
      console.log('All leads have been shown, cycling complete - picking any random lead');
      const randomIndex = Math.floor(Math.random() * baseLeads.length);
      return {
        index: randomIndex,
        lead: baseLeads[randomIndex]
      };
    }
  };

  return {
    getNextLeadInSequential,
    getNextLeadInShuffle
  };
};
