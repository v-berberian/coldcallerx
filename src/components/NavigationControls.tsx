import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Shuffle } from 'lucide-react';

interface NavigationControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  shuffleMode?: boolean;
  onToggleShuffle?: () => void;
}

const NavigationControls: React.FC<NavigationControlsProps> = ({
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  shuffleMode = false,
  onToggleShuffle
}) => {
  const handlePrevious = () => {
    onPrevious();
  };

  const handleNext = () => {
    onNext();
  };

  const handleNextClick = () => {
    if (shuffleMode) {
      if (onToggleShuffle) {
        onToggleShuffle();
      }
    } else {
      handleNext();
    }
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
      
      <Button 
        variant="outline" 
        onClick={handleNextClick} 
        disabled={!canGoNext} 
        className="flex-1 h-16 sm:h-20 rounded-[2rem] shadow-lg active:scale-95 active:shadow-md active:shadow-black/20 transition-all duration-100 outline-none bg-background/20 backdrop-blur-xl border-white/20 text-foreground disabled:opacity-50 disabled:backdrop-blur-sm touch-manipulation no-select text-base sm:text-lg" 
        style={{ WebkitTapHighlightColor: 'transparent', WebkitUserSelect: 'none', userSelect: 'none' }} 
        onTouchStart={() => {}} 
        onTouchEnd={() => {}}
      >
        <span className="truncate">{shuffleMode ? 'Shuffle' : 'Next'}</span>
        {shuffleMode ? (
          <Shuffle className="h-5 w-5 sm:h-6 sm:w-6 ml-2" />
        ) : (
          <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 ml-2" />
        )}
      </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NavigationControls;
