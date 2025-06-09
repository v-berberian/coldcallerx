
import { Lead } from '../types/lead';

export const useAutoCallNavigation = (
  autoCall: boolean,
  currentIndex: number,
  getBaseLeads: () => Lead[],
  updateNavigation: (index: number) => void,
  executeAutoCall: (lead: Lead) => void,
  isAutoCallInProgress: boolean
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
    
    // Calculate next index in the filtered leads
    const nextIndex = (currentIndex + 1) % baseLeads.length;
    const nextLead = baseLeads[nextIndex];
    
    console.log('Auto-call navigation:', {
      currentIndex,
      nextIndex,
      leadName: nextLead?.name,
      leadPhone: nextLead?.phone,
      totalFilteredLeads: baseLeads.length
    });
    
    // Update navigation first to show the correct lead
    updateNavigation(nextIndex);
    
    // Then execute auto-call if enabled with the EXACT lead that's now displayed
    if (autoCall && nextLead) {
      console.log('Executing auto-call for displayed lead:', nextLead.name, nextLead.phone);
      executeAutoCall(nextLead);
    }
  };

  return { handleNext };
};
