
import { useRef, useCallback } from 'react';

interface UseLongPressNavigationProps {
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

export const useLongPressNavigation = ({
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious
}: UseLongPressNavigationProps) => {
  const nextIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const nextTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearAllTimers = useCallback(() => {
    if (nextIntervalRef.current) {
      clearInterval(nextIntervalRef.current);
      nextIntervalRef.current = null;
    }
    if (previousIntervalRef.current) {
      clearInterval(previousIntervalRef.current);
      previousIntervalRef.current = null;
    }
    if (nextTimeoutRef.current) {
      clearTimeout(nextTimeoutRef.current);
      nextTimeoutRef.current = null;
    }
    if (previousTimeoutRef.current) {
      clearTimeout(previousTimeoutRef.current);
      previousTimeoutRef.current = null;
    }
  }, []);

  const handleNextMouseDown = useCallback(() => {
    if (!canGoNext) return;
    
    // Single click
    onNext();
    
    // Start long press timer
    nextTimeoutRef.current = setTimeout(() => {
      if (canGoNext) {
        // Start fast forwarding after 1 second
        nextIntervalRef.current = setInterval(() => {
          onNext();
        }, 200); // Navigate every 200ms during fast forward
      }
    }, 1000);
  }, [onNext, canGoNext]);

  const handlePreviousMouseDown = useCallback(() => {
    if (!canGoPrevious) return;
    
    // Single click
    onPrevious();
    
    // Start long press timer
    previousTimeoutRef.current = setTimeout(() => {
      if (canGoPrevious) {
        // Start fast forwarding after 1 second
        previousIntervalRef.current = setInterval(() => {
          onPrevious();
        }, 200); // Navigate every 200ms during fast forward
      }
    }, 1000);
  }, [onPrevious, canGoPrevious]);

  const handleMouseUp = useCallback(() => {
    clearAllTimers();
  }, [clearAllTimers]);

  const handleMouseLeave = useCallback(() => {
    clearAllTimers();
  }, [clearAllTimers]);

  return {
    handleNextMouseDown,
    handlePreviousMouseDown,
    handleMouseUp,
    handleMouseLeave
  };
};
