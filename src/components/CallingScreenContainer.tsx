import React from 'react';
import { Lead } from '../types/lead';
import { useSimplifiedCallingScreenState } from '../hooks/useSimplifiedCallingScreenState';
import { useSimplifiedCallingScreenEffects } from '../hooks/useSimplifiedCallingScreenEffects';
import { useCallingScreenActions } from './CallingScreenActions';
import { SessionState } from '@/services/sessionService';
import CallingScreenLoading from './CallingScreenLoading';
import CallingScreenEmpty from './CallingScreenEmpty';
import CallingScreenNoResults from './CallingScreenNoResults';
import CallingScreenMain from './CallingScreenMain';

interface CallingScreenContainerProps {
  leads: Lead[];
  fileName: string;
  onBack: () => void;
  onLeadsImported: (leads: Lead[], fileName: string) => void;
  markLeadAsCalled?: (lead: Lead) => Promise<boolean>;
  resetCallCount?: (lead: Lead) => void;
  resetAllCallCounts?: () => void;
  sessionState?: SessionState;
  updateSessionState?: (updates: Partial<SessionState>) => Promise<boolean>;
}

const CallingScreenContainer: React.FC<CallingScreenContainerProps> = ({
  leads,
  fileName,
  onBack,
  onLeadsImported,
  markLeadAsCalled,
  resetCallCount,
  resetAllCallCounts,
  sessionState,
  updateSessionState
}) => {
  const {
    componentReady,
    leadsInitialized,
    leadsData,
    currentIndex,
    cardKey,
    timezoneFilter,
    callFilter,
    shuffleMode,
    autoCall,
    callDelay,
    shouldAutoCall,
    setShouldAutoCall,
    currentLeadForAutoCall,
    setCurrentLeadForAutoCall,
    isCountdownActive,
    countdownTime,
    getBaseLeads,
    makeCall,
    executeAutoCall,
    handleCountdownComplete,
    handleNext,
    handlePrevious,
    selectLead,
    toggleTimezoneFilter,
    toggleCallFilter,
    toggleShuffle,
    toggleAutoCall,
    toggleCallDelay,
    resetCallDelay,
    memoizedResetLeadsData,
    resetCallCount: localResetCallCount,
    resetAllCallCounts: localResetAllCallCounts,
    searchQuery,
    setSearchQuery,
    searchResults,
    showAutocomplete,
    setShowAutocomplete,
    clearSearch,
    handleSearchFocus,
    handleSearchBlur,
    getDelayDisplayType,
    handleSessionUpdate
  } = useSimplifiedCallingScreenState({ leads, sessionState });

  useSimplifiedCallingScreenEffects({
    componentReady,
    leadsInitialized,
    currentIndex,
    timezoneFilter,
    callFilter,
    shuffleMode,
    autoCall,
    callDelay,
    updateSessionState,
    shouldAutoCall,
    setShouldAutoCall,
    setCurrentLeadForAutoCall,
    executeAutoCall,
    getBaseLeads,
    markLeadAsCalled,
    handleSessionUpdate
  });

  const {
    handleLeadSelect,
    handleCallClick,
    handleNextWrapper,
    handlePreviousWrapper,
    handleResetCallCount,
    handleResetAllCallCounts
  } = useCallingScreenActions({
    getBaseLeads,
    currentIndex,
    makeCall,
    markLeadAsCalled,
    resetCallCount,
    resetAllCallCounts,
    handleNext,
    handlePrevious,
    selectLead,
    leadsData,
    setSearchQuery,
    setShowAutocomplete
  });

  // Show loading until component is ready
  if (!componentReady || !leadsInitialized) {
    return <CallingScreenLoading />;
  }

  // No leads imported
  if (leadsData.length === 0) {
    return <CallingScreenEmpty onBack={onBack} />;
  }

  const currentLeads = getBaseLeads();
  const currentLead = currentLeads[currentIndex];
  
  // No leads found with current filters
  if (!currentLead) {
    const handleClearFilters = () => {
      toggleTimezoneFilter();
      toggleCallFilter();
      setSearchQuery('');
    };

    return <CallingScreenNoResults onClearFilters={handleClearFilters} onBack={onBack} />;
  }

  const totalLeadCount = currentLeads.length;

  return (
    <CallingScreenMain
      currentLead={currentLead}
      currentIndex={currentIndex}
      totalCount={totalLeadCount}
      fileName={fileName}
      cardKey={cardKey}
      timezoneFilter={timezoneFilter}
      callFilter={callFilter}
      shuffleMode={shuffleMode}
      autoCall={autoCall}
      callDelay={callDelay}
      isCountdownActive={isCountdownActive}
      countdownTime={countdownTime}
      searchQuery={searchQuery}
      showAutocomplete={showAutocomplete}
      searchResults={searchResults}
      leadsData={leadsData}
      onCall={handleCallClick}
      onResetCallCount={() => handleResetCallCount(currentLead)}
      onToggleTimezone={toggleTimezoneFilter}
      onToggleCallFilter={toggleCallFilter}
      onToggleShuffle={toggleShuffle}
      onToggleAutoCall={toggleAutoCall}
      onToggleCallDelay={toggleCallDelay}
      onResetCallDelay={resetCallDelay}
      onResetAllCalls={handleResetAllCallCounts}
      onPrevious={handlePreviousWrapper}
      onNext={handleNextWrapper}
      canGoPrevious={currentLeads.length > 1}
      canGoNext={currentLeads.length > 1}
      onSearchChange={setSearchQuery}
      onSearchFocus={handleSearchFocus}
      onSearchBlur={handleSearchBlur}
      onClearSearch={clearSearch}
      onLeadSelect={handleLeadSelect}
      onLeadsImported={onLeadsImported}
      getDelayDisplayType={getDelayDisplayType}
    />
  );
};

export default CallingScreenContainer;
