import { useState, useRef, useCallback } from 'react';
import { Lead } from '@/types/lead';

// Gesture type to distinguish delete vs flip
type GestureType = 'none' | 'delete' | 'flip';

export const useLeadCardSwipe = (
  onDeleteLead?: (lead: Lead) => void,
  onFlip?: () => void,
  isFlipped?: boolean
) => {
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [cardHeight, setCardHeight] = useState<number>(0);
  const [gestureType, setGestureType] = useState<GestureType>('none');
  const cardRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const gestureTypeRef = useRef<GestureType>('none');
  const startedInScrollAreaRef = useRef<boolean>(false);

  // Measure card height for delete background
  const measureCardHeight = useCallback(() => {
    if (cardRef.current) {
      const height = cardRef.current.offsetHeight;
      setCardHeight(height);
    }
  }, [isFlipped]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const cardRect = cardRef.current?.getBoundingClientRect();
    const target = e.target as Element | null;
    const startedInCommentsScroll = !!target?.closest('[data-comments-scroll="true"]');
    startedInScrollAreaRef.current = startedInCommentsScroll;
    
    if (cardRect) {
      const cardRight = cardRect.right;
      const cardLeft = cardRect.left;
      const cardWidth = cardRight - cardLeft;
      const edgeArea = cardWidth * 0.2; // 20% of card width from either edge

      // When flipped: delete disabled; allow flip anywhere, but if started in a scroll area
      // we'll require a higher threshold in move to avoid accidental flips while scrolling
      if (isFlipped) {
        touchStartX.current = touchX;
        touchStartY.current = touchY;
        gestureTypeRef.current = 'flip';
        setGestureType('flip');
        setIsSwiping(true);
        return;
      }

      // Detect swipe start near right edge for delete
      if (touchX >= cardRight - edgeArea) {
        touchStartX.current = touchX;
        touchStartY.current = touchY;
        gestureTypeRef.current = 'delete';
        setGestureType('delete');
        setIsSwiping(true);
        return;
      }

      // Otherwise treat as potential flip gesture from anywhere (front side)
      touchStartX.current = touchX;
      touchStartY.current = touchY;
      gestureTypeRef.current = 'flip';
      setGestureType('flip');
      setIsSwiping(true);
      return;
    }
  }, [isFlipped]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwiping) return;
    
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const deltaX = touchX - touchStartX.current;
    const deltaY = Math.abs(touchY - touchStartY.current);
    
    // Only allow horizontal swiping (prevent vertical scrolling interference)
    if (deltaY < 50) {
      if (gestureTypeRef.current === 'delete' && deltaX < 0) {
        // Animate to full delete state
        setIsSwiping(false); // Enable transitions
        setSwipeOffset(-100);
        setIsDeleteMode(true);
      }
      const baseFlipThreshold = 45;
      const threshold = startedInScrollAreaRef.current ? baseFlipThreshold * 1.6 : baseFlipThreshold;
      if (gestureTypeRef.current === 'flip' && deltaX > threshold) {
        // Trigger flip when swiping from left to right past threshold
        setIsSwiping(false);
        gestureTypeRef.current = 'none';
        setGestureType('none');
        if (onFlip) {
          onFlip();
        }
      }
    }
  }, [isSwiping, onFlip]);

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping) return;
    
    setIsSwiping(false);
    // Card is already in full delete state, no need to adjust
    gestureTypeRef.current = 'none';
    setGestureType('none');
  }, [isSwiping]);

  const handleDeleteClick = useCallback((lead: Lead) => {
    if (onDeleteLead) {
      onDeleteLead(lead);
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
    setGestureType('none');
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
    resetSwipe,
    gestureType
  };
}; 