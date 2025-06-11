
import { Lead } from '../types/lead';

interface UseFilterActionsProps {
  toggleTimezoneFilter: () => void;
  toggleCallFilter: () => void;
  toggleShuffle: () => void;
  toggleAutoCall: () => void;
  resetShownLeads: () => void;
  isCountdownActive: boolean;
  cancelAutoCall: () => void;
  autoCall: boolean;
}

export const useFilterActions = ({
  toggleTimezoneFilter,
  toggleCallFilter,
  toggleShuffle,
  toggleAutoCall,
  resetShownLeads,
  isCountdownActive,
  cancelAutoCall,
  autoCall
}: UseFilterActionsProps) => {

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

  // Fixed auto call toggle - simple toggle behavior
  const toggleAutoCallWrapper = () => {
    // Always toggle auto call state
    toggleAutoCall();
    
    // If countdown is active when turning off, cancel it
    if (autoCall && isCountdownActive) {
      cancelAutoCall();
    }
  };

  return {
    toggleTimezoneFilter: toggleTimezoneFilterWrapper,
    toggleCallFilter: toggleCallFilterWrapper,
    toggleShuffle: toggleShuffleWrapper,
    toggleAutoCall: toggleAutoCallWrapper
  };
};
