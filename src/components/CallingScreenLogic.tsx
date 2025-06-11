
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import CallingHeader from './CallingHeader';
import MainContent from './MainContent';
import DailyProgress from './DailyProgress';
import { useSearchState } from './SearchState';
import { useDailyCallState } from './DailyCallState';
import { useLeadNavigation } from '../hooks/useLeadNavigation';
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
    leadsData,
    currentIndex,
    cardKey,
    timezoneFilter,
    callFilter,
    shuffleMode,
    autoCall,
    historyIndex,
    shouldAutoCall,
    setShouldAutoCall,
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

  // Handle new CSV imports by resetting the leads data
  useEffect(() => {
    resetLeadsData(leads);
  }, [leads]);

  // Save updated leads data to localStorage whenever leadsData changes
  useEffect(() => {
    if (leadsData.length > 0) {
      localStorage.setItem('coldcaller-leads', JSON.stringify(leadsData));
    }
  }, [leadsData]);

  // Handle auto-call using the currently displayed lead
  useEffect(() => {
    if (shouldAutoCall && autoCall) {
      const currentLeads = getBaseLeads();
      const currentLead = currentLeads[currentIndex];
      
      if (currentLead) {
        console.log('Auto-call triggered for displayed lead:', currentLead.name, currentLead.phone);
        executeAutoCall(currentLead);
        incrementDailyCallCount();
      }
      
      setShouldAutoCall(false);
    }
  }, [shouldAutoCall, autoCall, currentIndex, cardKey]);

  const handleLeadSelect = (lead: Lead) => {
    const baseLeads = getBaseLeads();
    const leadIndexInBaseLeads = baseLeads.findIndex(l => 
      l.name === lead.name && l.phone === lead.phone
    );
    
    if (leadIndexInBaseLeads !== -1) {
      selectLead(lead);
      console.log('Selected lead from autocomplete:', lead.name, 'at base index:', leadIndexInBaseLeads);
    }
    
    setSearchQuery('');
    setShowAutocomplete(false);
  };

  // Handle manual call button click
  const handleCallClick = () => {
    const currentLeads = getBaseLeads();
    const currentLead = currentLeads[currentIndex];
    makeCall(currentLead);
    incrementDailyCallCount();
  };

  const currentLeads = getBaseLeads();
  const currentLead = currentLeads[currentIndex];
  
  if (leadsData.length === 0) {
    return (
      <div className="h-[100dvh] bg-background overflow-hidden fixed inset-0">
        <div className="bg-background border-b border-border p-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold">
                <span className="text-blue-500">Cold</span>
                <span className="text-foreground">Caller </span> 
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
        onLeadsImported={onLeadsImported}
      />

      {/* Main Content - takes remaining space */}
      <div className="flex-1 overflow-hidden">
        <MainContent
          currentLead={currentLead}
          currentIndex={currentIndex}
          totalCount={totalLeadCount}
          fileName={fileName}
          cardKey={cardKey}
          timezoneFilter={timezoneFilter}
          callFilter={callFilter}
          shuffleMode={shuffleMode}
          autoCall={autoCall}
          onCall={handleCallClick}
          onResetCallCount={() => resetCallCount(currentLead)}
          onToggleTimezone={toggleTimezoneFilter}
          onToggleCallFilter={toggleCallFilter}
          onToggleShuffle={toggleShuffle}
          onToggleAutoCall={toggleAutoCall}
          onResetAllCalls={resetAllCallCounts}
          onPrevious={handlePrevious}
          onNext={handleNext}
          canGoPrevious={currentLeads.length > 1}
          canGoNext={currentLeads.length > 1}
        />
      </div>

      {/* Daily Progress Bar - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <DailyProgress
          dailyCallCount={dailyCallCount}
          onResetDailyCount={resetDailyCallCount}
        />
      </div>
    </div>
  );
};

export default CallingScreenLogic;
