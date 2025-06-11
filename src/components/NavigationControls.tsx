
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
  return (
    <div className="flex gap-4">
      <Button 
        variant="outline" 
        onClick={onPrevious} 
        disabled={!canGoPrevious} 
        className="flex-1 h-14 rounded-2xl shadow-xl active:scale-95 transition-all duration-200 select-none outline-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 hover:border-white/30" 
        style={{ 
          WebkitTapHighlightColor: 'transparent',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)'
        }} 
        onTouchStart={() => {}} 
        onTouchEnd={() => {}}
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Previous
      </Button>
      
      <Button 
        variant="outline" 
        onClick={onNext} 
        disabled={!canGoNext} 
        className="flex-1 h-14 rounded-2xl shadow-xl active:scale-95 transition-all duration-200 select-none outline-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 hover:border-white/30" 
        style={{ 
          WebkitTapHighlightColor: 'transparent',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)'
        }} 
        onTouchStart={() => {}} 
        onTouchEnd={() => {}}
      >
        Next
        <ArrowRight className="h-5 w-5 ml-2" />
      </Button>
    </div>
  );
};

export default NavigationControls;
