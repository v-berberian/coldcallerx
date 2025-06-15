
import React from 'react';
import { RotateCcw } from 'lucide-react';

interface TimezoneCallFiltersProps {
  timezoneFilter: 'ALL' | 'EST_CST';
  callFilter: 'ALL' | 'UNCALLED';
  onToggleTimezone: () => void;
  onToggleCallFilter: () => void;
  onResetAllCalls: () => void;
}

const TimezoneCallFilters: React.FC<TimezoneCallFiltersProps> = ({
  timezoneFilter,
  callFilter,
  onToggleTimezone,
  onToggleCallFilter,
  onResetAllCalls
}) => {
  return (
    <div className="flex">
      <div className="flex-1">
        <button 
          onClick={onToggleTimezone} 
          className={`w-full text-sm font-medium py-2 px-2 rounded transition-all duration-200 ${
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
          className={`flex-1 text-sm font-medium py-2 px-2 rounded transition-all duration-200 ${
            callFilter === 'UNCALLED' ? 'text-purple-600 animate-button-switch' : 'text-muted-foreground'
          }`} 
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {callFilter === 'ALL' ? 'All Numbers' : 'Uncalled Numbers'}
        </button>
        {callFilter === 'UNCALLED' && (
          <button 
            onClick={onResetAllCalls} 
            className="text-muted-foreground transition-colors p-1 min-w-[24px] h-[24px] flex items-center justify-center" 
            title="Reset all call counts"
          >
            <RotateCcw size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default TimezoneCallFilters;
