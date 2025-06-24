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
  isCountdownActive,
  countdownTime,
  onToggleTimezone,
  onToggleCallFilter,
  onToggleShuffle,
  onToggleAutoCall,
  onToggleCallDelay,
  onResetAllCalls,
  getDelayDisplayType,
  onResetCallDelay
}) => {
  const [isResetAnimating, setIsResetAnimating] = useState(false);

  const handleResetClick = () => {
    setIsResetAnimating(true);
    onResetAllCalls();
  };

  useEffect(() => {
    if (isResetAnimating) {
      const timer = setTimeout(() => {
        setIsResetAnimating(false);
      }, 200); // Match the animation duration
      return () => clearTimeout(timer);
    }
  }, [isResetAnimating]);

  const renderTimerContent = () => {
    if (!getDelayDisplayType) return null;
    
    const displayType = getDelayDisplayType();
    
    switch (displayType) {
      case 'timer':
        return <Timer size={12} />;
      case 'rocket':
        return <Rocket size={12} />;
      case '5s':
        return <span className="text-xs font-medium">5s</span>;
      case '10s':
        return <span className="text-xs font-medium">10s</span>;
      default:
        return <Timer size={12} />;
    }
  };

  return (
    <div className="space-y-2 my-4 w-full">
      {/* First row: Timezone and Call filters */}
      <div className="flex w-full gap-2">
        <div className="flex-1">
          <button 
            onClick={onToggleTimezone} 
            className={`group relative w-full text-sm font-medium px-4 py-3 rounded-lg overflow-hidden transition-all duration-500 ease-out touch-manipulation ${
              timezoneFilter === 'EST_CST' 
                ? 'text-blue-700 dark:text-blue-300 shadow-lg shadow-blue-500/30' 
                : 'text-muted-foreground/70'
            }`} 
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              transform: timezoneFilter === 'EST_CST' ? 'translateY(-1px)' : 'translateY(0)',
              transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {/* Animated background for active state */}
            {timezoneFilter === 'EST_CST' && (
              <div 
                className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-blue-600/30 rounded-lg scale-100 opacity-100"
                style={{
                  transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            )}
            
            {/* Subtle background for inactive state */}
            {timezoneFilter !== 'EST_CST' && (
              <div 
                className="absolute inset-0 bg-gray-200/20 dark:bg-gray-700/20 rounded-lg scale-100 opacity-100"
                style={{
                  transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            )}
            
            <span className={`relative z-10 block truncate transition-all duration-500 ease-out ${
              timezoneFilter === 'EST_CST' ? 'scale-100 opacity-100' : 'scale-95 opacity-90'
            }`}>
              {timezoneFilter === 'ALL' ? 'All States' : 'EST, CST & CDT'}
            </span>
          </button>
        </div>
        
        <div className="flex-1 relative">
          <button 
            onClick={onToggleCallFilter} 
            className={`group relative w-full text-sm font-medium px-4 py-3 rounded-lg overflow-hidden transition-all duration-500 ease-out touch-manipulation ${
              callFilter === 'UNCALLED' 
                ? 'text-purple-700 dark:text-purple-300 shadow-lg shadow-purple-500/30' 
                : 'text-muted-foreground/70'
            }`} 
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              transform: callFilter === 'UNCALLED' ? 'translateY(-1px)' : 'translateY(0)',
              transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {/* Animated background for active state */}
            {callFilter === 'UNCALLED' && (
              <div 
                className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-purple-600/30 rounded-lg scale-100 opacity-100"
                style={{
                  transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            )}
            
            {/* Subtle background for inactive state */}
            {callFilter !== 'UNCALLED' && (
              <div 
                className="absolute inset-0 bg-gray-200/20 dark:bg-gray-700/20 rounded-lg scale-100 opacity-100"
                style={{
                  transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            )}
            
            <span className={`relative z-10 block truncate transition-all duration-500 ease-out ${
              callFilter === 'UNCALLED' ? 'scale-100 opacity-100' : 'scale-95 opacity-90'
            }`}>
              {callFilter === 'ALL' ? 'All Numbers' : 'Uncalled'}
            </span>
          </button>

          {callFilter === 'UNCALLED' && (
            <button 
              onClick={handleResetClick} 
              className="group absolute right-1 top-1/2 transform -translate-y-1/2 text-purple-700 dark:text-purple-300 p-2 min-w-[36px] h-[36px] flex items-center justify-center touch-manipulation rounded-full transition-all duration-300 ease-out active:scale-95" 
              title="Reset all call counts"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <RotateCcw size={14} className={`transition-transform duration-200 ease-in-out ${isResetAnimating ? 'rotate-180' : 'rotate-0'}`} />
            </button>
          )}
        </div>
      </div>

      {/* Second row: Shuffle and Auto Call filters */}
      <div className="flex w-full gap-2">
        <div className="flex-1">
          <button 
            onClick={onToggleShuffle} 
            className={`group relative w-full text-sm font-medium px-4 py-3 rounded-lg overflow-hidden transition-all duration-500 ease-out touch-manipulation ${
              shuffleMode 
                ? 'text-orange-700 dark:text-orange-300 shadow-lg shadow-orange-500/30' 
                : 'text-muted-foreground/70'
            }`} 
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              transform: shuffleMode ? 'translateY(-1px)' : 'translateY(0)',
              transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {/* Animated background for active state */}
            {shuffleMode && (
              <div 
                className="absolute inset-0 bg-gradient-to-r from-orange-500/30 to-orange-600/30 rounded-lg scale-100 opacity-100"
                style={{
                  transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            )}
            
            {/* Subtle background for inactive state */}
            {!shuffleMode && (
              <div 
                className="absolute inset-0 bg-gray-200/20 dark:bg-gray-700/20 rounded-lg scale-100 opacity-100"
                style={{
                  transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            )}
            
            <span className={`relative z-10 block truncate transition-all duration-500 ease-out ${
              shuffleMode ? 'scale-100 opacity-100' : 'scale-95 opacity-90'
            }`}>
              Shuffle
            </span>
          </button>
        </div>
        
        <div className="flex-1 relative">
          <button 
            onClick={onToggleAutoCall} 
            className={`group relative w-full text-sm font-medium px-4 py-3 rounded-lg overflow-hidden transition-all duration-500 ease-out touch-manipulation ${
              autoCall 
                ? 'text-green-700 dark:text-green-300 shadow-lg shadow-green-500/30' 
                : 'text-muted-foreground/70'
            }`} 
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              transform: autoCall ? 'translateY(-1px)' : 'translateY(0)',
              transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {/* Animated background for active state */}
            {autoCall && (
              <div 
                className="absolute inset-0 bg-gradient-to-r from-green-500/30 to-green-600/30 rounded-lg scale-100 opacity-100"
                style={{
                  transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            )}
            
            {/* Subtle background for inactive state */}
            {!autoCall && (
              <div 
                className="absolute inset-0 bg-gray-200/20 dark:bg-gray-700/20 rounded-lg scale-100 opacity-100"
                style={{
                  transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            )}
            
            <span className={`relative z-10 block truncate transition-all duration-500 ease-out ${
              autoCall ? 'scale-100 opacity-100' : 'scale-95 opacity-90'
            }`}>
              Auto Call
            </span>
          </button>

          {autoCall && (
            <button 
              onClick={onToggleCallDelay}
              className="group absolute right-1 top-1/2 transform -translate-y-1/2 text-green-600 dark:text-green-400 text-xs font-medium px-3 py-2 rounded-full min-w-[44px] flex items-center justify-center select-none touch-manipulation transition-all duration-200 ease-out bg-green-100 dark:bg-green-900/20 shadow-md shadow-green-500/20 hover:scale-110 active:scale-95"
              style={{ WebkitTapHighlightColor: 'transparent' }}
              title="Click to change delay mode"
            >
              <span className="transition-all duration-200 ease-out">
                {renderTimerContent()}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterButtons;
