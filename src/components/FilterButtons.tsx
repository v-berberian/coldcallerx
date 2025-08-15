import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, Timer, Rocket, ChevronDown } from 'lucide-react';

interface FilterButtonsProps {
  timezoneFilter: 'ALL' | 'EST_CST';
  callFilter: 'ALL' | 'UNCALLED';
  temperatureFilter: 'ALL' | 'COLD' | 'WARM' | 'HOT';
  autoCall: boolean;
  callDelay: number;
  isCountdownActive?: boolean;
  countdownTime?: number;
  onToggleTimezone: () => void;
  onToggleCallFilter: () => void;
  onToggleTemperature: (value: 'ALL' | 'COLD' | 'WARM' | 'HOT') => void;
  onToggleAutoCall: () => void;
  onToggleCallDelay: () => void;
  onResetAllCalls: () => void;
  getDelayDisplayType?: () => 'timer' | 'rocket' | '5s' | '10s';
  onResetCallDelay?: () => void;
}

const FilterButtons: React.FC<FilterButtonsProps> = ({
  timezoneFilter,
  callFilter,
  temperatureFilter,
  autoCall,
  callDelay,
  isCountdownActive,
  countdownTime,
  onToggleTimezone,
  onToggleCallFilter,
  onToggleTemperature,
  onToggleAutoCall,
  onToggleCallDelay,
  onResetAllCalls,
  getDelayDisplayType,
  onResetCallDelay
}) => {
  const [isResetAnimating, setIsResetAnimating] = useState(false);
  const [isTemperatureDropdownOpen, setIsTemperatureDropdownOpen] = useState(false);
  const temperatureDropdownRef = useRef<HTMLDivElement>(null);

  const handleFilterClick = (handler: () => void, filterName: string) => (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Call the handler immediately
    handler();
  };

  const handleResetClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    setIsResetAnimating(true);
    
    // Add a small delay to ensure event handling is complete
    setTimeout(() => {
      onResetAllCalls();
    }, 10);
  };

  useEffect(() => {
    if (isResetAnimating) {
      const timer = setTimeout(() => {
        setIsResetAnimating(false);
      }, 100); // Match the animation duration
      return () => clearTimeout(timer);
    }
  }, [isResetAnimating]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (temperatureDropdownRef.current && !temperatureDropdownRef.current.contains(event.target as Node)) {
        setIsTemperatureDropdownOpen(false);
      }
    };

    if (isTemperatureDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isTemperatureDropdownOpen]);

  const renderTimerContent = () => {
    if (!getDelayDisplayType) return null;
    
    const displayType = getDelayDisplayType();
    
    switch (displayType) {
      case 'timer':
        return <Timer size={12} className="w-3 h-3 flex-shrink-0 text-green-600 dark:text-green-400" />;
      case 'rocket':
        return <Rocket size={12} className="w-3 h-3 flex-shrink-0 text-green-600 dark:text-green-400" />;
      case '5s':
        return <span className="text-xs font-medium leading-none text-green-600 dark:text-green-400">5s</span>;
      case '10s':
        return <span className="text-xs font-medium leading-none text-green-600 dark:text-green-400">10s</span>;
      default:
        return <Timer size={12} className="w-3 h-3 flex-shrink-0 text-green-600 dark:text-green-400" />;
    }
  };

  return (
    <div className="space-y-2 my-4 w-full">
      {/* First row: Timezone and Call filters */}
      <div className="flex w-full gap-2">
        <div className="flex-1">
          <button 
            onClick={handleFilterClick(onToggleTimezone, 'timezone')} 
            className={`group relative w-full text-sm font-medium px-4 py-3 rounded-lg overflow-hidden transition-all duration-100 ease-out touch-manipulation ${
              timezoneFilter === 'EST_CST' 
                ? 'text-blue-700 dark:text-blue-300 shadow-lg shadow-blue-500/30' 
                : 'text-muted-foreground/70'
            }`} 
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              transition: 'all 100ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              touchAction: 'manipulation'
            }}
          >
            {/* Animated background for active state */}
            {timezoneFilter === 'EST_CST' && (
              <div 
                className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-lg scale-100 opacity-100 pointer-events-none"
                style={{
                  transition: 'all 100ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  pointerEvents: 'none'
                }}
              />
            )}
            
            {/* Subtle background for inactive state */}
            {timezoneFilter !== 'EST_CST' && (
              <div 
                className="absolute inset-0 bg-gray-200/20 dark:bg-gray-700/20 rounded-lg scale-100 opacity-100 pointer-events-none"
                style={{
                  transition: 'all 100ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  pointerEvents: 'none'
                }}
              />
            )}
            
            <span className={`relative z-10 block truncate transition-all duration-100 ease-out ${
              timezoneFilter === 'EST_CST' ? 'scale-100 opacity-100' : 'scale-95 opacity-90'
            }`}>
              {timezoneFilter === 'ALL' ? 'All States' : 'EST, CST & CDT'}
            </span>
          </button>
        </div>
        
        <div className="flex-1 relative">
          <button 
            onClick={handleFilterClick(onToggleCallFilter, 'callFilter')} 
            className={`group relative w-full text-sm font-medium px-4 py-3 rounded-lg overflow-hidden transition-all duration-100 ease-out touch-manipulation ${
              callFilter === 'UNCALLED' 
                ? 'text-purple-700 dark:text-purple-300 shadow-lg shadow-purple-500/30' 
                : 'text-muted-foreground/70'
            }`} 
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              transition: 'all 100ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              touchAction: 'manipulation'
            }}
          >
            {/* Animated background for active state */}
            {callFilter === 'UNCALLED' && (
              <div 
                className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-lg scale-100 opacity-100 pointer-events-none"
                style={{
                  transition: 'all 100ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  pointerEvents: 'none'
                }}
              />
            )}
            
            {/* Subtle background for inactive state */}
            {callFilter !== 'UNCALLED' && (
              <div 
                className="absolute inset-0 bg-gray-200/20 dark:bg-gray-700/20 rounded-lg scale-100 opacity-100 pointer-events-none"
                style={{
                  transition: 'all 100ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  pointerEvents: 'none'
                }}
              />
            )}
            
            <span className={`relative z-10 block truncate transition-all duration-100 ease-out ${
              callFilter === 'UNCALLED' ? 'scale-100 opacity-100' : 'scale-95 opacity-90'
            }`}>
              {callFilter === 'ALL' ? 'All Numbers' : 'Uncalled'}
            </span>
          </button>

          {callFilter === 'UNCALLED' && (
            <button 
              onClick={handleResetClick} 
              className="group absolute right-1 top-1/2 transform -translate-y-1/2 text-purple-600 dark:text-purple-400 text-xs font-medium px-3 py-2 rounded-full w-[44px] h-[32px] flex items-center justify-center select-none touch-manipulation transition-all duration-100 ease-out bg-purple-100 dark:bg-purple-900/20 shadow-md shadow-purple-500/20 active:scale-95 z-30" 
              title="Reset all call counts"
              style={{ 
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <RotateCcw size={12} className={`w-3 h-3 flex-shrink-0 text-purple-600 dark:text-purple-400 transition-transform duration-100 ease-in-out ${isResetAnimating ? 'rotate-180' : 'rotate-0'}`} />
            </button>
          )}
        </div>
      </div>

      {/* Second row: Temperature and Auto Call filters */}
      <div className="flex w-full gap-2">
        <div className="flex-1 relative" ref={temperatureDropdownRef}>
          <button 
            onClick={() => setIsTemperatureDropdownOpen(!isTemperatureDropdownOpen)}
            className={`group relative w-full text-sm font-medium px-4 py-3 rounded-lg overflow-hidden transition-all duration-100 ease-out touch-manipulation ${
              temperatureFilter !== 'ALL' 
                ? 'text-red-700 dark:text-red-300 shadow-lg shadow-red-500/30' 
                : 'text-muted-foreground/70'
            }`} 
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              transition: 'all 100ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              touchAction: 'manipulation'
            }}
          >
            {/* Animated background for active state */}
            {temperatureFilter !== 'ALL' && (
              <div 
                className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-lg scale-100 opacity-100 pointer-events-none"
                style={{
                  transition: 'all 100ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  pointerEvents: 'none'
                }}
              />
            )}
            
            {/* Subtle background for inactive state */}
            {temperatureFilter === 'ALL' && (
              <div 
                className="absolute inset-0 bg-gray-200/20 dark:bg-gray-700/20 rounded-lg scale-100 opacity-100 pointer-events-none"
                style={{
                  transition: 'all 100ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  pointerEvents: 'none'
                }}
              />
            )}
            
            <div className="relative z-10 flex items-center justify-center">
              <span className={`block truncate transition-all duration-100 ease-out ${
                temperatureFilter !== 'ALL' ? 'scale-100 opacity-100' : 'scale-95 opacity-90'
              }`}>
                {temperatureFilter === 'ALL' ? 'All Stages' : temperatureFilter.charAt(0).toUpperCase() + temperatureFilter.slice(1).toLowerCase()}
              </span>
              <ChevronDown 
                size={16} 
                className={`absolute right-3 transition-transform duration-200 ${isTemperatureDropdownOpen ? 'rotate-180' : ''}`}
              />
            </div>
          </button>

          {/* Dropdown menu - Mobile optimized */}
          {isTemperatureDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden">
              {(['ALL', 'COLD', 'WARM', 'HOT'] as const).map((option) => (
                <button
                  key={option}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleTemperature(option);
                    setIsTemperatureDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-4 text-center text-sm font-medium transition-all duration-100 ease-out touch-manipulation active:scale-95 ${
                    temperatureFilter === option
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                      : 'text-gray-700 dark:text-gray-300 active:bg-gray-100 dark:active:bg-gray-600'
                  }`}
                  style={{ 
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation',
                    minHeight: '48px'
                  }}
                >
                  {option === 'ALL' ? 'All Stages' : option.charAt(0).toUpperCase() + option.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex-1 relative">
          <button 
            onClick={handleFilterClick(onToggleAutoCall, 'autoCall')} 
            className={`group relative w-full text-sm font-medium px-4 py-3 rounded-lg overflow-hidden transition-all duration-100 ease-out touch-manipulation ${
              autoCall 
                ? 'text-green-700 dark:text-green-300 shadow-lg shadow-green-500/30' 
                : 'text-muted-foreground/70'
            }`} 
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              transition: 'all 100ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              touchAction: 'manipulation'
            }}
          >
            {/* Animated background for active state */}
            {autoCall && (
              <div 
                className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-lg scale-100 opacity-100 pointer-events-none"
                style={{
                  transition: 'all 100ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  pointerEvents: 'none'
                }}
              />
            )}
            
            {/* Subtle background for inactive state */}
            {!autoCall && (
              <div 
                className="absolute inset-0 bg-gray-200/20 dark:bg-gray-700/20 rounded-lg scale-100 opacity-100 pointer-events-none"
                style={{
                  transition: 'all 100ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  pointerEvents: 'none'
                }}
              />
            )}
            
            <span className={`relative z-10 block truncate transition-all duration-100 ease-out ${
              autoCall ? 'scale-100 opacity-100' : 'scale-95 opacity-90'
            }`}>
              Auto Call
            </span>
          </button>

          {autoCall && (
            <button 
              onClick={() => {
                onToggleCallDelay();
              }}
              className="group absolute right-1 top-1/2 transform -translate-y-1/2 text-green-600 dark:text-green-400 text-xs font-medium px-3 py-2 rounded-full w-[44px] h-[32px] flex items-center justify-center select-none touch-manipulation transition-all duration-100 ease-out bg-green-100 dark:bg-green-900/20 shadow-md shadow-green-500/20 active:scale-95 z-20"
              style={{ 
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
              title="Click to change delay mode"
            >
              <div className="w-full h-full flex items-center justify-center">
                {isCountdownActive && countdownTime !== undefined ? (
                  <span className="font-medium text-green-700 dark:text-green-300 text-xs leading-none">
                    {countdownTime}s
                  </span>
                ) : (
                  renderTimerContent()
                )}
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterButtons;
