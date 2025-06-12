
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import CallingHeader from './CallingHeader';
import MainContent from './MainContent';
import DailyProgress from './DailyProgress';
import { useSearchState } from './SearchState';
import { useDailyCallState } from './DailyCallState';
import { useLeadNavigation } from '../hooks/useLeadNavigation';
import { Lead } from '../types/lead';

interface CloudSyncProps {
  isLoading: boolean;
  lastSyncTime?: Date;
}

interface CallingScreenLogicProps {
  leads: Lead[];
  fileName: string;
  onBack: () => void;
  onLeadsImported: (leads: Lead[], fileName: string) => void;
  sessionState?: any;
  onSessionUpdate?: (updates: any) => void;
  cloudSyncProps?: CloudSyncProps;
}

const CallingScreenLogic: React.FC<CallingScreenLogicProps> = ({
  leads,
  fileName,
  onBack,
  onLeadsImported,
  sessionState,
  onSessionUpdate,
  cloudSyncProps
}) => {
  console.log('CallingScreenLogic rendering with sessionState:', sessionState);
  
  const leadNavigation = useLeadNavigation(leads, onSessionUpdate, sessionState);
  
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
    getBaseLeads: leadNavigation.getBaseLeads, 
    leadsData: leadNavigation.leadsData, 
    timezoneFilter: leadNavigation.timezoneFilter, 
    callFilter: leadNavigation.callFilter 
  });

  const {
    dailyCallCount,
    incrementDailyCallCount,
    resetDailyCallCount
  } = useDailyCallState();

  // Handle new CSV imports by resetting the leads data
  useEffect(() => {
    console.log('Resetting leads data for new CSV import');
    leadNavigation.resetLeadsData(leads);
  }, [leads, leadNavigation.resetLeadsData]);

  // Save updated leads data to localStorage whenever leadsData changes
  useEffect(() => {
    if (leadNavigation.leadsData.length > 0) {
      localStorage.setItem('coldcaller-leads', JSON.stringify(leadNavigation.leadsData));
    }
  }, [leadNavigation.leadsData]);

  // Handle auto-call using the currently displayed lead
  useEffect(() => {
    if (leadNavigation.shouldAutoCall && leadNavigation.autoCall) {
      const currentLeads = leadNavigation.getBaseLeads();
      const currentLead = currentLeads[leadNavigation.currentIndex];
      
      if (currentLead) {
        console.log('Auto-call triggered for displayed lead:', currentLead.name, currentLead.phone);
        leadNavigation.setCurrentLeadForAutoCall(currentLead);
        leadNavigation.executeAutoCall(currentLead);
        incrementDailyCallCount();
      }
      
      leadNavigation.setShouldAutoCall(false);
    }
  }, [leadNavigation.shouldAutoCall, leadNavigation.autoCall, leadNavigation.currentIndex, leadNavigation.cardKey, leadNavigation.getBaseLeads, leadNavigation.setCurrentLeadForAutoCall, leadNavigation.executeAutoCall, incrementDailyCallCount, leadNavigation.setShouldAutoCall]);

  const handleLeadSelect = (lead: Lead) => {
    console.log('Lead selected from search:', lead.name);
    const baseLeads = leadNavigation.getBaseLeads();
    leadNavigation.selectLead(lead, baseLeads, leadNavigation.leadsData);
    
    setSearchQuery('');
    setShowAutocomplete(false);
  };

  // Handle manual call button click
  const handleCallClick = () => {
    const currentLeads = leadNavigation.getBaseLeads();
    const currentLead = currentLeads[leadNavigation.currentIndex];
    leadNavigation.makeCall(currentLead);
    incrementDailyCallCount();
  };

  const currentLeads = leadNavigation.getBaseLeads();
  const currentLead = currentLeads[leadNavigation.currentIndex];
  
  console.log('Current state:', { 
    currentIndex: leadNavigation.currentIndex, 
    currentLeadName: currentLead?.name, 
    totalLeads: currentLeads.length,
    sessionCurrentIndex: sessionState?.currentLeadIndex
  });
  
  if (leadNavigation.leadsData.length === 0) {
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
                  leadNavigation.toggleTimezoneFilter();
                  leadNavigation.toggleCallFilter();
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
        leadsData={leadNavigation.leadsData}
        fileName={fileName}
        onSearchChange={setSearchQuery}
        onSearchFocus={handleSearchFocus}
        onSearchBlur={handleSearchBlur}
        onClearSearch={clearSearch}
        onLeadSelect={handleLeadSelect}
        onLeadsImported={onLeadsImported}
        cloudSyncProps={cloudSyncProps}
      />

      {/* Main Content - takes remaining space */}
      <div className="flex-1 overflow-hidden">
        <MainContent
          currentLead={currentLead}
          currentIndex={leadNavigation.currentIndex}
          totalCount={totalLeadCount}
          fileName={fileName}
          cardKey={leadNavigation.cardKey}
          timezoneFilter={leadNavigation.timezoneFilter}
          callFilter={leadNavigation.callFilter}
          shuffleMode={leadNavigation.shuffleMode}
          autoCall={leadNavigation.autoCall}
          callDelay={leadNavigation.callDelay}
          isCountdownActive={leadNavigation.isCountdownActive}
          countdownTime={leadNavigation.countdownTime}
          onCall={handleCallClick}
          onResetCallCount={() => leadNavigation.resetCallCount(currentLead)}
          onToggleTimezone={leadNavigation.toggleTimezoneFilter}
          onToggleCallFilter={leadNavigation.toggleCallFilter}
          onToggleShuffle={leadNavigation.toggleShuffle}
          onToggleAutoCall={leadNavigation.toggleAutoCall}
          onToggleCallDelay={leadNavigation.toggleCallDelay}
          onResetCallDelay={leadNavigation.resetCallDelay}
          onResetAllCalls={leadNavigation.resetAllCallCounts}
          onPrevious={() => leadNavigation.handlePrevious(currentLeads)}
          onNext={() => leadNavigation.handleNext(currentLeads)}
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
