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
  onCommentingChange?: (commenting: boolean) => void;
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
  onDeleteLead,
  onCommentingChange
}) => {
  const [navigationDirection, setNavigationDirection] = useState<'forward' | 'backward'>('forward');
  const [resetSwipe, setResetSwipe] = useState<(() => void) | null>(null);
  const [isCommenting, setIsCommenting] = useState(false);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);

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

  // Calculate viewport and keyboard height when commenting to position card 12px above keyboard (iOS)
  useEffect(() => {
    const vv = (window as Window & { visualViewport?: VisualViewport }).visualViewport;
    let detach: (() => void) | null = null;

    const update = () => {
      try {
        if (vv) {
          const originalHeight = window.innerHeight;
          const currentHeight = vv.height;
          const calculatedKeyboardHeight = Math.max(0, originalHeight - currentHeight);
          
          setViewportHeight(currentHeight);
          setKeyboardHeight(calculatedKeyboardHeight);
        } else {
          // Fallback: use window height change detection
          const originalHeight = window.innerHeight;
          const currentHeight = window.innerHeight;
          setViewportHeight(currentHeight);
          setKeyboardHeight(0);
        }
      } catch {
        setViewportHeight(null);
        setKeyboardHeight(0);
      }
    };

    if (isCommenting) {
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
      setKeyboardHeight(0);
    }
  }, [isCommenting]);

  // Calculate the container height and bottom padding for 12px above keyboard
  const commentingStyle = isCommenting ? {
    height: viewportHeight ? `${viewportHeight}px` : '100vh',
    paddingBottom: keyboardHeight > 0 ? '12px' : '1rem',
  } : {
    minHeight: 'calc(100dvh - 120px)'
  };

  return (
    <div className={`flex-1 flex justify-center min-h-0 transition-all duration-300 ${isCommenting ? 'items-end pt-0 px-2 h-full overflow-hidden' : 'items-start pt-1 p-3 sm:p-4'}`} style={commentingStyle}>
      <div className={`w-full flex flex-col ${isCommenting ? 'h-auto justify-end' : 'space-y-1 min-h-full'}`}>
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
        <div className={`animate-content-change-fast flex flex-col ${isCommenting ? '' : 'flex-1'}`}>
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
            isCommenting={isCommenting}
          />
        </div>

        {/* Navigation Controls */}
        <div className={`transition-all duration-300 ease-out ${isCommenting ? 'opacity-0 scale-95 translate-y-2 pointer-events-none pt-0' : 'pt-3 sm:pt-4'}`}>
          <NavigationControls
            onPrevious={handlePrevious}
            onNext={handleNext}
            canGoPrevious={canGoPrevious}
            canGoNext={canGoNext}
            isCommenting={isCommenting}
          />
        </div>
      </div>
    </div>
  );
};

export default MainContent;
