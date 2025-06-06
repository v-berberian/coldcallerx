
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  onNext
}) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Button onClick={onPrevious} variant="outline" size="sm" className="rounded-xl">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Previous
      </Button>
      <Button onClick={onNext} variant="outline" size="sm" className="rounded-xl">
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
};

export default NavigationControls;
