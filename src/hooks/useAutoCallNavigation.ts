import { Lead } from '../types/lead';

export const useAutoCallNavigation = (
  autoCall: boolean,
  currentIndex: number,
  getBaseLeads: () => Lead[],
  updateNavigation: (index: number) => void,
  executeAutoCall: (lead: Lead) => void,
  isAutoCallInProgress: boolean,
  shuffleMode: boolean,
  callFilter: string
) => {
  const handleNext = () => {
    // Prevent rapid navigation during auto-call
    if (isAutoCallInProgress) {
      console.log('Preventing navigation because auto-call is in progress');
      return;
    }
    
    const baseLeads = getBaseLeads();
    
    if (baseLeads.length === 0) {
      console.log('No leads available for navigation');
      return;
    }
    
    const currentLead = baseLeads[currentIndex];
    
    // If auto-call is enabled and we're on an uncalled lead, call it instead of navigating
    if (autoCall && currentLead && (!currentLead.called || currentLead.called === 0)) {
      console.log('Auto-call enabled - calling current lead:', currentLead.name, currentLead.phone);
      executeAutoCall(currentLead);
      return;
    }
    
    // Otherwise, navigate to next lead
    let nextIndex: number;
    let nextLead: Lead;
    
    // Use shuffle logic if shuffle mode is enabled
    if (shuffleMode) {
      console.log('Auto-call using shuffle mode');
      nextLead = baseLeads[Math.floor(Math.random() * baseLeads.length)];
      nextIndex = baseLeads.findIndex(lead => 
        lead.name === nextLead.name && lead.phone === nextLead.phone
      );
    } else {
      console.log('Auto-call using sequential mode');
      nextIndex = (currentIndex + 1) % baseLeads.length;
      nextLead = baseLeads[nextIndex];
    }
    
    console.log('Auto-call navigation:', {
      currentIndex,
      nextIndex,
      leadName: nextLead?.name,
      leadPhone: nextLead?.phone,
      totalFilteredLeads: baseLeads.length,
      autoCallEnabled: autoCall,
      shuffleMode
    });
    
    // Just update navigation, don't auto-dial
    updateNavigation(nextIndex);
  };

  return { handleNext };
};
