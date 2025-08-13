import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface NavigationControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

const NavigationControls: React.FC<NavigationControlsProps> = ({
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext
}) => {
  const handlePrevious = () => {
    onPrevious();
  };

  const handleNext = () => {
    onNext();
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
      const vv = (window as Window & { visualViewport?: VisualViewport }).visualViewport;
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
    ? 'calc(env(safe-area-inset-bottom) + 0.25rem)'
    : 'max(2rem, calc(env(safe-area-inset-bottom) + 1rem))';

  // Long-press for Next dropdown
  const [nextMenuOpen, setNextMenuOpen] = React.useState(false);
  const longPressTimerRef = React.useRef<number | null>(null);
  const longPressTriggeredRef = React.useRef(false);
  const LONG_PRESS_MS = 350;

  const startNextLongPress = () => {
    longPressTriggeredRef.current = false;
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
    }
    longPressTimerRef.current = window.setTimeout(() => {
      longPressTriggeredRef.current = true;
      setNextMenuOpen(true);
    }, LONG_PRESS_MS);
  };

  const cancelNextLongPress = () => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const endNextPress = () => {
    const wasTriggered = longPressTriggeredRef.current;
    cancelNextLongPress();
    longPressTriggeredRef.current = false;
    if (!wasTriggered) {
      handleNext();
    }
  };

  const handleNextClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // If long press opened the menu, suppress the click
    if (longPressTriggeredRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    handleNext();
  };

  const goNextTimes = (times: number) => {
    for (let i = 0; i < times; i += 1) {
      onNext();
    }
    setNextMenuOpen(false);
  };

  return (
    <div className="flex gap-3 sm:gap-4 w-full pb-8 sm:pb-6" style={{ paddingBottom: paddingBottomValue }}>
      <Button 
        variant="outline" 
        onClick={handlePrevious} 
        disabled={!canGoPrevious} 
        className="flex-1 h-16 sm:h-20 rounded-[2rem] shadow-lg active:scale-95 active:shadow-md active:shadow-black/20 transition-all duration-100 outline-none bg-background/20 backdrop-blur-xl border-white/20 text-foreground disabled:opacity-50 disabled:backdrop-blur-sm touch-manipulation no-select text-base sm:text-lg" 
        style={{ WebkitTapHighlightColor: 'transparent', WebkitUserSelect: 'none', userSelect: 'none' }} 
      >
        <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
        <span className="truncate">Previous</span>
      </Button>
      
      <DropdownMenu open={nextMenuOpen} onOpenChange={setNextMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            disabled={!canGoNext} 
            className="flex-1 h-16 sm:h-20 rounded-[2rem] shadow-lg active:scale-95 active:shadow-md active:shadow-black/20 transition-all duration-100 outline-none bg-background/20 backdrop-blur-xl border-white/20 text-foreground disabled:opacity-50 disabled:backdrop-blur-sm touch-manipulation no-select text-base sm:text-lg" 
            style={{ WebkitTapHighlightColor: 'transparent', WebkitUserSelect: 'none', userSelect: 'none' }} 
            // Pointer events (modern browsers)
            onPointerDown={startNextLongPress}
            onPointerUp={endNextPress}
            onPointerLeave={cancelNextLongPress}
            onPointerCancel={cancelNextLongPress}
            // Touch fallback (iOS Safari quirks)
            onTouchStart={startNextLongPress}
            onTouchEnd={endNextPress}
            onTouchCancel={cancelNextLongPress}
            // Mouse fallback (desktop)
            onMouseDown={startNextLongPress}
            onMouseUp={endNextPress}
            onMouseLeave={cancelNextLongPress}
            // Right-click opens menu immediately
            onContextMenu={(e) => { e.preventDefault(); setNextMenuOpen(true); }}
            // Click fallback if no long-press happened
            onClick={handleNextClick}
          >
            <span className="truncate">Next</span>
            <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="end" className="w-40">
          <DropdownMenuItem onClick={() => goNextTimes(1)}>Next</DropdownMenuItem>
          <DropdownMenuItem onClick={() => goNextTimes(5)}>Next 5</DropdownMenuItem>
          <DropdownMenuItem onClick={() => goNextTimes(10)}>Next 10</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default NavigationControls;
