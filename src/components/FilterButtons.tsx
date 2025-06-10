
import React from 'react';
import { RotateCcw } from 'lucide-react';

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
    <div className="space-y-2">
      {/* First row: Timezone and Call filters */}
      <div className="flex">
        <div className="flex-1 flex justify-center">
          <button 
            onClick={onToggleTimezone} 
            className={`text-sm font-medium px-6 py-4 rounded transition-all duration-200 min-h-[48px] min-w-[120px] ${
              timezoneFilter === 'EST_CST' ? 'text-blue-600 animate-button-switch' : 'text-muted-foreground'
            }`} 
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {timezoneFilter === 'ALL' ? 'All States' : 'EST, CST & CDT'}
          </button>
        </div>
        <div className="flex-1 flex justify-center items-center gap-2">
          <button 
            onClick={onToggleCallFilter} 
            className={`text-sm font-medium px-6 py-4 rounded transition-all duration-200 min-h-[48px] min-w-[120px] ${
              callFilter === 'UNCALLED' ? 'text-purple-600 animate-button-switch' : 'text-muted-foreground'
            }`} 
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {callFilter === 'ALL' ? 'All Numbers' : 'Uncalled Numbers'}
          </button>
          {callFilter === 'UNCALLED' && (
            <button
              onClick={onResetAllCalls}
              className="text-muted-foreground hover:text-foreground transition-colors p-2 min-h-[32px] min-w-[32px]"
              title="Reset all call counts"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Second row: Shuffle and Auto Call */}
      <div className="flex">
        <div className="flex-1 flex justify-center">
          <button 
            onClick={onToggleShuffle} 
            className={`text-sm font-medium px-6 py-4 rounded transition-all duration-200 min-h-[48px] min-w-[120px] ${
              shuffleMode ? 'text-orange-600 animate-button-switch' : 'text-muted-foreground'
            }`} 
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            Shuffle
          </button>
        </div>
        <div className="flex-1 flex justify-center">
          <button 
            onClick={onToggleAutoCall} 
            className={`text-sm font-medium px-6 py-4 rounded transition-all duration-200 min-h-[48px] min-w-[120px] ${
              autoCall ? 'text-green-600 animate-button-switch' : 'text-muted-foreground'
            }`} 
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            Auto Call
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterButtons;
