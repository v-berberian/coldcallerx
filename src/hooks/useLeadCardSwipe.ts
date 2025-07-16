import { useState, useRef, useCallback } from 'react';
import { Lead } from '@/types/lead';

export const useLeadCardSwipe = (onDeleteLead?: (lead: Lead) => void) => {
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [cardHeight, setCardHeight] = useState<number>(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  // Measure card height for delete background
  const measureCardHeight = useCallback(() => {
    if (cardRef.current) {
      const height = cardRef.current.offsetHeight;
      setCardHeight(height);
    }
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const cardRect = cardRef.current?.getBoundingClientRect();
    
    if (cardRect) {
      const cardRight = cardRect.right;
      const cardLeft = cardRect.left;
      const cardWidth = cardRight - cardLeft;
      const rightEdgeArea = cardWidth * 0.2; // 20% of card width from right edge
      
      // Only allow swiping if touch starts in the right edge area
      if (touchX >= cardRight - rightEdgeArea) {
        touchStartX.current = touchX;
        touchStartY.current = touchY;
        setIsSwiping(true);
      }
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwiping) return;
    
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const deltaX = touchX - touchStartX.current;
    const deltaY = Math.abs(touchY - touchStartY.current);
    
    // Only allow horizontal swiping (prevent vertical scrolling interference)
    if (deltaY < 50 && deltaX < 0) {
      // Animate to full delete state
      setIsSwiping(false); // Enable transitions
      setSwipeOffset(-100);
      setIsDeleteMode(true);
    }
  }, [isSwiping]);

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping) return;
    
    setIsSwiping(false);
    // Card is already in full delete state, no need to adjust
  }, [isSwiping]);

  const handleDeleteClick = useCallback((lead: Lead) => {
    if (onDeleteLead) {
      setSwipeOffset(-400);
      setTimeout(() => {
        onDeleteLead(lead);
      }, 300);
    }
  }, [onDeleteLead]);

  const handleCardClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // If card is in delete mode, tap anywhere to slide back immediately
    if (isDeleteMode && swipeOffset < 0) {
      setSwipeOffset(0);
      setIsDeleteMode(false);
      e.preventDefault();
      e.stopPropagation();
    }
  }, [isDeleteMode, swipeOffset]);

  const resetSwipe = useCallback(() => {
    setSwipeOffset(0);
    setIsDeleteMode(false);
    setIsSwiping(false);
  }, []);

  return {
    isSwiping,
    swipeOffset,
    isDeleteMode,
    cardHeight,
    cardRef,
    measureCardHeight,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleDeleteClick,
    handleCardClick,
    resetSwipe
  };
}; 