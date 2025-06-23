import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, Timer, Rocket } from 'lucide-react';

interface FilterButtonsProps {
  timezoneFilter: 'ALL' | 'EST_CST';
  callFilter: 'ALL' | 'UNCALLED';
  shuffleMode: boolean;
  autoCall: boolean;
  callDelay: number;
  isCountdownActive?: boolean;
  countdownTime?: number;
  onToggleTimezone: () => void;
  onToggleCallFilter: () => void;
  onToggleShuffle: () => void;
  onToggleAutoCall: () => void;
  onToggleCallDelay: () => void;
  onResetAllCalls: () => void;
  getDelayDisplayType?: () => 'timer' | 'rocket' | '5s' | '10s';
  onResetCallDelay?: () => void;
}

const FilterButtons: React.FC<FilterButtonsProps> = ({
  timezoneFilter,
  callFilter,
  shuffleMode,
  autoCall,
  callDelay,
  isCountdownActive = false,
  countdownTime = 0,
  onToggleTimezone,
  onToggleCallFilter,
  onToggleShuffle,
  onToggleAutoCall,
  onToggleCallDelay,
  onResetAllCalls,
  getDelayDisplayType,
  onResetCallDelay
}) => {
  const handleAutoCallToggle = () => {
    const wasAutoCallOff = !autoCall;
    onToggleAutoCall();
    
    // If we're turning auto-call back on, reset to timer mode (15)
    if (wasAutoCallOff && onResetCallDelay) {
      onResetCallDelay();
    }
  };

  const renderTimerContent = () => {
    if (isCountdownActive) {
      return countdownTime;
    }

    if (!getDelayDisplayType) {
      return <Timer size={14} />;
    }

    const displayType = getDelayDisplayType();
    
    switch (displayType) {
      case 'rocket':
        return <Rocket size={14} />;
      case '5s':
        return '5s';
      case '10s':
        return '10s';
      default:
        return <Timer size={14} />;
    }
  };

  return (
    <div className="space-y-2 my-4 w-full">
      {/* First row: Timezone and Call filters */}
      <div className="flex w-full gap-2">
        <div className="flex-1">
          <button 
            onClick={onToggleTimezone} 
            className={`w-full text-sm font-medium transition-all duration-200 touch-manipulation px-4 py-3 rounded-lg ${
              timezoneFilter === 'EST_CST' ? 'bg-gradient-to-r from-blue-600 to-blue-600/90 bg-clip-text text-transparent dark:bg-none dark:text-blue-600 animate-button-switch' : 'text-muted-foreground'
            }`} 
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <span className="block truncate">
              {timezoneFilter === 'ALL' ? 'All States' : 'EST, CST & CDT'}
            </span>
          </button>
        </div>
        <div className="flex-1 relative">
          <button 
            onClick={onToggleCallFilter} 
            className={`w-full text-sm font-medium py-3 px-4 rounded-lg transition-all duration-200 touch-manipulation select-none ${
              callFilter === 'UNCALLED' ? 'bg-gradient-to-r from-purple-600 to-purple-600/90 bg-clip-text text-transparent dark:bg-none dark:text-purple-600 animate-button-switch' : 'text-muted-foreground'
            }`} 
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <span className="block truncate">
              {callFilter === 'ALL' ? 'All Numbers' : 'Uncalled Numbers'}
            </span>
          </button>
          {callFilter === 'UNCALLED' && (
            <button 
              onClick={onResetAllCalls} 
              className="absolute right-1 top-1/2 transform -translate-y-1/2 text-muted-foreground transition-colors p-2 min-w-[36px] h-[36px] flex items-center justify-center touch-manipulation rounded" 
              title="Reset all call counts"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Second row: Shuffle and Auto Call */}
      <div className="flex w-full gap-2">
        <div className="flex-1">
          <button 
            onClick={onToggleShuffle} 
            className={`w-full text-sm font-medium transition-all duration-200 touch-manipulation px-4 py-3 rounded-lg ${
              shuffleMode ? 'bg-gradient-to-r from-orange-600 to-orange-600/90 bg-clip-text text-transparent dark:bg-none dark:text-orange-600 animate-button-switch' : 'text-muted-foreground'
            }`} 
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <span className="block truncate">Shuffle</span>
          </button>
        </div>
        <div className="flex-1 relative">
          <button 
            onClick={handleAutoCallToggle} 
            className={`w-full text-sm font-medium transition-all duration-200 touch-manipulation px-4 py-3 rounded-lg ${
              autoCall ? 'bg-gradient-to-r from-green-600 to-green-600/90 bg-clip-text text-transparent dark:bg-none dark:text-green-600 animate-button-switch' : 'text-muted-foreground'
            }`} 
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <span className="block truncate">Auto Call</span>
          </button>
          {autoCall && (
            <button 
              onClick={onToggleCallDelay}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 text-green-600 text-xs font-medium px-3 py-2 rounded min-w-[44px] flex items-center justify-center select-none touch-manipulation"
              style={{ WebkitTapHighlightColor: 'transparent' }}
              title="Click to change delay mode"
            >
              {renderTimerContent()}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterButtons;
