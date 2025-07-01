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
  currentCSVId: string | null;
  timezoneFilter: 'ALL' | 'EST_CST';
  callFilter: 'ALL' | 'UNCALLED';
  shuffleMode: boolean;
  autoCall: boolean;
  callDelay: number;
  onCall: (phone: string) => void;
  onResetCallCount: () => void;
  onCSVSelect: (csvId: string, leads: Lead[], fileName: string) => void;
  onToggleTimezone: () => void;
  onToggleCallFilter: () => void;
  onToggleShuffle: () => void;
  onToggleAutoCall: () => void;
  onToggleCallDelay: () => void;
  onResetCallDelay: () => void;
  onResetAllCalls: () => void;
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  isCountdownActive?: boolean;
  countdownTime?: number;
  getDelayDisplayType?: () => 'timer' | 'rocket' | '5s' | '10s';
  showAutocomplete?: boolean;
  noLeadsMessage?: string;
  refreshTrigger?: number;
  onImportNew?: () => void;
}

const MainContent: React.FC<MainContentProps> = ({
  currentLead,
  currentIndex,
  totalCount,
  fileName,
  currentCSVId,
  timezoneFilter,
  callFilter,
  shuffleMode,
  autoCall,
  callDelay,
  onCall,
  onResetCallCount,
  onCSVSelect,
  onToggleTimezone,
  onToggleCallFilter,
  onToggleShuffle,
  onToggleAutoCall,
  onToggleCallDelay,
  onResetCallDelay,
  onResetAllCalls,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  isCountdownActive,
  countdownTime,
  getDelayDisplayType,
  showAutocomplete = false,
  noLeadsMessage,
  refreshTrigger,
  onImportNew
}) => {
  return (
    <div className="flex-1 flex items-start justify-center pt-1 p-3 sm:p-4 min-h-0 px-4 sm:px-6" style={{ minHeight: 'calc(100dvh - 120px)' }}>
      <div className="w-full max-w-sm space-y-1 flex flex-col min-h-full">
        {/* Filter Buttons */}
        <FilterButtons
          timezoneFilter={timezoneFilter}
          callFilter={callFilter}
          shuffleMode={shuffleMode}
          autoCall={autoCall}
          callDelay={callDelay}
          isCountdownActive={isCountdownActive}
          countdownTime={countdownTime}
          onToggleTimezone={onToggleTimezone}
          onToggleCallFilter={onToggleCallFilter}
          onToggleShuffle={onToggleShuffle}
          onToggleAutoCall={onToggleAutoCall}
          onToggleCallDelay={onToggleCallDelay}
          onResetCallDelay={onResetCallDelay}
          onResetAllCalls={onResetAllCalls}
          getDelayDisplayType={getDelayDisplayType}
        />

        {/* Current Lead Card or No Leads Message */}
        <div className="animate-content-change-fast flex-1 flex flex-col">
          <LeadCard
            lead={currentLead}
            currentIndex={currentIndex}
            totalCount={totalCount}
            fileName={fileName}
            currentCSVId={currentCSVId}
            onCall={onCall}
            onResetCallCount={onResetCallCount}
            onCSVSelect={onCSVSelect}
            noLeadsMessage={noLeadsMessage}
            refreshTrigger={refreshTrigger}
            onImportNew={onImportNew}
          />
        </div>

        {/* Navigation Controls */}
        <div className="pt-3 sm:pt-4">
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
