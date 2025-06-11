
import React from 'react';
import { Lead } from '../types/lead';
import FilterButtons from './FilterButtons';
import LeadCard from './LeadCard';
import NavigationControls from './NavigationControls';

interface MainContentProps {
  currentLead: Lead;
  currentIndex: number;
  totalCount: number;
  fileName: string;
  cardKey: number;
  timezoneFilter: 'ALL' | 'EST_CST';
  callFilter: 'ALL' | 'UNCALLED';
  shuffleMode: boolean;
  autoCall: boolean;
  onCall: () => void;
  onResetCallCount: () => void;
  onToggleTimezone: () => void;
  onToggleCallFilter: () => void;
  onToggleShuffle: () => void;
  onToggleAutoCall: () => void;
  onResetAllCalls: () => void;
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

const MainContent: React.FC<MainContentProps> = ({
  currentLead,
  currentIndex,
  totalCount,
  fileName,
  cardKey,
  timezoneFilter,
  callFilter,
  shuffleMode,
  autoCall,
  onCall,
  onResetCallCount,
  onToggleTimezone,
  onToggleCallFilter,
  onToggleShuffle,
  onToggleAutoCall,
  onResetAllCalls,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext
}) => {
  return (
    <div className="flex-1 flex items-start justify-center pt-1 p-4 min-h-0 px-6">
      <div className="w-full max-w-sm space-y-1">
        {/* Filter Buttons */}
        <FilterButtons
          timezoneFilter={timezoneFilter}
          callFilter={callFilter}
          shuffleMode={shuffleMode}
          autoCall={autoCall}
          onToggleTimezone={onToggleTimezone}
          onToggleCallFilter={onToggleCallFilter}
          onToggleShuffle={onToggleShuffle}
          onToggleAutoCall={onToggleAutoCall}
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
        <div className="pt-4">
          <NavigationControls
            onPrevious={onPrevious}
            onNext={onNext}
            canGoPrevious={canGoPrevious}
            canGoNext={canGoNext}
          />
        </div>
      </div>
    </div>
  );
};

export default MainContent;
