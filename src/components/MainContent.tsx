import React, { useState, useEffect } from 'react';
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
  temperatureFilter: 'ALL' | 'COLD' | 'WARM' | 'HOT';
  shuffleMode: boolean;
  autoCall: boolean;
  callDelay: number;
  onCall: (phone: string) => void;
  onResetCallCount: () => void;
  onCSVSelect: (csvId: string, leads: Lead[], fileName: string) => void;
  onToggleTimezone: () => void;
  onToggleCallFilter: () => void;
  onToggleTemperature: (value: 'ALL' | 'COLD' | 'WARM' | 'HOT') => void;
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
  onCommentingChange?: (commenting: boolean) => void;
  onCommentModalOpenChange?: (open: boolean) => void;
  onSkipMultiple?: (count: number) => void;
  onSkipToEnd?: () => void;
}

const MainContent: React.FC<MainContentProps> = ({
  currentLead,
  currentIndex,
  totalCount,
  fileName,
  currentCSVId,
  timezoneFilter,
  callFilter,
  temperatureFilter,
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
  onDeleteLead,
  onCommentingChange,
  onCommentModalOpenChange,
  onSkipMultiple,
  onSkipToEnd
}) => {
  const [navigationDirection, setNavigationDirection] = useState<'forward' | 'backward'>('forward');
  const [resetSwipe, setResetSwipe] = useState<(() => void) | null>(null);
  const [isCommenting, setIsCommenting] = useState(false);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const commentActive = isCommenting && !isCommentModalOpen;

  // Create wrapped navigation functions that set direction and close delete menu
  const handlePrevious = () => {
    setNavigationDirection('backward');
    if (resetSwipe) {
      resetSwipe();
    }
    onPrevious();
  };

  const handleNext = () => {
    setNavigationDirection('forward');
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
    onCommentingChange?.(commenting);
  };

  const handleCommentModalOpenChange = (open: boolean) => {
    setIsCommentModalOpen(open);
    onCommentModalOpenChange?.(open);
  };

  // Adjust height to visualViewport when commenting to keep card aligned above keyboard (iOS)
  useEffect(() => {
    const vv: any = (window as any).visualViewport;
    let detach: (() => void) | null = null;

    const update = () => {
      try {
        if (vv) {
          setViewportHeight(vv.height);
        } else {
          setViewportHeight(null);
        }
      } catch {
        setViewportHeight(null);
      }
    };

    if (commentActive) {
      // Prevent background scroll
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      if (vv) {
        vv.addEventListener('resize', update);
        vv.addEventListener('scroll', update);
        update();
        detach = () => {
          vv.removeEventListener('resize', update);
          vv.removeEventListener('scroll', update);
        };
      } else {
        // Fallback update
        update();
      }

      return () => {
        document.body.style.overflow = originalOverflow;
        if (detach) detach();
      };
    } else {
      setViewportHeight(null);
    }
  }, [commentActive]);

  return (
    <div className={`flex-1 flex items-start justify-center min-h-0 transition-all duration-300 ${commentActive ? 'pt-0 p-2 h-full overflow-hidden' : 'pt-1 p-3 sm:p-4'}`} style={{ minHeight: commentActive ? undefined : 'calc(100dvh - 120px)', height: commentActive ? (viewportHeight ? `${viewportHeight}px` : '100vh') : undefined }}>
      <div className="w-full space-y-1 flex flex-col min-h-full">
        {/* Filter Buttons */}
        <div className="transition-all duration-300 ease-out">
          <FilterButtons
            timezoneFilter={timezoneFilter}
            callFilter={callFilter}
            temperatureFilter={'ALL'}
            autoCall={autoCall}
            callDelay={callDelay}
            isCountdownActive={isCountdownActive}
            countdownTime={countdownTime}
            onToggleTimezone={onToggleTimezone}
            onToggleCallFilter={onToggleCallFilter}
            onToggleTemperature={() => {}}
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
          onCommentModalOpenChange={handleCommentModalOpenChange}
        />
      </div>

        {/* Navigation Controls */}
        <div className="pt-3 sm:pt-4 transition-all duration-300 ease-out">
          <NavigationControls
            onPrevious={handlePrevious}
            onNext={handleNext}
            canGoPrevious={canGoPrevious}
            canGoNext={canGoNext}
            shuffleMode={shuffleMode}
            onToggleShuffle={onToggleShuffle}
          />
        </div>
      </div>
    </div>
  );
};

export default MainContent;
