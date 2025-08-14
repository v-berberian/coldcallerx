import React, { useState, useEffect, useRef } from 'react';
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
  onSwipeReset?: (resetSwipe: () => void) => void;
  isCountdownActive?: boolean;
  countdownTime?: number;
  getDelayDisplayType?: () => 'timer' | 'rocket' | '5s' | '10s';
  showAutocomplete?: boolean;
  noLeadsMessage?: string;
  refreshTrigger?: number;
  onImportNew?: () => void;
  onDeleteLead?: (lead: Lead) => void;
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
  onSwipeReset,
  isCountdownActive,
  countdownTime,
  getDelayDisplayType,
  showAutocomplete = false,
  noLeadsMessage,
  refreshTrigger,
  onImportNew,
  onDeleteLead
}) => {
  const [navigationDirection, setNavigationDirection] = useState<'forward' | 'backward'>('forward');
  const [resetSwipe, setResetSwipe] = useState<(() => void) | null>(null);
  const [isCommenting, setIsCommenting] = useState(false);

  // Create wrapped navigation functions that set direction and close delete menu
  const handlePrevious = () => {
    setNavigationDirection('backward');
    // Close delete menu if open
    if (resetSwipe) {
      resetSwipe();
    }
    onPrevious();
  };

  const handleNext = () => {
    setNavigationDirection('forward');
    // Close delete menu if open
    if (resetSwipe) {
      resetSwipe();
    }
    onNext();
  };

  // Handle swipe reset callback
  const handleSwipeReset = (resetFn: () => void) => {
    setResetSwipe(() => resetFn);
  };

  // Handle commenting state from LeadCard
  const handleCommentingChange = (commenting: boolean) => {
    setIsCommenting(commenting);
  };

  return (
    <div className="flex-1 flex items-start justify-center pt-1 p-3 sm:p-4 min-h-0" style={{ minHeight: 'calc(100dvh - 120px)' }}>
      <div className="w-full space-y-1 flex flex-col min-h-full">
        {/* Filter Buttons */}
        <div className={`transition-all duration-300 ease-out ${isCommenting ? 'opacity-0 scale-95 -translate-y-2 pointer-events-none' : ''}`}>
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
        </div>

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
            navigationDirection={navigationDirection}
            onSwipeReset={handleSwipeReset}
            onDeleteLead={onDeleteLead}
            onCommentingChange={handleCommentingChange}
          />
        </div>

        {/* Navigation Controls */}
        <div className={`pt-3 sm:pt-4 transition-all duration-300 ease-out ${isCommenting ? 'opacity-0 scale-95 translate-y-2 pointer-events-none' : ''}`}>
          <NavigationControls
            onPrevious={handlePrevious}
            onNext={handleNext}
            canGoPrevious={canGoPrevious}
            canGoNext={canGoNext}
          />
        </div>
      </div>
    </div>
  );
};

export default MainContent;
