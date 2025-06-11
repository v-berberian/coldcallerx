
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
  getDelayDisplayType?: () => 'timer' | 'rocket' | '5s';
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
      default:
        return <Timer size={14} />;
    }
  };

  return (
    <div className="space-y-1 my-[11px]">
      {/* First row: Timezone and Call filters */}
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
            className={`w-full text-sm font-medium py-2 px-2 rounded transition-all duration-200 ${
              shuffleMode ? 'text-orange-600 animate-button-switch' : 'text-muted-foreground'
            }`} 
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            Shuffle
          </button>
        </div>
        <div className="flex-1 relative flex items-center justify-center">
          <button 
            onClick={handleAutoCallToggle} 
            className={`text-sm font-medium py-2 px-2 rounded transition-all duration-200 ${
              autoCall ? 'text-green-600 animate-button-switch' : 'text-muted-foreground'
            }`} 
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            Auto Call
          </button>
          {autoCall && showTimerIcon && (
            <button 
              onClick={onToggleCallDelay}
              className="absolute right-0 text-green-600 text-xs font-medium px-2 py-1 rounded min-w-[32px] flex items-center justify-center select-none"
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
