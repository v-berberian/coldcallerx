
import { Lead } from '../types/lead';

interface UseNavigationHandlersProps {
  handleNext: (baseLeads: Lead[]) => void;
  handlePrevious: (baseLeads: Lead[]) => void;
  getBaseLeads: () => Lead[];
  currentIndex: number;
  updateSession?: (index: number) => Promise<void>;
}

export const useNavigationHandlers = ({
  handleNext,
  handlePrevious,
  getBaseLeads,
  currentIndex,
  updateSession
}: UseNavigationHandlersProps) => {
  // Create wrapper functions for navigation that handle session saving
  const handleNextWrapper = async () => {
    const currentLeads = getBaseLeads();
    console.log('Navigation wrapper: Next clicked, leads count:', currentLeads.length);
    
    // Calculate the new index before navigation
    const newIndex = (currentIndex + 1) % currentLeads.length;
    
    // Navigate first
    handleNext(currentLeads);
    
    // Save session state after navigation (non-blocking)
    if (updateSession) {
      try {
        await updateSession(newIndex);
      } catch (error) {
        console.error('Failed to save navigation state:', error);
        // Don't block navigation if session save fails
      }
    }
  };

  const handlePreviousWrapper = async () => {
    const currentLeads = getBaseLeads();
    console.log('Navigation wrapper: Previous clicked, leads count:', currentLeads.length);
    
    // Calculate the new index before navigation
    const newIndex = currentIndex > 0 ? currentIndex - 1 : currentLeads.length - 1;
    
    // Navigate first
    handlePrevious(currentLeads);
    
    // Save session state after navigation (non-blocking)
    if (updateSession) {
      try {
        await updateSession(newIndex);
      } catch (error) {
        console.error('Failed to save navigation state:', error);
        // Don't block navigation if session save fails
      }
    }
  };

  return {
    handleNextWrapper,
    handlePreviousWrapper
  };
};
