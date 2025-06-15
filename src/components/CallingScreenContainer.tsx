import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import CallingHeader from './CallingHeader';
import MainContent from './MainContent';
import { Lead } from '../types/lead';
import { useLocalCallingScreenState } from '../hooks/useLocalCallingScreenState';
import { useSimplifiedCallingScreenEffects } from '../hooks/useSimplifiedCallingScreenEffects';
import { useCallingScreenActions } from './CallingScreenActions';
import { useLocalLeadOperations } from '../hooks/useLocalLeadOperations';

interface CallingScreenContainerProps {
  leads: Lead[];
  fileName: string;
  onBack: () => void;
  onLeadsImported: (leads: Lead[], fileName: string) => void;
}

const CallingScreenContainer: React.FC<CallingScreenContainerProps> = ({
  leads,
  fileName,
  onBack,
  onLeadsImported
}) => {
  const { importLeadsFromCSV, updateLeadCallCount, resetCallCount, resetAllCallCounts } = useLocalLeadOperations();

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
    searchQuery,
    setSearchQuery,
    searchResults,
    showAutocomplete,
    setShowAutocomplete,
    clearSearch,
    handleSearchFocus,
    handleSearchBlur,
    getDelayDisplayType
  } = useLocalCallingScreenState({ leads });

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

  // Handle leads data updates
  const handleLeadsDataUpdate = (updatedLeads: Lead[]) => {
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
  
  if (leadsData.length === 0) {
    return (
      <div className="h-[100dvh] bg-background overflow-hidden fixed inset-0">
        <div className="bg-background border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold">
                <span className="text-blue-500">ColdCall </span>
                <span className="text-blue-500">X</span>
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
  
  if (!currentLead) {
    return (
      <div className="h-[100dvh] bg-background flex items-center justify-center p-4 overflow-hidden fixed inset-0">
        <Card className="w-full max-w-md shadow-lg rounded-2xl">
          <CardContent className="p-8 text-center">
            <p className="text-lg">No leads found with current filters</p>
            <div className="mt-4 space-y-2">
              <Button 
                onClick={() => {
                  toggleTimezoneFilter();
                  toggleCallFilter();
                  setSearchQuery('');
                }} 
                className="w-full rounded-xl"
              >
                Clear All Filters
              </Button>
              <Button onClick={onBack} variant="outline" className="w-full rounded-xl">
                Back to Import
              </Button>
            </div>
          </CardContent>
        </Card>
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
      />

      {/* Main Content - takes remaining space */}
      <div className="flex-1 overflow-hidden">
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
        />
      </div>
    </div>
  );
};

export default CallingScreenContainer;
