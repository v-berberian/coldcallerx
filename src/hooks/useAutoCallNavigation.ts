
import { Lead } from '../types/lead';

export const useAutoCallNavigation = (
  autoCall: boolean,
  pendingCallLead: Lead | null,
  currentIndex: number,
  markPendingCallAsCompleted: () => void,
  getBaseLeads: () => Lead[],
  updateNavigation: (index: number) => void,
  executeAutoCall: (lead: Lead) => void,
  isAutoCallInProgress: boolean,
  navigationHandleNext: (baseLeads: Lead[], autoCall: boolean, executeAutoCall: (lead: Lead) => void) => void
) => {
  const handleNext = () => {
    // If there's a pending call from auto-call, mark it as completed first
    if (autoCall && pendingCallLead) {
      console.log('Marking pending call as completed and proceeding with navigation');
      markPendingCallAsCompleted();
      
      // After marking as completed, we need to get fresh leads data and navigate
      // Use setTimeout to ensure the state update is processed
      setTimeout(() => {
        const freshBaseLeads = getBaseLeads();
        console.log('Fresh leads after marking call as completed:', freshBaseLeads.length);
        
        if (freshBaseLeads.length > 0) {
          // Find next available lead from current position
          let nextIndex = 0;
          if (currentIndex < freshBaseLeads.length - 1) {
            nextIndex = currentIndex + 1;
          } else {
            nextIndex = 0; // Wrap around
          }
          
          const nextLead = freshBaseLeads[nextIndex];
          console.log('Navigating to next lead after call completion:', nextLead?.name, 'at index:', nextIndex);
          
          updateNavigation(nextIndex);
          
          // Auto-call the next lead
          if (autoCall && nextLead) {
            executeAutoCall(nextLead);
          }
        }
      }, 10);
      
      return;
    }
    
    // Prevent next if auto-call is in progress
    if (isAutoCallInProgress) {
      console.log('Preventing next navigation because auto-call is in progress');
      return;
    }
    
    const baseLeads = getBaseLeads();
    navigationHandleNext(baseLeads, autoCall, executeAutoCall);
  };

  return { handleNext };
};
