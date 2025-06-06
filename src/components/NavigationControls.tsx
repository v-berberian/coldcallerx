
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

interface NavigationControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  onFirst: () => void;
  onLast: () => void;
  onUndo: () => void;
  canUndo: boolean;
  autoCall: boolean;
  onToggleAutoCall: () => void;
}

const NavigationControls: React.FC<NavigationControlsProps> = ({
  onPrevious,
  onNext,
  onFirst,
  onLast,
  onUndo,
  canUndo,
  autoCall,
  onToggleAutoCall
}) => {
  return (
    <div className="space-y-4">
      {/* Navigation buttons */}
      <div className="grid grid-cols-4 gap-2">
        <Button onClick={onFirst} variant="outline" size="sm" className="rounded-xl">
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button onClick={onPrevious} variant="outline" size="sm" className="rounded-xl">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button onClick={onNext} variant="outline" size="sm" className="rounded-xl">
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button onClick={onLast} variant="outline" size="sm" className="rounded-xl">
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      {/* Control buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button 
          onClick={onUndo} 
          variant="outline" 
          size="sm" 
          className="rounded-xl" 
          disabled={!canUndo}
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Undo
        </Button>
        <Button 
          onClick={onToggleAutoCall} 
          variant={autoCall ? "default" : "outline"} 
          size="sm" 
          className="rounded-xl"
        >
          Auto Call
        </Button>
      </div>
    </div>
  );
};

export default NavigationControls;
