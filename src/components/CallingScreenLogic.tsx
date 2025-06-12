import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import CallingHeader from './CallingHeader';
import MainContent from './MainContent';
import DailyProgress from './DailyProgress';
import WelcomeScreen from './WelcomeScreen';
import { useSearchState } from './SearchState';
import { useDailyCallState } from './DailyCallState';
import { useLeadNavigation } from '../hooks/useLeadNavigation';
import { useSupabaseLeads } from '../hooks/useSupabaseLeads';
import { useAuth } from '@/hooks/useAuth';
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
  const { user } = useAuth();
  const {
    leadLists,
    currentListId,
    leadsData,
    loading,
    createLeadList,
    updateLeadCallStatus,
    switchToList,
    getCurrentListName,
    refreshLists
  } = useSupabaseLeads(user?.id);

  const {
    currentIndex,
    cardKey,
    timezoneFilter,
    callFilter,
    shuffleMode,
    autoCall,
    callDelay,
    historyIndex,
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
  } = useLeadNavigation(leadsData);

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
    leads: leadsData, 
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

  // Handle CSV imports (legacy support)
  useEffect(() => {
    if (leads.length > 0 && fileName && user?.id) {
      createLeadList(fileName, leads);
    }
  }, [leads, fileName, user?.id]);

  // Update server when call status changes
  const handleCallClick = async () => {
    const currentLeads = getBaseLeads();
    const currentLead = currentLeads[currentIndex];
    
    // Make the call
    makeCall(currentLead);
    incrementDailyCallCount();
    
    // Update server with new call status
    const updatedLead = {
      ...currentLead,
      called: (currentLead.called || 0) + 1,
      lastCalled: new Date().toLocaleString()
    };
    
    await updateLeadCallStatus(updatedLead);
  };

  // Handle auto-call with server sync
  useEffect(() => {
    if (shouldAutoCall && autoCall) {
      const currentLeads = getBaseLeads();
      const currentLead = currentLeads[currentIndex];
      
      if (currentLead) {
        console.log('Auto-call triggered for displayed lead:', currentLead.name, currentLead.phone);
        setCurrentLeadForAutoCall(currentLead);
        executeAutoCall(currentLead);
        incrementDailyCallCount();
        
        // Update server
        const updatedLead = {
          ...currentLead,
          called: (currentLead.called || 0) + 1,
          lastCalled: new Date().toLocaleString()
        };
        updateLeadCallStatus(updatedLead);
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
      selectLead(lead, baseLeads, leadsData);
      console.log('Selected lead from autocomplete:', lead.name, 'at base index:', leadIndexInBaseLeads);
    }
    
    setSearchQuery('');
    setShowAutocomplete(false);
  };

  const handleNextWrapper = () => {
    const currentLeads = getBaseLeads();
    handleNext(currentLeads);
  };

  const handlePreviousWrapper = () => {
    const currentLeads = getBaseLeads();
    handlePrevious(currentLeads);
  };

  const handleLeadsImported = async (importedLeads: Lead[], importedFileName: string) => {
    if (user?.id) {
      await createLeadList(importedFileName, importedLeads);
    } else {
      onLeadsImported(importedLeads, importedFileName);
    }
  };

  const handleResetCallCount = async () => {
    const currentLeads = getBaseLeads();
    const currentLead = currentLeads[currentIndex];
    
    resetCallCount(currentLead);
    
    // Update server
    const updatedLead = {
      ...currentLead,
      called: 0,
      lastCalled: undefined
    };
    await updateLeadCallStatus(updatedLead);
  };

  if (loading) {
    return (
      <div className="h-[100dvh] bg-background overflow-hidden fixed inset-0 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">
            <span className="text-blue-500">Cold</span>
            <span className="text-foreground">Caller </span>
            <span className="text-blue-500">X</span>
          </h1>
          <p className="text-muted-foreground">Loading your lead lists...</p>
        </div>
      </div>
    );
  }

  // Show welcome screen if user has no lead lists
  if (leadLists.length === 0) {
    return <WelcomeScreen onLeadsImported={handleLeadsImported} />;
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
                <span className="text-blue-500">Cold</span>
                <span className="text-foreground">Caller </span> 
                <span className="text-blue-500">X</span>
              </h1>
            </div>
          </div>
        </div>
        <div className="p-6 text-center">
          <p className="text-lg text-muted-foreground">No leads found</p>
          <p className="text-sm text-muted-foreground mt-2">Import a lead list to get started</p>
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
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalLeadCount = currentLeads.length;
  const currentListName = getCurrentListName();

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden fixed inset-0">
      {/* Header */}
      <CallingHeader
        searchQuery={searchQuery}
        showAutocomplete={showAutocomplete}
        searchResults={searchResults}
        leadsData={leadsData}
        fileName={currentListName}
        leadLists={leadLists}
        currentListId={currentListId}
        onSearchChange={setSearchQuery}
        onSearchFocus={handleSearchFocus}
        onSearchBlur={handleSearchBlur}
        onClearSearch={clearSearch}
        onLeadSelect={handleLeadSelect}
        onLeadsImported={handleLeadsImported}
        onSelectList={switchToList}
        onCreateList={createLeadList}
      />

      {/* Main Content - takes remaining space */}
      <div className="flex-1 overflow-hidden">
        <MainContent
          currentLead={currentLead}
          currentIndex={currentIndex}
          totalCount={totalLeadCount}
          fileName={currentListName}
          cardKey={cardKey}
          timezoneFilter={timezoneFilter}
          callFilter={callFilter}
          shuffleMode={shuffleMode}
          autoCall={autoCall}
          callDelay={callDelay}
          isCountdownActive={isCountdownActive}
          countdownTime={countdownTime}
          onCall={handleCallClick}
          onResetCallCount={handleResetCallCount}
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
