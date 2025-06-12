
import React from 'react';
import { useCloudLeadsData } from '@/hooks/useCloudLeadsData';
import { useLeadNavigation } from '../hooks/useLeadNavigation';
import { useSearchState } from './SearchState';
import { useDailyCallState } from './DailyCallState';
import { useCallingScreenHandlers } from '../hooks/useCallingScreenHandlers';
import { useCallingScreenEffects } from '../hooks/useCallingScreenEffects';
import CallingScreenContent from './CallingScreenContent';
import CallingScreenEmpty from './CallingScreenEmpty';
import { Lead } from '../types/lead';

interface CallingScreenLogicProps {
  leads: Lead[];
  fileName: string;
  onBack: () => void;
  onLeadsImported: (leads: Lead[], fileName: string) => void;
}

const CallingScreenLogic: React.FC<CallingScreenLogicProps> = ({
  leads,
  fileName,
  onBack,
  onLeadsImported
}) => {
  const {
    leadLists,
    switchToLeadList,
    deleteLeadList
  } = useCloudLeadsData();

  const {
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
    handleNext,
    handlePrevious,
    resetCallCount,
    resetAllCallCounts,
    selectLead,
    toggleTimezoneFilter,
    toggleCallFilter,
    toggleShuffle,
    toggleAutoCall,
    toggleCallDelay,
    resetCallDelay,
    resetLeadsData
  } = useLeadNavigation(leads);

  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    showAutocomplete,
    setShowAutocomplete,
    clearSearch,
    handleSearchFocus,
    handleSearchBlur
  } = useSearchState({ 
    leads, 
    getBaseLeads, 
    leadsData, 
    timezoneFilter, 
    callFilter 
  });

  const {
    dailyCallCount,
    incrementDailyCallCount,
    resetDailyCallCount
  } = useDailyCallState();

  const {
    handleLeadSelect,
    handleLeadListSelect,
    handleLeadListDelete,
    handleCallClick,
    handleNextWrapper,
    handlePreviousWrapper,
    handleResetCallCount
  } = useCallingScreenHandlers({
    getBaseLeads,
    leadsData,
    selectLead,
    setSearchQuery,
    setShowAutocomplete,
    switchToLeadList,
    deleteLeadList,
    makeCall,
    incrementDailyCallCount,
    handleNext,
    handlePrevious,
    resetCallCount,
    currentIndex
  });

  useCallingScreenEffects({
    leads,
    leadsData,
    shouldAutoCall,
    autoCall,
    currentIndex,
    cardKey,
    resetLeadsData,
    getBaseLeads,
    setCurrentLeadForAutoCall,
    executeAutoCall,
    incrementDailyCallCount,
    setShouldAutoCall
  });

  const currentLeads = getBaseLeads();
  const currentLead = currentLeads[currentIndex];
  
  if (leadsData.length === 0) {
    return <CallingScreenEmpty type="no-leads" />;
  }
  
  if (!currentLead) {
    return (
      <CallingScreenEmpty 
        type="no-filtered-leads"
        onBack={onBack}
        onClearFilters={() => {
          toggleTimezoneFilter();
          toggleCallFilter();
          setSearchQuery('');
        }}
      />
    );
  }

  const totalLeadCount = currentLeads.length;

  return (
    <CallingScreenContent
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
      onLeadsImported={onLeadsImported}
      currentLead={currentLead}
      currentIndex={currentIndex}
      totalCount={totalLeadCount}
      cardKey={cardKey}
      leadLists={leadLists}
      timezoneFilter={timezoneFilter}
      callFilter={callFilter}
      shuffleMode={shuffleMode}
      autoCall={autoCall}
      callDelay={callDelay}
      isCountdownActive={isCountdownActive}
      countdownTime={countdownTime}
      onCall={handleCallClick}
      onResetCallCount={handleResetCallCount}
      onLeadListSelect={handleLeadListSelect}
      onLeadListDelete={handleLeadListDelete}
      onToggleTimezone={toggleTimezoneFilter}
      onToggleCallFilter={toggleCallFilter}
      onToggleShuffle={toggleShuffle}
      onToggleAutoCall={toggleAutoCall}
      onToggleCallDelay={toggleCallDelay}
      onResetCallDelay={resetCallDelay}
      onResetAllCalls={resetAllCallCounts}
      onPrevious={handlePreviousWrapper}
      onNext={handleNextWrapper}
      canGoPrevious={currentLeads.length > 1}
      canGoNext={currentLeads.length > 1}
      dailyCallCount={dailyCallCount}
      onResetDailyCount={resetDailyCallCount}
    />
  );
};

export default CallingScreenLogic;
