
import { Lead } from '../types/lead';

export const useAutoCallNavigation = (
  autoCall: boolean,
  currentIndex: number,
  getBaseLeads: () => Lead[],
  updateNavigation: (index: number) => void,
  executeAutoCall: (lead: Lead) => void,
  isAutoCallInProgress: boolean,
  navigationHandleNext: (baseLeads: Lead[], autoCall: boolean, executeAutoCall: (lead: Lead) => void) => void
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
    
    // Calculate next index manually to ensure consistency
    const nextIndex = (currentIndex + 1) % baseLeads.length;
    const nextLead = baseLeads[nextIndex];
    
    console.log('Navigating to index:', nextIndex, 'lead:', nextLead?.name);
    
    // Update navigation first
    updateNavigation(nextIndex);
    
    // Then execute auto-call if enabled
    if (autoCall && nextLead) {
      executeAutoCall(nextLead);
    }
  };

  return { handleNext };
};
