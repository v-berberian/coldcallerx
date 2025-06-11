
import React, { useState, useRef } from 'react';
import { RotateCcw, Timer } from 'lucide-react';

interface FilterButtonsProps {
  timezoneFilter: 'ALL' | 'EST_CST';
  callFilter: 'ALL' | 'UNCALLED';
  shuffleMode: boolean;
  autoCall: boolean;
  callDelay: number;
  showTimer: boolean;
  setShowTimer: (show: boolean) => void;
  isCountdownActive?: boolean;
  countdownTime?: number;
  onToggleTimezone: () => void;
  onToggleCallFilter: () => void;
  onToggleShuffle: () => void;
  onToggleAutoCall: () => void;
  onToggleCallDelay: () => void;
  onResetAllCalls: () => void;
}

const FilterButtons: React.FC<FilterButtonsProps> = ({
  timezoneFilter,
  callFilter,
  shuffleMode,
  autoCall,
  callDelay,
  showTimer,
  setShowTimer,
  isCountdownActive = false,
  countdownTime = 0,
  onToggleTimezone,
  onToggleCallFilter,
  onToggleShuffle,
  onToggleAutoCall,
  onToggleCallDelay,
  onResetAllCalls
}) => {
  const longTapTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isLongTapping, setIsLongTapping] = useState(false);

  const handleAutoCallMouseDown = () => {
    setIsLongTapping(false);
    
    // Only start long tap timer if auto call is enabled and countdown is not active
    if (autoCall && !isCountdownActive) {
      longTapTimerRef.current = setTimeout(() => {
        setIsLongTapping(true);
        setShowTimer(!showTimer);
      }, 500); // 500ms for long tap
    }
  };

  const handleAutoCallMouseUp = () => {
    if (longTapTimerRef.current) {
      clearTimeout(longTapTimerRef.current);
      longTapTimerRef.current = null;
    }
    
    // If it was a long tap, don't toggle auto call
    if (!isLongTapping) {
      onToggleAutoCall();
    }
    
    setIsLongTapping(false);
  };

  const handleAutoCallMouseLeave = () => {
    if (longTapTimerRef.current) {
      clearTimeout(longTapTimerRef.current);
      longTapTimerRef.current = null;
    }
    setIsLongTapping(false);
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
            onMouseDown={handleAutoCallMouseDown}
            onMouseUp={handleAutoCallMouseUp}
            onMouseLeave={handleAutoCallMouseLeave}
            onTouchStart={handleAutoCallMouseDown}
            onTouchEnd={handleAutoCallMouseUp}
            className={`text-sm font-medium py-2 px-2 rounded transition-all duration-200 ${
              autoCall ? 'text-green-600 animate-button-switch' : 'text-muted-foreground'
            }`} 
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            Auto Call
          </button>
          {autoCall && showTimer && (
            <button 
              onClick={onToggleCallDelay} 
              className={`absolute right-0 text-green-600 text-xs font-medium px-2 py-1 rounded min-w-[32px] flex items-center justify-center ${
                isCountdownActive ? 'bg-green-600/10' : ''
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
              title="Auto call timer"
            >
              {isCountdownActive ? countdownTime : <Timer size={14} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterButtons;
