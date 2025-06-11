import { Lead } from '../types/lead';

interface UseLeadNavigationEffectsProps {
  makeCall: (lead: Lead, markAsCalled?: boolean) => void;
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
    makeCall(lead, false); // Don't mark as called immediately
    setCallMadeToCurrentLead(true); // Track that a call was made
    console.log('Call made to lead:', lead.name, 'marked for call tracking on navigation');
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
