
import React from 'react';
import { RotateCcw } from 'lucide-react';

interface FilterButtonsProps {
  timezoneFilter: 'ALL' | 'EST_CST';
  callFilter: 'ALL' | 'UNCALLED';
  onToggleTimezone: () => void;
  onToggleCallFilter: () => void;
  onResetAllCalls: () => void;
}

const FilterButtons: React.FC<FilterButtonsProps> = ({
  timezoneFilter,
  callFilter,
  onToggleTimezone,
  onToggleCallFilter,
  onResetAllCalls
}) => {
  return (
    <div className="flex">
      <div className="flex-1 flex justify-center">
        <button 
          onClick={onToggleTimezone} 
          className={`text-sm font-medium px-3 py-1 rounded transition-all duration-200 ${
            timezoneFilter === 'EST_CST' ? 'text-blue-600 animate-button-switch' : 'text-muted-foreground'
          }`} 
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {timezoneFilter === 'ALL' ? 'All States' : 'EST & CST'}
        </button>
      </div>
      <div className="flex-1 flex justify-center items-center gap-2">
        <button 
          onClick={onToggleCallFilter} 
          className={`text-sm font-medium px-3 py-1 rounded transition-all duration-200 ${
            callFilter === 'UNCALLED' ? 'text-purple-600 animate-button-switch' : 'text-muted-foreground'
          }`} 
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {callFilter === 'ALL' ? 'All Numbers' : 'Uncalled Numbers'}
        </button>
        {callFilter === 'UNCALLED' && (
          <button
            onClick={onResetAllCalls}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            title="Reset all call counts"
          >
            <RotateCcw size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterButtons;
