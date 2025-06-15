
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
  const [showTimerIcon, setShowTimerIcon] = useState(autoCall);

  const handleAutoCallToggle = () => {
    const wasAutoCallOff = !autoCall;
    onToggleAutoCall();
    
    // Reset/show timer icon when auto-call is toggled
    setShowTimerIcon(!autoCall);
    
    // If we're turning auto-call back on, reset to timer mode (15)
    if (wasAutoCallOff && onResetCallDelay) {
      onResetCallDelay();
    }
  };

  // Reset/show timer icon when auto-call is toggled
  useEffect(() => {
    setShowTimerIcon(autoCall);
  }, [autoCall]);

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
    <div className="space-y-1 my-[11px] w-full">
      {/* First row: Timezone and Call filters */}
      <div className="flex w-full gap-0">
        <div className="flex-1 min-w-0">
          <button 
            onClick={onToggleTimezone} 
            className={`w-full text-sm font-medium py-3 px-2 sm:px-3 rounded transition-all duration-200 touch-manipulation select-none ${
              timezoneFilter === 'EST_CST' ? 'text-blue-600 animate-button-switch' : 'text-muted-foreground'
            }`} 
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <span className="block truncate">
              {timezoneFilter === 'ALL' ? 'All States' : 'EST, CST & CDT'}
            </span>
          </button>
        </div>
        <div className="flex-1 min-w-0 flex items-center gap-1 sm:gap-2">
          <button 
            onClick={onToggleCallFilter} 
            className={`flex-1 min-w-0 text-sm font-medium py-3 px-2 sm:px-3 rounded transition-all duration-200 touch-manipulation select-none ${
              callFilter === 'UNCALLED' ? 'text-purple-600 animate-button-switch' : 'text-muted-foreground'
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
              className="text-muted-foreground transition-colors p-2 min-w-[32px] h-[32px] flex items-center justify-center touch-manipulation" 
              title="Reset all call counts"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Second row: Shuffle and Auto Call */}
      <div className="flex w-full gap-0">
        <div className="flex-1 min-w-0">
          <button 
            onClick={onToggleShuffle} 
            className={`w-full text-sm font-medium py-3 px-2 sm:px-3 rounded transition-all duration-200 touch-manipulation select-none ${
              shuffleMode ? 'text-orange-600 animate-button-switch' : 'text-muted-foreground'
            }`} 
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <span className="block truncate">Shuffle</span>
          </button>
        </div>
        <div className="flex-1 min-w-0 relative flex items-center justify-center">
          <button 
            onClick={handleAutoCallToggle} 
            className={`w-full text-sm font-medium py-3 px-2 sm:px-3 rounded transition-all duration-200 touch-manipulation select-none ${
              autoCall ? 'text-green-600 animate-button-switch' : 'text-muted-foreground'
            }`} 
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <span className="block truncate">Auto Call</span>
          </button>
          {autoCall && showTimerIcon && (
            <button 
              onClick={onToggleCallDelay}
              className="absolute right-1 sm:right-2 text-green-600 text-xs font-medium px-2 sm:px-3 py-2 rounded min-w-[32px] sm:min-w-[40px] flex items-center justify-center select-none touch-manipulation"
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
