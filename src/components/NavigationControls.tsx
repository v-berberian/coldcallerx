import React from 'react';
import { Button } from '@/components/ui/button';
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

  return (
    <div className="flex gap-3 sm:gap-4 w-full pb-8 sm:pb-6" style={{ paddingBottom: 'max(2rem, calc(env(safe-area-inset-bottom) + 1rem))' }}>
      <Button 
        variant="outline" 
        onClick={handlePrevious} 
        disabled={!canGoPrevious} 
        className="flex-1 h-16 sm:h-20 rounded-[2rem] shadow-lg active:scale-95 active:shadow-md active:shadow-black/20 transition-all duration-100 select-none outline-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-background/20 backdrop-blur-xl border-white/20 hover:bg-background/30 hover:border-white/30 text-foreground disabled:opacity-50 disabled:backdrop-blur-sm touch-manipulation text-base sm:text-lg user-select-none" 
        style={{ WebkitTapHighlightColor: 'transparent', WebkitUserSelect: 'none', userSelect: 'none' }} 
        onTouchStart={() => {}} 
        onTouchEnd={() => {}}
      >
        <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
        <span className="truncate">Previous</span>
      </Button>
      
      <Button 
        variant="outline" 
        onClick={handleNext} 
        disabled={!canGoNext} 
        className="flex-1 h-16 sm:h-20 rounded-[2rem] shadow-lg active:scale-95 active:shadow-md active:shadow-black/20 transition-all duration-100 select-none outline-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-background/20 backdrop-blur-xl border-white/20 hover:bg-background/30 hover:border-white/30 text-foreground disabled:opacity-50 disabled:backdrop-blur-sm touch-manipulation text-base sm:text-lg user-select-none" 
        style={{ WebkitTapHighlightColor: 'transparent', WebkitUserSelect: 'none', userSelect: 'none' }} 
        onTouchStart={() => {}} 
        onTouchEnd={() => {}}
      >
        <span className="truncate">Next</span>
        <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 ml-2" />
      </Button>
    </div>
  );
};

export default NavigationControls;
