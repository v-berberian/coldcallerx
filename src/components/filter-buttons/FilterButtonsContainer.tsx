
import React from 'react';
import TimezoneCallFilters from './TimezoneCallFilters';
import ShuffleAutoCallFilters from './ShuffleAutoCallFilters';

interface FilterButtonsContainerProps {
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

const FilterButtonsContainer: React.FC<FilterButtonsContainerProps> = ({
  timezoneFilter,
  callFilter,
  shuffleMode,
  autoCall,
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
  return (
    <div className="space-y-1 my-[11px]">
      {/* First row: Timezone and Call filters */}
      <TimezoneCallFilters
        timezoneFilter={timezoneFilter}
        callFilter={callFilter}
        onToggleTimezone={onToggleTimezone}
        onToggleCallFilter={onToggleCallFilter}
        onResetAllCalls={onResetAllCalls}
      />

      {/* Second row: Shuffle and Auto Call */}
      <ShuffleAutoCallFilters
        shuffleMode={shuffleMode}
        autoCall={autoCall}
        isCountdownActive={isCountdownActive}
        countdownTime={countdownTime}
        onToggleShuffle={onToggleShuffle}
        onToggleAutoCall={onToggleAutoCall}
        onToggleCallDelay={onToggleCallDelay}
        onResetCallDelay={onResetCallDelay}
        getDelayDisplayType={getDelayDisplayType}
      />
    </div>
  );
};

export default FilterButtonsContainer;
