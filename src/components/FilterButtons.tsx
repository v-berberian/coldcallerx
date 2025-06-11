
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
    <div className="space-y-1">
      {/* First row: Timezone and Call filters */}
      <div className="flex">
        <div className="flex-1">
          <button 
            onClick={onToggleTimezone} 
            className={`w-full text-sm font-medium py-4 px-2 rounded transition-all duration-200 ${
              timezoneFilter === 'EST_CST' ? 'text-blue-600 animate-button-switch' : 'text-muted-foreground'
            }`} 
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {timezoneFilter === 'ALL' ? 'All States' : 'EST, CST & CDT'}
          </button>
        </div>
        <div className="flex-1 flex items-center gap-2">
          <button 
            onClick={onToggleCallFilter} 
            className={`flex-1 text-sm font-medium py-4 px-2 rounded transition-all duration-200 ${
              callFilter === 'UNCALLED' ? 'text-purple-600 animate-button-switch' : 'text-muted-foreground'
            }`} 
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {callFilter === 'ALL' ? 'All Numbers' : 'Uncalled Numbers'}
          </button>
          {callFilter === 'UNCALLED' && (
            <button
              onClick={onResetAllCalls}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 min-w-[24px] h-[24px] flex items-center justify-center"
              title="Reset all call counts"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Second row: Shuffle and Auto Call */}
      <div className="flex">
        <div className="flex-1">
          <button 
            onClick={onToggleShuffle} 
            className={`w-full text-sm font-medium py-4 px-2 rounded transition-all duration-200 ${
              shuffleMode ? 'text-orange-600 animate-button-switch' : 'text-muted-foreground'
            }`} 
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            Shuffle
          </button>
        </div>
        <div className="flex-1">
          <button 
            onClick={onToggleAutoCall} 
            className={`w-full text-sm font-medium py-4 px-2 rounded transition-all duration-200 ${
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
