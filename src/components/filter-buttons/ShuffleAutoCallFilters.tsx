
import React from 'react';
import { useTimerDisplay } from '../../hooks/useTimerDisplay';
import TimerDisplay from './TimerDisplay';

interface ShuffleAutoCallFiltersProps {
  shuffleMode: boolean;
  autoCall: boolean;
  isCountdownActive: boolean;
  countdownTime: number;
  onToggleShuffle: () => void;
  onToggleAutoCall: () => void;
  onToggleCallDelay: () => void;
  onResetCallDelay?: () => void;
  getDelayDisplayType?: () => 'timer' | 'rocket' | '5s' | '10s';
}

const ShuffleAutoCallFilters: React.FC<ShuffleAutoCallFiltersProps> = ({
  shuffleMode,
  autoCall,
  isCountdownActive,
  countdownTime,
  onToggleShuffle,
  onToggleAutoCall,
  onToggleCallDelay,
  onResetCallDelay,
  getDelayDisplayType
}) => {
  const { showTimerIcon } = useTimerDisplay(autoCall);

  const handleAutoCallToggle = () => {
    const wasAutoCallOff = !autoCall;
    onToggleAutoCall();
    
    // If we're turning auto-call back on, reset to timer mode (15)
    if (wasAutoCallOff && onResetCallDelay) {
      onResetCallDelay();
    }
  };

  return (
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
            <TimerDisplay
              isCountdownActive={isCountdownActive}
              countdownTime={countdownTime}
              getDelayDisplayType={getDelayDisplayType}
            />
          </button>
        )}
      </div>
    </div>
  );
};

export default ShuffleAutoCallFilters;
