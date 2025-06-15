
import React from 'react';
import { Lead } from '../types/lead';
import { useLocalCallingScreenState } from '../hooks/useLocalCallingScreenState';
import { useSimplifiedCallingScreenEffects } from '../hooks/useSimplifiedCallingScreenEffects';
import { useLocalLeadOperations } from '../hooks/useLocalLeadOperations';
import { useCallingScreenHandlers } from './calling-screen/CallingScreenHandlers';
import LoadingState from './calling-screen/LoadingState';
import EmptyState from './calling-screen/EmptyState';
import CallingScreenLayout from './calling-screen/CallingScreenLayout';

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
    updateLeadsDataDirectly,
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

  // Handle leads data updates without navigation reset
  const handleLeadsDataUpdate = (updatedLeads: Lead[]) => {
    console.log('CallingScreenContainer: Updating leads data without navigation reset');
    updateLeadsDataDirectly(updatedLeads);
  };

  const {
    handleLeadSelect,
    handleCallClick,
    handleNextWrapper,
    handlePreviousWrapper,
    handleResetCallCount,
    handleResetAllCallCounts
  } = useCallingScreenHandlers({
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
    return <LoadingState />;
  }

  const currentLeads = getBaseLeads();
  const currentLead = currentLeads[currentIndex];
  
  if (leadsData.length === 0) {
    return <EmptyState />;
  }

  const totalLeadCount = currentLeads.length;

  return (
    <CallingScreenLayout
      // Header props
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
      
      // Main content props
      currentLead={currentLead}
      currentIndex={currentIndex}
      totalCount={totalLeadCount}
      timezoneFilter={timezoneFilter}
      callFilter={callFilter}
      shuffleMode={shuffleMode}
      autoCall={autoCall}
      callDelay={callDelay}
      isCountdownActive={isCountdownActive}
      countdownTime={countdownTime}
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
  );
};

export default CallingScreenContainer;
