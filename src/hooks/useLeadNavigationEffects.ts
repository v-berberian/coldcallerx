import { Lead } from '../types/lead';

interface UseLeadNavigationEffectsProps {
  makeCall: (lead: Lead, markAsCalled?: boolean, onCallMade?: () => void, onTransitionDetected?: () => void) => void;
  markLeadAsCalledOnNavigation: (lead: Lead) => void;
  setCallMadeToCurrentLead: (called: boolean) => void;
  setCallMadeLeadKey: (key: string | null) => void;
  executeAutoCall: (lead: Lead) => void;
  handleCountdownComplete: (lead: Lead) => void;
  resetAutoCall: () => void;
  currentLeadForAutoCall: Lead | null;
  setCurrentLeadForAutoCall: (lead: Lead | null) => void;
}

export const useLeadNavigationEffects = ({
  makeCall,
  setCallMadeToCurrentLead,
  setCallMadeLeadKey,
  resetAutoCall,
  currentLeadForAutoCall,
  setCurrentLeadForAutoCall,
  executeAutoCall,
  handleCountdownComplete
}: UseLeadNavigationEffectsProps) => {

  // Enhanced make call function that tracks call state but doesn't mark as called immediately
  const makeCallWrapper = (lead: Lead) => {
    // Pass a callback that will be called only when iOS transitions to Phone app
    const leadKey = `${lead.name}-${lead.phone}`;
    const onTransitionDetected = () => {
      setCallMadeToCurrentLead(true);
      setCallMadeLeadKey(leadKey);
    };

    // Store key immediately in case callback late
    setCallMadeLeadKey(leadKey);
    
    makeCall(lead, false, undefined, onTransitionDetected); // Don't mark as called immediately
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
