
import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import CallingHeader from './CallingHeader';
import MainContent from './MainContent';
import AutoCallCountdown from './AutoCallCountdown';
import { useSearchState } from './SearchState';
import { useLeadNavigation } from '../hooks/useLeadNavigation';
import { Lead } from '../types/lead';
import { SessionState } from '@/services/sessionService';

interface CallingScreenLogicProps {
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

const CallingScreenLogic: React.FC<CallingScreenLogicProps> = ({
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
  const [componentReady, setComponentReady] = useState(false);
  const [leadsInitialized, setLeadsInitialized] = useState(false);

  // Initialize hooks - only pass leads to useLeadNavigation
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

  // Progressive component initialization
  useEffect(() => {
    console.log('CallingScreenLogic: Starting progressive initialization');
    
    const initializeComponent = async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      console.log('CallingScreenLogic: Component ready');
      setComponentReady(true);
    };

    initializeComponent();
  }, []);

  // Handle new CSV imports by resetting the leads data - only when leads actually change
  useEffect(() => {
    if (componentReady && !leadsInitialized) {
      console.log('CallingScreenLogic: Initializing leads data for first time');
      resetLeadsData(leads);
      setLeadsInitialized(true);
    }
  }, [componentReady, leadsInitialized, leads.length]); // Only depend on leads.length to avoid infinite loops

  // Save session state changes to cloud
  useEffect(() => {
    if (updateSessionState && componentReady && leadsInitialized) {
      const saveSessionState = async () => {
        await updateSessionState({
          currentLeadIndex: currentIndex,
          timezoneFilter,
          callFilter,
          shuffleMode,
          autoCall,
          callDelay
        });
      };

      const timeoutId = setTimeout(saveSessionState, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [currentIndex, timezoneFilter, callFilter, shuffleMode, autoCall, callDelay, updateSessionState, componentReady, leadsInitialized]);

  // Handle auto-call using the currently displayed lead
  useEffect(() => {
    if (shouldAutoCall && autoCall && componentReady && leadsInitialized) {
      const currentLeads = getBaseLeads();
      const currentLead = currentLeads[currentIndex];
      
      if (currentLead) {
        console.log('CallingScreenLogic: Auto-call triggered for displayed lead:', currentLead.name, currentLead.phone);
        setCurrentLeadForAutoCall(currentLead);
        executeAutoCall(currentLead);
        
        // Mark as called in cloud if function is provided
        if (markLeadAsCalled) {
          markLeadAsCalled(currentLead);
        }
      }
      
      setShouldAutoCall(false);
    }
  }, [shouldAutoCall, autoCall, currentIndex, cardKey, componentReady, leadsInitialized, markLeadAsCalled]);

  const handleLeadSelect = (lead: Lead) => {
    const baseLeads = getBaseLeads();
    const leadIndexInBaseLeads = baseLeads.findIndex(l => 
      l.name === lead.name && l.phone === lead.phone
    );
    
    if (leadIndexInBaseLeads !== -1) {
      selectLead(lead, baseLeads, leadsData);
      console.log('CallingScreenLogic: Selected lead from autocomplete:', lead.name, 'at base index:', leadIndexInBaseLeads);
    }
    
    setSearchQuery('');
    setShowAutocomplete(false);
  };

  // Handle manual call button click
  const handleCallClick = async () => {
    const currentLeads = getBaseLeads();
    const currentLead = currentLeads[currentIndex];
    makeCall(currentLead);
    
    // Mark as called in cloud if function is provided
    if (markLeadAsCalled) {
      await markLeadAsCalled(currentLead);
    }
  };

  // Create wrapper functions for navigation that pass the required baseLeads parameter
  const handleNextWrapper = () => {
    const currentLeads = getBaseLeads();
    handleNext(currentLeads);
  };

  const handlePreviousWrapper = () => {
    const currentLeads = getBaseLeads();
    handlePrevious(currentLeads);
  };

  // Handle reset call count with cloud sync
  const handleResetCallCount = async (lead: Lead) => {
    if (resetCallCount) {
      resetCallCount(lead);
    }
  };

  // Handle reset all call counts with cloud sync
  const handleResetAllCallCounts = async () => {
    if (resetAllCallCounts) {
      resetAllCallCounts();
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
          <div className="flex items-center justify-center">
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
        onLeadsImported={onLeadsImported}
      />

      {/* Main Content - takes remaining space, no daily progress bar */}
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
        />
      </div>

      {/* Auto Call Countdown - hidden, just for logic */}
      <AutoCallCountdown
        isActive={isCountdownActive}
        duration={countdownTime}
        onComplete={() => {}}
      />
    </div>
  );
};

export default CallingScreenLogic;
