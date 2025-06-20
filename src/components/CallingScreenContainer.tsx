import React, { memo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import CallingHeader from './CallingHeader';
import MainContent from './MainContent';
import CallProgressBar from './CallProgressBar';
import { Lead } from '../types/lead';
import { useLocalCallingScreenState } from '../hooks/useLocalCallingScreenState';
import { useSimplifiedCallingScreenEffects } from '../hooks/useSimplifiedCallingScreenEffects';
import { useCallingScreenActions } from './CallingScreenActions';
import { useLocalLeadOperations } from '../hooks/useLocalLeadOperations';
import { useDailyCallState } from './DailyCallState';

interface CallingScreenContainerProps {
  leads: Lead[];
  fileName: string;
  onBack: () => void;
  onLeadsImported: (leads: Lead[], fileName: string) => void;
}

const CallingScreenContainer: React.FC<CallingScreenContainerProps> = memo(({
  leads,
  fileName,
  onBack,
  onLeadsImported
}) => {
  const { importLeadsFromCSV, updateLeadCallCount, resetCallCount, resetAllCallCounts } = useLocalLeadOperations();
  
  // Daily call tracking
  const {
    dailyCallCount,
    incrementDailyCallCount,
    resetDailyCallCount
  } = useDailyCallState();

  // Daily goal setting
  const [dailyGoalEnabled, setDailyGoalEnabled] = useState(true);

  // Load daily goal setting from localStorage
  useEffect(() => {
    const savedDailyGoal = localStorage.getItem('dailyGoalEnabled');
    if (savedDailyGoal !== null) {
      const enabled = savedDailyGoal === 'true';
      setDailyGoalEnabled(enabled);
    }
  }, []);

  // Listen for changes to the daily goal setting
  useEffect(() => {
    const handleStorageChange = () => {
      const savedDailyGoal = localStorage.getItem('dailyGoalEnabled');
      if (savedDailyGoal !== null) {
        const enabled = savedDailyGoal === 'true';
        setDailyGoalEnabled(enabled);
      }
    };

    const handleCustomEvent = (event: CustomEvent) => {
      const enabled = event.detail.enabled;
      setDailyGoalEnabled(enabled);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('dailyGoalSettingChanged', handleCustomEvent as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('dailyGoalSettingChanged', handleCustomEvent as EventListener);
    };
  }, []);

  const {
    componentReady,
    setComponentReady,
    leadsInitialized,
    setLeadsInitialized,
    leadsData,
    currentIndex,
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
    updateLeadsDataDirectly,
    searchQuery,
    setSearchQuery,
    searchResults,
    allSearchResults,
    loadedResultsCount,
    loadMoreResults,
    showAutocomplete,
    setShowAutocomplete,
    clearSearch,
    handleSearchFocus,
    handleSearchBlur,
    getDelayDisplayType
  } = useLocalCallingScreenState({ leads, onCallMade: dailyGoalEnabled ? incrementDailyCallCount : undefined });

  useSimplifiedCallingScreenEffects({
    componentReady,
    setComponentReady,
    leadsInitialized,
    setLeadsInitialized,
    leads,
    leadsData,
    memoizedResetLeadsData,
    currentIndex,
    autoCall,
    callDelay,
    shouldAutoCall,
    setShouldAutoCall,
    setCurrentLeadForAutoCall,
    executeAutoCall,
    getBaseLeads
  });

  // Handle leads data updates without navigation reset
  const handleLeadsDataUpdate = (updatedLeads: Lead[]) => {
    console.log('CallingScreenContainer: Updating leads data without navigation reset');
    updateLeadsDataDirectly(updatedLeads);
  };

  // Handle full leads data reset (for CSV import)
  const handleLeadsDataReset = (updatedLeads: Lead[]) => {
    console.log('CallingScreenContainer: Full reset of leads data');
    memoizedResetLeadsData(updatedLeads);
  };

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
    handleNext,
    handlePrevious,
    selectLead,
    leadsData,
    setSearchQuery,
    setShowAutocomplete,
    updateLeadCallCount,
    resetCallCount,
    resetAllCallCounts,
    onLeadsDataUpdate: handleLeadsDataUpdate
  });

  // Handle CSV import locally
  const handleLeadsImported = async (newLeads: Lead[], newFileName: string) => {
    const success = await importLeadsFromCSV(newLeads, newFileName);
    if (success) {
      onLeadsImported(newLeads, newFileName);
    }
  };

  // Show loading until component is ready
  if (!componentReady || !leadsInitialized) {
    return (
      <div className="h-[100dvh] bg-background flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading caller...</p>
        </div>
      </div>
    );
  }

  const currentLeads = getBaseLeads();
  const currentLead = currentLeads[currentIndex];
  
  // Safety check: if currentLead is undefined, reset to first lead
  if (!currentLead && currentLeads.length > 0) {
    console.log('Current lead is undefined, resetting to first lead');
    // This will be handled by the navigation reset effect
  }
  
  if (leadsData.length === 0) {
    return (
      <div className="h-[100dvh] bg-background overflow-hidden fixed inset-0">
        <div className="bg-background border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold">
                <span style={{ color: '#6EC6F1' }}>ColdCall </span>
                <span style={{ color: '#6EC6F1' }}>X</span>
              </h1>
            </div>
          </div>
        </div>
        <div className="p-6 text-center">
          <p className="text-lg text-muted-foreground">No leads imported</p>
        </div>
      </div>
    );
  }

  const totalLeadCount = currentLeads.length;

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden fixed inset-0">
      {/* Header */}
      <CallingHeader
        searchQuery={searchQuery}
        showAutocomplete={showAutocomplete}
        searchResults={searchResults}
        leadsData={leadsData}
        fileName={fileName}
        onSearchChange={setSearchQuery}
        onSearchFocus={handleSearchFocus}
        onSearchBlur={handleSearchBlur}
        onClearSearch={clearSearch}
        onLeadSelect={handleLeadSelect}
        onLeadsImported={handleLeadsImported}
        loadMoreResults={loadMoreResults}
        loadedResultsCount={loadedResultsCount}
        totalResultsCount={allSearchResults?.length || 0}
      />

      {/* Main Content - takes remaining space, with bottom padding for progress bar */}
      <div className="flex-1 overflow-hidden min-h-0" style={{ paddingBottom: dailyGoalEnabled ? '100px' : '0' }}>
        <MainContent
          currentLead={currentLead}
          currentIndex={currentIndex}
          totalCount={totalLeadCount}
          fileName={fileName}
          timezoneFilter={timezoneFilter}
          callFilter={callFilter}
          shuffleMode={shuffleMode}
          autoCall={autoCall}
          callDelay={callDelay}
          isCountdownActive={isCountdownActive}
          countdownTime={countdownTime}
          showAutocomplete={showAutocomplete}
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
          getDelayDisplayType={getDelayDisplayType}
          noLeadsMessage={!currentLead ? "No Leads Found" : undefined}
        />
      </div>

      {/* Call Progress Bar at bottom */}
      <CallProgressBar dailyCallCount={dailyCallCount} />
    </div>
  );
});

export default CallingScreenContainer;
