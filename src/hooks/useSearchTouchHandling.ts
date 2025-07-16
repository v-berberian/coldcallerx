import { useCallback } from 'react';
import { Lead } from '@/types/lead';

export const useSearchTouchHandling = (onLeadSelect?: (lead: Lead) => void, onCloseAutocomplete?: () => void) => {
  const createTouchHandlers = useCallback(() => {
    let touchStartTime = 0;
    let touchStartY = 0;
    let touchStartX = 0;
    let hasMoved = false;
    const moveThreshold = 10; // Slightly higher threshold for virtualized lists
    const timeThreshold = 300; // Maximum time for a tap

    const handleTouchStart = (e: React.TouchEvent) => {
      e.stopPropagation();
      
      // Reset tracking
      hasMoved = false;
      touchStartTime = Date.now();
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      e.stopPropagation();
      
      // Check if finger has moved significantly
      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const deltaY = Math.abs(currentY - touchStartY);
      const deltaX = Math.abs(currentX - touchStartX);
      
      if (deltaY > moveThreshold || deltaX > moveThreshold) {
        hasMoved = true;
      }
    };

    const handleTouchEnd = (e: React.TouchEvent, lead?: Lead) => {
      e.stopPropagation();
      
      const touchDuration = Date.now() - touchStartTime;
      
      // Only trigger lead selection if:
      // 1. No significant movement occurred
      // 2. Touch duration is short (indicating a tap, not a long press)
      if (!hasMoved && touchDuration < timeThreshold && lead) {
        onLeadSelect?.(lead);
        
        // Explicitly close the autocomplete when a lead is selected
        if (onCloseAutocomplete) {
          onCloseAutocomplete();
        }
      }
    };

    return {
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd
    };
  }, [onLeadSelect, onCloseAutocomplete]);

  return {
    createTouchHandlers
  };
}; 