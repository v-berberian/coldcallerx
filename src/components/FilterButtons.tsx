
import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Phone, RotateCcw, Shuffle, Zap } from 'lucide-react';

interface FilterButtonsProps {
  timezoneFilter: 'ALL' | 'EST_CST';
  callFilter: 'ALL' | 'UNCALLED';
  shuffleMode: boolean;
  autoCall: boolean;
  onToggleTimezone: () => void;
  onToggleCallFilter: () => void;
  onToggleShuffle: () => void;
  onToggleAutoCall: () => void;
  onResetAllCalls: () => void;
}

const FilterButtons: React.FC<FilterButtonsProps> = ({
  timezoneFilter,
  callFilter,
  shuffleMode,
  autoCall,
  onToggleTimezone,
  onToggleCallFilter,
  onToggleShuffle,
  onToggleAutoCall,
  onResetAllCalls
}) => {
  return (
    <div className="space-y-3">
      {/* Filter buttons row */}
      <div className="flex space-x-2">
        <Button
          onClick={onToggleTimezone}
          variant={timezoneFilter === 'EST_CST' ? 'default' : 'outline'}
          size="sm"
          className="flex-1 text-xs rounded-xl border-0"
        >
          <Clock className="h-3 w-3 mr-1" />
          {timezoneFilter === 'EST_CST' ? 'EST/CST' : 'All States'}
        </Button>
        
        <Button
          onClick={onToggleCallFilter}
          variant={callFilter === 'UNCALLED' ? 'default' : 'outline'}
          size="sm"
          className="flex-1 text-xs rounded-xl border-0"
        >
          <Phone className="h-3 w-3 mr-1" />
          {callFilter === 'UNCALLED' ? 'Uncalled' : 'All Numbers'}
        </Button>
        
        <Button
          onClick={onResetAllCalls}
          variant="outline"
          size="sm"
          className="text-xs rounded-xl border-0"
          title="Reset all call counts"
        >
          <RotateCcw className="h-3 w-3" />
        </Button>
      </div>

      {/* Shuffle and AutoCall buttons row */}
      <div className="flex space-x-2">
        <Button
          onClick={onToggleShuffle}
          variant={shuffleMode ? 'default' : 'outline'}
          size="sm"
          className="flex-1 text-xs rounded-xl border-0"
        >
          <Shuffle className="h-3 w-3 mr-1" />
          {shuffleMode ? 'Shuffle ON' : 'Sequential'}
        </Button>
        
        <Button
          onClick={onToggleAutoCall}
          variant={autoCall ? 'default' : 'outline'}
          size="sm"
          className="flex-1 text-xs rounded-xl border-0"
        >
          <Zap className="h-3 w-3 mr-1" />
          {autoCall ? 'AutoCall ON' : 'Manual Call'}
        </Button>
      </div>
    </div>
  );
};

export default FilterButtons;
