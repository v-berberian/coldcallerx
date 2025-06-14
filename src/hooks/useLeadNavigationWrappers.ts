
import { Lead } from '../types/lead';

interface UseLeadNavigationWrappersProps {
  toggleShuffle: () => void;
  toggleCallFilter: () => void;
  toggleTimezoneFilter: () => void;
  toggleAutoCall: () => void;
  resetShownLeads: () => void;
  resetAutoCall: () => void;
  autoCall: boolean;
}

export const useLeadNavigationWrappers = ({
  toggleShuffle,
  toggleCallFilter,
  toggleTimezoneFilter,
  toggleAutoCall,
  resetShownLeads,
  resetAutoCall,
  autoCall
}: UseLeadNavigationWrappersProps) => {
  // Enhanced toggle functions to reset shown leads tracker
  const toggleShuffleWrapper = () => {
    toggleShuffle();
    resetShownLeads();
  };

  const toggleCallFilterWrapper = () => {
    toggleCallFilter();
    resetShownLeads();
  };

  const toggleTimezoneFilterWrapper = () => {
    toggleTimezoneFilter();
    resetShownLeads();
  };

  // Enhanced toggle auto-call to reset countdown when disabled
  const toggleAutoCallWrapper = () => {
    const wasAutoCallOn = autoCall;
    toggleAutoCall();
    
    // If turning auto-call OFF, reset any active countdown
    if (wasAutoCallOn) {
      resetAutoCall();
      console.log('Auto-call disabled, resetting countdown');
    }
  };

  return {
    toggleShuffleWrapper,
    toggleCallFilterWrapper,
    toggleTimezoneFilterWrapper,
    toggleAutoCallWrapper
  };
};
