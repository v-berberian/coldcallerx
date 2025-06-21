import { Lead } from '../types/lead';

interface UseLeadNavigationEffectsProps {
  makeCall: (lead: Lead, markAsCalled?: boolean, onCallMade?: () => void, onTransitionDetected?: () => void) => void;
  markLeadAsCalledOnNavigation: (lead: Lead) => void;
  setCallMadeToCurrentLead: (called: boolean) => void;
  executeAutoCall: (lead: Lead) => void;
  handleCountdownComplete: (lead: Lead) => void;
  resetAutoCall: () => void;
  currentLeadForAutoCall: Lead | null;
  setCurrentLeadForAutoCall: (lead: Lead | null) => void;
}

export const useLeadNavigationEffects = ({
  makeCall,
  setCallMadeToCurrentLead,
  resetAutoCall,
  currentLeadForAutoCall,
  setCurrentLeadForAutoCall,
  executeAutoCall,
  handleCountdownComplete
}: UseLeadNavigationEffectsProps) => {

  // Enhanced make call function that tracks call state but doesn't mark as called immediately
  const makeCallWrapper = (lead: Lead) => {
    // Pass a callback that will be called only when iOS transitions to Phone app
    const onTransitionDetected = () => {
      setCallMadeToCurrentLead(true); // Only set this when iOS actually transitions
      console.log('🎯 CALL FLAG SET: iOS transition detected - call was actually made to:', lead.name);
    };
    
    makeCall(lead, false, undefined, onTransitionDetected); // Don't mark as called immediately
    console.log('📞 CALL BUTTON PRESSED: Waiting for iOS transition to Phone app...');
  };

  const handleCountdownCompleteWrapper = () => {
    // This is no longer needed as countdown auto-completes, but keeping for compatibility
    if (currentLeadForAutoCall) {
      handleCountdownComplete(currentLeadForAutoCall);
      setCurrentLeadForAutoCall(null);
    }
  };

  return {
    makeCallWrapper,
    executeAutoCall,
    handleCountdownCompleteWrapper
  };
};
