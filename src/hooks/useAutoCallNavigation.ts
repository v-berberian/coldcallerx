
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
    
    // Update navigation first to show the correct lead
    updateNavigation(nextIndex);
    
    // Then execute auto-call ONLY if enabled and we have a lead
    // Use a small delay to ensure the UI has updated before calling
    if (autoCall && nextLead) {
      console.log('Auto-call enabled - will call lead after UI update:', nextLead.name, nextLead.phone);
      setTimeout(() => {
        // Get the lead again from the updated position to ensure consistency
        const updatedBaseLeads = getBaseLeads();
        const leadToCall = updatedBaseLeads[nextIndex];
        if (leadToCall) {
          console.log('Executing auto-call for displayed lead:', leadToCall.name, leadToCall.phone);
          executeAutoCall(leadToCall);
        }
      }, 50);
    }
  };

  return { handleNext };
};
