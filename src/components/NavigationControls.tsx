
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Shuffle } from 'lucide-react';

interface NavigationControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  onToggleShuffle: () => void;
  onToggleAutoCall: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  shuffleMode: boolean;
  autoCall: boolean;
}

const NavigationControls: React.FC<NavigationControlsProps> = ({
  onPrevious,
  onNext,
  onToggleShuffle,
  onToggleAutoCall,
  canGoPrevious,
  canGoNext,
  shuffleMode,
  autoCall
}) => {
  return (
    <div className="space-y-4">
      {/* Previous/Next Navigation */}
      <div className="flex gap-4">
        <Button 
          variant="outline" 
          onClick={onPrevious} 
          disabled={!canGoPrevious} 
          className="flex-1 h-12 rounded-2xl shadow-lg active:scale-95 transition-transform duration-100 select-none outline-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <Button 
          variant="outline" 
          onClick={onNext} 
          disabled={!canGoNext} 
          className="flex-1 h-12 rounded-2xl shadow-lg active:scale-95 transition-transform duration-100 select-none outline-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center space-y-1 flex-1">
          <button 
            onClick={onToggleShuffle} 
            disabled={!canGoNext} 
            className="p-3 rounded-full disabled:opacity-50"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <Shuffle className={`h-5 w-5 ${shuffleMode ? 'text-orange-500' : 'text-muted-foreground'}`} />
          </button>
        </div>
        
        <div className="flex flex-col items-center space-y-1 flex-1">
          <button 
            onClick={onToggleAutoCall} 
            className={`text-sm font-medium px-3 py-1 rounded ${autoCall ? 'text-green-600' : 'text-muted-foreground'}`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            Auto Call
          </button>
        </div>
      </div>
    </div>
  );
};

export default NavigationControls;
