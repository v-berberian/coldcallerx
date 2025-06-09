
import React from 'react';

interface FilterButtonsProps {
  timezoneFilter: 'ALL' | 'EST_CST';
  callFilter: 'ALL' | 'UNCALLED';
  onToggleTimezone: () => void;
  onToggleCallFilter: () => void;
}

const FilterButtons: React.FC<FilterButtonsProps> = ({
  timezoneFilter,
  callFilter,
  onToggleTimezone,
  onToggleCallFilter
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
      <div className="flex-1 flex justify-center">
        <button 
          onClick={onToggleCallFilter} 
          className={`text-sm font-medium px-3 py-1 rounded transition-all duration-200 ${
            callFilter === 'UNCALLED' ? 'text-purple-600 animate-button-switch' : 'text-muted-foreground'
          }`} 
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {callFilter === 'ALL' ? 'All Numbers' : 'Uncalled Numbers'}
        </button>
      </div>
    </div>
  );
};

export default FilterButtons;
