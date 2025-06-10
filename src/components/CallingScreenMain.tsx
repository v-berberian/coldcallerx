
import React from 'react';
import FilterButtons from './FilterButtons';
import LeadCard from './LeadCard';
import NavigationControls from './NavigationControls';

interface Lead {
  name: string;
  phone: string;
  called?: number;
  lastCalled?: string;
}

interface CallingScreenMainProps {
  currentLead: Lead;
  currentIndex: number;
  totalCount: number;
  fileName: string;
  cardKey: number;
  timezoneFilter: 'ALL' | 'EST_CST';
  callFilter: 'ALL' | 'UNCALLED';
  shuffleMode: boolean;
  autoCall: boolean;
  historyIndex: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onCall: () => void;
  onResetCallCount: () => void;
  onToggleTimezone: () => void;
  onToggleCallFilter: () => void;
  onResetAllCalls: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onToggleShuffle: () => void;
  onToggleAutoCall: () => void;
}

const CallingScreenMain: React.FC<CallingScreenMainProps> = ({
  currentLead,
  currentIndex,
  totalCount,
  fileName,
  cardKey,
  timezoneFilter,
  callFilter,
  shuffleMode,
  autoCall,
  historyIndex,
  canGoPrevious,
  canGoNext,
  onCall,
  onResetCallCount,
  onToggleTimezone,
  onToggleCallFilter,
  onResetAllCalls,
  onPrevious,
  onNext,
  onToggleShuffle,
  onToggleAutoCall
}) => {
  return (
    <div className="flex-1 flex items-start justify-center pt-8 p-4 min-h-0 px-6">
      <div className="w-full max-w-sm space-y-4">
        {/* Filter Buttons */}
        <FilterButtons
          timezoneFilter={timezoneFilter}
          callFilter={callFilter}
          onToggleTimezone={onToggleTimezone}
          onToggleCallFilter={onToggleCallFilter}
          onResetAllCalls={onResetAllCalls}
        />

        {/* Current Lead Card */}
        <LeadCard
          lead={currentLead}
          currentIndex={currentIndex}
          totalCount={totalCount}
          fileName={fileName}
          cardKey={cardKey}
          onCall={onCall}
          onResetCallCount={onResetCallCount}
        />

        {/* Navigation Controls */}
        <NavigationControls
          onPrevious={onPrevious}
          onNext={onNext}
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
          shuffleMode={shuffleMode}
          autoCall={autoCall}
          onToggleShuffle={onToggleShuffle}
          onToggleAutoCall={onToggleAutoCall}
        />
      </div>
    </div>
  );
};

export default CallingScreenMain;
