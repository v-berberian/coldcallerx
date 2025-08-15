import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, MoreVertical, SkipForward, FastForward, Shuffle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavigationControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onSkipToEnd?: () => void;
  onSkipMultiple?: (count: number) => void;
  shuffleMode?: boolean;
  onToggleShuffle?: () => void;
}

const NavigationControls: React.FC<NavigationControlsProps> = ({
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  onSkipToEnd,
  onSkipMultiple,
  shuffleMode = false,
  onToggleShuffle
}) => {
  const handlePrevious = () => {
    onPrevious();
  };

  const handleNext = () => {
    onNext();
  };

  const handleShuffle = () => {
    if (onToggleShuffle) {
      onToggleShuffle();
    }
  };

  // Long press state and handlers
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [longPressTimeout, setLongPressTimeout] = React.useState<NodeJS.Timeout | null>(null);
  const [isLongPressing, setIsLongPressing] = React.useState(false);

  // Swipe gesture state
  const [swipeStart, setSwipeStart] = React.useState<{ x: number; y: number; time: number } | null>(null);
  const [isSwiping, setIsSwiping] = React.useState(false);
  const [swipeDirection, setSwipeDirection] = React.useState<'left' | 'right' | null>(null);

  const handleButtonTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsLongPressing(false);
    setIsSwiping(false);
    setSwipeDirection(null);

    // Get touch/mouse coordinates
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setSwipeStart({
      x: clientX,
      y: clientY,
      time: Date.now()
    });

    const timeout = setTimeout(() => {
      if (!isSwiping) {
        setIsLongPressing(true);
        setIsDropdownOpen(true);
      }
    }, 1000); // 1000ms long press
    setLongPressTimeout(timeout);
  };

  const handleButtonTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!swipeStart) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - swipeStart.x;
    const deltaY = clientY - swipeStart.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Detect significant movement (minimum 30px to start considering it a swipe)
    if (distance > 30) {
      setIsSwiping(true);
      
      // Cancel long press if swiping
      if (longPressTimeout) {
        clearTimeout(longPressTimeout);
        setLongPressTimeout(null);
      }

      // Determine swipe direction (horizontal swipes only)
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      
      // Only consider horizontal swipes where horizontal movement is dominant
      if (absX > absY && absX > 40) {
        setSwipeDirection(deltaX > 0 ? 'right' : 'left');
      }
    }
  };

  const handleButtonTouchEnd = () => {
    if (longPressTimeout) {
      clearTimeout(longPressTimeout);
      setLongPressTimeout(null);
    }

    const wasSwipe = isSwiping && swipeStart && swipeDirection;
    const swipeTime = swipeStart ? Date.now() - swipeStart.time : 0;

    // Reset swipe state
    setSwipeStart(null);
    setIsSwiping(false);
    
    // Handle swipe gesture (only left swipe to toggle shuffle)
    if (wasSwipe && swipeDirection === 'left' && swipeTime < 500 && swipeTime > 100) {
      // Left swipe detected - toggle shuffle
      if (onToggleShuffle) {
        onToggleShuffle();
      }
      setSwipeDirection(null);
      setIsLongPressing(false);
      return;
    }

    setSwipeDirection(null);
    
    // Only trigger normal action if it wasn't a long press or swipe
    if (!isLongPressing && !wasSwipe) {
      handleNext();
    }
    setIsLongPressing(false);
  };

  const handleDropdownItemClick = (action: () => void) => {
    setIsDropdownOpen(false);
    action();
  };

  // Detect when the software keyboard is likely open to reduce bottom spacing
  const [isKeyboardOpen, setIsKeyboardOpen] = React.useState(false);

  React.useEffect(() => {
    const isEditableElement = (el: Element | null) => {
      if (!el) return false;
      const tag = el.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return true;
      if ((el as HTMLElement).isContentEditable) return true;
      return false;
    };

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as Element | null;
      if (isEditableElement(target)) {
        setIsKeyboardOpen(true);
      }
    };

    const handleFocusOut = () => {
      // Delay to allow focus to move to another input if applicable
      setTimeout(() => {
        const active = document.activeElement as Element | null;
        setIsKeyboardOpen(isEditableElement(active));
      }, 50);
    };

    // Optional: visual viewport heuristic (helps on iOS/Android browsers)
    let detachViewport: (() => void) | null = null;
    const attachViewportListener = () => {
      const vv = (window as unknown as Window & { visualViewport?: VisualViewport }).visualViewport;
      if (!vv) return;
      const baseline = window.innerHeight;
      const onResize = () => {
        try {
          const heightDelta = baseline - vv.height;
          // Consider keyboard open if viewport shrinks significantly
          setIsKeyboardOpen(prev => prev || heightDelta > 140);
        } catch {
          // noop
        }
      };
      vv.addEventListener('resize', onResize);
      detachViewport = () => vv.removeEventListener('resize', onResize);
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    attachViewportListener();

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      if (detachViewport) detachViewport();
    };
  }, []);

  const paddingBottomValue = isKeyboardOpen
    ? '0'
    : 'max(2rem, calc(env(safe-area-inset-bottom) + 1rem))';

  return (
    <AnimatePresence initial={false}>
      <motion.div
        className="w-full"
        style={{ paddingBottom: paddingBottomValue, overflow: 'hidden' }}
        initial={false}
        animate={isKeyboardOpen ? { opacity: 0, y: 12, maxHeight: 0, pointerEvents: 'none' } : { opacity: 1, y: 0, maxHeight: 400, pointerEvents: 'auto' }}
        transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="flex gap-3 sm:gap-4 w-full">
          <Button 
        variant="outline" 
        onClick={handlePrevious} 
        disabled={!canGoPrevious} 
        className="flex-1 h-16 sm:h-20 rounded-[2rem] shadow-lg active:scale-95 active:shadow-md active:shadow-black/20 transition-all duration-100 outline-none bg-background/20 backdrop-blur-xl border-white/20 text-foreground disabled:opacity-50 disabled:backdrop-blur-sm touch-manipulation no-select text-base sm:text-lg" 
        style={{ WebkitTapHighlightColor: 'transparent', WebkitUserSelect: 'none', userSelect: 'none' }} 
        onTouchStart={() => {}} 
        onTouchEnd={() => {}}
      >
        <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
        <span className="truncate">Previous</span>
      </Button>
      
      <DropdownMenu open={isDropdownOpen} onOpenChange={(open) => {
        // Only allow closing the dropdown, not opening it
        if (!open) {
          setIsDropdownOpen(false);
        }
      }}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            disabled={!canGoNext} 
            className="flex-1 h-16 sm:h-20 rounded-[2rem] shadow-lg active:scale-95 active:shadow-md active:shadow-black/20 transition-all duration-100 outline-none bg-background/20 backdrop-blur-xl border-white/20 text-foreground disabled:opacity-50 disabled:backdrop-blur-sm touch-manipulation no-select text-base sm:text-lg" 
            style={{ WebkitTapHighlightColor: 'transparent', WebkitUserSelect: 'none', userSelect: 'none' }} 
            onTouchStart={handleButtonTouchStart} 
            onTouchMove={handleButtonTouchMove}
            onTouchEnd={handleButtonTouchEnd}
            onMouseDown={handleButtonTouchStart}
            onMouseMove={handleButtonTouchMove}
            onMouseUp={handleButtonTouchEnd}
            onMouseLeave={() => {
              if (longPressTimeout) {
                clearTimeout(longPressTimeout);
                setLongPressTimeout(null);
              }
              setIsLongPressing(false);
            }}
            onClick={(e) => {
              // Prevent the dropdown from opening on regular clicks
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div className="flex items-center relative">
              <span className="truncate">Next</span>
              <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 ml-2" />
              {shuffleMode && (
                <Shuffle className="h-3 w-3 absolute -top-1 -right-1 text-orange-500 bg-background/80 rounded-full p-0.5" />
              )}
              {isSwiping && swipeDirection === 'left' && (
                <div className="absolute inset-0 flex items-center justify-center bg-orange-500/20 rounded-full">
                  <Shuffle className="h-4 w-4 text-orange-600" />
                </div>
              )}
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {shuffleMode ? (
            // When in shuffle mode, show Next option and skip options
            <>
              <DropdownMenuItem 
                onClick={() => handleDropdownItemClick(handleNext)}
                className="flex items-center gap-2"
              >
                <ArrowRight className="h-4 w-4" />
                Next Lead
              </DropdownMenuItem>
              {onSkipMultiple && (
                <>
                  <DropdownMenuItem 
                    onClick={() => handleDropdownItemClick(() => onSkipMultiple(5))}
                    className="flex items-center gap-2"
                  >
                    <SkipForward className="h-4 w-4" />
                    Skip 5 Leads
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDropdownItemClick(() => onSkipMultiple(10))}
                    className="flex items-center gap-2"
                  >
                    <SkipForward className="h-4 w-4" />
                    Skip 10 Leads
                  </DropdownMenuItem>
                </>
              )}
              {onSkipToEnd && (
                <DropdownMenuItem 
                  onClick={() => handleDropdownItemClick(onSkipToEnd)}
                  className="flex items-center gap-2"
                >
                  <FastForward className="h-4 w-4" />
                  Skip to End
                </DropdownMenuItem>
              )}
            </>
          ) : (
            // When in next mode, show Shuffle option and skip options
            <>
              {onToggleShuffle && (
                <DropdownMenuItem 
                  onClick={() => handleDropdownItemClick(handleShuffle)}
                  className="flex items-center gap-2"
                >
                  <Shuffle className="h-4 w-4" />
                  Shuffle
                </DropdownMenuItem>
              )}
              {onSkipMultiple && (
                <>
                  <DropdownMenuItem 
                    onClick={() => handleDropdownItemClick(() => onSkipMultiple(5))}
                    className="flex items-center gap-2"
                  >
                    <SkipForward className="h-4 w-4" />
                    Skip 5 Leads
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDropdownItemClick(() => onSkipMultiple(10))}
                    className="flex items-center gap-2"
                  >
                    <SkipForward className="h-4 w-4" />
                    Skip 10 Leads
                  </DropdownMenuItem>
                </>
              )}
              {onSkipToEnd && (
                <DropdownMenuItem 
                  onClick={() => handleDropdownItemClick(onSkipToEnd)}
                  className="flex items-center gap-2"
                >
                  <FastForward className="h-4 w-4" />
                  Skip to End
                </DropdownMenuItem>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NavigationControls;
