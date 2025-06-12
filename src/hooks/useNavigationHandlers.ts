
import { Lead } from '../types/lead';

interface UseNavigationHandlersProps {
  handleNext: (baseLeads: Lead[]) => void;
  handlePrevious: (baseLeads: Lead[]) => void;
  getBaseLeads: () => Lead[];
  currentIndex: number;
}

export const useNavigationHandlers = ({
  handleNext,
  handlePrevious,
  getBaseLeads,
  currentIndex
}: UseNavigationHandlersProps) => {
  // Create wrapper functions for navigation that pass the required baseLeads parameter
  const handleNextWrapper = async () => {
    const currentLeads = getBaseLeads();
    handleNext(currentLeads);
    
    // Save new index to session with sync
    if ((window as any).saveCurrentIndex) {
      const newIndex = (currentIndex + 1) % currentLeads.length;
      await (window as any).saveCurrentIndex(newIndex);
    }
  };

  const handlePreviousWrapper = async () => {
    const currentLeads = getBaseLeads();
    handlePrevious(currentLeads);
    
    // Save new index to session with sync
    if ((window as any).saveCurrentIndex) {
      const newIndex = currentIndex > 0 ? currentIndex - 1 : currentLeads.length - 1;
      await (window as any).saveCurrentIndex(newIndex);
    }
  };

  return {
    handleNextWrapper,
    handlePreviousWrapper
  };
};
