import React, { memo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import CallingHeader from './CallingHeader';
import MainContent from './MainContent';
import { Lead } from '../types/lead';
import { useLocalCallingScreenState } from '../hooks/useLocalCallingScreenState';
import { useSimplifiedCallingScreenEffects } from '../hooks/useSimplifiedCallingScreenEffects';
import { useCallingScreenActions } from './CallingScreenActions';
import { useLocalLeadOperations } from '../hooks/useLocalLeadOperations';
import { useDailyCallState } from './DailyCallState';
import { appStorage } from '../utils/storage';

interface CallingScreenContainerProps {
  leads: Lead[];
  fileName: string;
  onBack: () => void;
  onLeadsImported: (leads: Lead[], fileName: string, csvId: string) => void;
  currentCSVId: string | null;
  onCSVSelect: (csvId: string, leads: Lead[], fileName: string) => void;
  onAllListsDeleted?: () => void;
}

const CallingScreenContainer: React.FC<CallingScreenContainerProps> = memo(({
  leads,
  fileName,
  onBack,
  onLeadsImported,
  currentCSVId,
  onCSVSelect,
  onAllListsDeleted
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
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load daily goal setting from storage
  useEffect(() => {
    const loadSettings = async () => {
      const savedDailyGoal = localStorage.getItem('dailyGoalEnabled');
      if (savedDailyGoal !== null) {
        const enabled = savedDailyGoal === 'true';
        setDailyGoalEnabled(enabled);
      }
    };
    loadSettings();
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
    closeAutocomplete,
    getDelayDisplayType
  } = useLocalCallingScreenState({ leads, onCallMade: dailyGoalEnabled ? incrementDailyCallCount : undefined, refreshTrigger });

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
    updateLeadsDataDirectly(updatedLeads);
  };

  // Handle full leads data reset (for CSV import)
  const handleLeadsDataReset = (updatedLeads: Lead[]) => {
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
    updateLeadCallCount: resetCallCount,
    resetCallCount: resetCallCount,
    resetAllCallCounts: resetAllCallCounts,
    onLeadsDataUpdate: handleLeadsDataUpdate
  });

  // Handle CSV import locally
  const handleLeadsImported = async (newLeads: Lead[], newFileName: string, csvId: string) => {
    const success = await importLeadsFromCSV(newLeads, newFileName, csvId);
    if (success) {
      onLeadsImported(newLeads, newFileName, csvId);
      // Trigger refresh of CSV selector
      setRefreshTrigger(prev => prev + 1);
    }
  };

  // Handle CSV selection
  const handleCSVSelect = (csvId: string, newLeads: Lead[], newFileName: string) => {
    memoizedResetLeadsData(newLeads);
    onCSVSelect(csvId, newLeads, newFileName);
    // Trigger refresh of CSV selector
    setRefreshTrigger(prev => prev + 1);
  };

  // Show loading until component is ready
  if (!componentReady || !leadsInitialized) {
    return (
      <div className="h-[100dvh] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading caller...</p>
        </div>
      </div>
    );
  }

  const currentLeads = getBaseLeads();
  // Clamp currentIndex to valid range for filtered leads
  const safeCurrentIndex = Math.max(0, Math.min(currentIndex, currentLeads.length - 1));
  const currentLead = currentLeads[safeCurrentIndex];
  
  if (leadsData.length === 0) {
    return (
      <div className="h-[100dvh] overflow-hidden fixed inset-0">
        <div className="border-b border-border p-4">
          <CallingHeader
            searchQuery={searchQuery}
            showAutocomplete={showAutocomplete}
            searchResults={searchResults}
            allSearchResults={allSearchResults}
            leadsData={leadsData}
            fileName={fileName}
            onSearchChange={setSearchQuery}
            onSearchFocus={handleSearchFocus}
            onSearchBlur={handleSearchBlur}
            onClearSearch={clearSearch}
            onLeadSelect={handleLeadSelect}
            onLeadsImported={handleLeadsImported}
            onCSVSelect={handleCSVSelect}
            currentCSVId={currentCSVId}
            refreshTrigger={refreshTrigger}
            loadMoreResults={loadMoreResults}
            loadedResultsCount={loadedResultsCount}
            totalResultsCount={allSearchResults?.length || 0}
            onCloseAutocomplete={closeAutocomplete}
            onAllListsDeleted={onAllListsDeleted}
          />
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h2 className="text-xl font-semibold text-foreground">No leads loaded</h2>
            <p className="text-muted-foreground">Import a CSV file to get started</p>
          </div>
        </div>
      </div>
    );
  }

  const totalLeadCount = currentLeads.length;

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden fixed inset-0">
      {/* Header */}
      <CallingHeader
        searchQuery={searchQuery}
        showAutocomplete={showAutocomplete}
        searchResults={searchResults}
        allSearchResults={allSearchResults}
        leadsData={leadsData}
        fileName={fileName}
        onSearchChange={setSearchQuery}
        onSearchFocus={handleSearchFocus}
        onSearchBlur={handleSearchBlur}
        onClearSearch={clearSearch}
        onLeadSelect={handleLeadSelect}
        onLeadsImported={handleLeadsImported}
        onCSVSelect={handleCSVSelect}
        currentCSVId={currentCSVId}
        refreshTrigger={refreshTrigger}
        loadMoreResults={loadMoreResults}
        loadedResultsCount={loadedResultsCount}
        totalResultsCount={allSearchResults?.length || 0}
        onCloseAutocomplete={closeAutocomplete}
        onAllListsDeleted={onAllListsDeleted}
      />

      {/* Main Content - takes remaining space */}
      <div className="flex-1 overflow-hidden min-h-0">
        <MainContent
          currentLead={currentLead}
          currentIndex={safeCurrentIndex}
          totalCount={totalLeadCount}
          fileName={fileName}
          currentCSVId={currentCSVId}
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
          onCSVSelect={handleCSVSelect}
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
          refreshTrigger={refreshTrigger}
          onImportNew={() => {
            // Trigger the CSV importer by clicking the import button in the header
            const importButton = document.querySelector('[data-import-csv]') as HTMLElement;
            if (importButton) {
              importButton.click();
            }
          }}
        />
      </div>
    </div>
  );
});

export default CallingScreenContainer;
