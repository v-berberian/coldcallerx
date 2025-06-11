
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import CallingHeader from './CallingHeader';
import MainContent from './MainContent';
import DailyProgress from './DailyProgress';
import { useLeadNavigation } from '../hooks/useLeadNavigation';

interface Lead {
  name: string;
  phone: string;
  called?: number;
  lastCalled?: string;
}

interface CallingScreenProps {
  leads: Lead[];
  fileName: string;
  onBack: () => void;
  onLeadsImported: (leads: Lead[], fileName: string) => void;
}

const CallingScreen: React.FC<CallingScreenProps> = ({
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

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(leads);
  const [isSearching, setIsSearching] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [searchBasedNavigation, setSearchBasedNavigation] = useState(false);
  const [searchBaseLeads, setSearchBaseLeads] = useState<Lead[]>([]);
  const [dailyCallCount, setDailyCallCount] = useState(0);

  // Load daily call count from localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    const savedCount = localStorage.getItem(`daily-calls-${today}`);
    if (savedCount) {
      setDailyCallCount(parseInt(savedCount, 10));
    }
  }, []);

  // Save daily call count to localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    localStorage.setItem(`daily-calls-${today}`, dailyCallCount.toString());
  }, [dailyCallCount]);

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
      const currentLeads = searchBasedNavigation ? searchBaseLeads : getBaseLeads();
      const currentLead = currentLeads[currentIndex];
      
      if (currentLead) {
        console.log('Auto-call triggered for displayed lead:', currentLead.name, currentLead.phone);
        executeAutoCall(currentLead);
        // Increment daily call count
        setDailyCallCount(prev => prev + 1);
      }
      
      setShouldAutoCall(false);
    }
  }, [shouldAutoCall, autoCall, currentIndex, cardKey, searchBasedNavigation, searchBaseLeads]);

  useEffect(() => {
    const baseLeads = getBaseLeads();
    if (searchQuery.trim()) {
      const filtered = baseLeads.filter(lead => 
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        lead.phone.includes(searchQuery)
      );
      setSearchResults(filtered);
      setIsSearching(true);
    } else {
      setSearchResults(baseLeads);
      setIsSearching(false);
      // Clear search-based navigation when search is cleared
      if (searchBasedNavigation) {
        setSearchBasedNavigation(false);
        setSearchBaseLeads([]);
      }
    }
  }, [searchQuery, leadsData, timezoneFilter, callFilter]);

  const clearSearch = () => {
    setSearchQuery('');
    setShowAutocomplete(false);
    setSearchBasedNavigation(false);
    setSearchBaseLeads([]);
  };

  const handleSearchFocus = () => {
    setShowAutocomplete(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => setShowAutocomplete(false), 150);
  };

  const handleLeadSelect = (lead: Lead) => {
    // Set up search-based navigation
    const currentSearchResults = searchResults;
    const leadIndexInSearch = currentSearchResults.findIndex(l => 
      l.name === lead.name && l.phone === lead.phone
    );
    
    if (leadIndexInSearch !== -1) {
      setSearchBasedNavigation(true);
      setSearchBaseLeads(currentSearchResults);
      selectLead(lead);
      // Update current index to match position in search results
      // The selectLead function will handle finding the lead in the full filtered list
      // but we need to track which search result we're at for navigation
    }
    
    setSearchQuery('');
    setShowAutocomplete(false);
  };

  const handleNextWrapper = () => {
    if (searchBasedNavigation && searchBaseLeads.length > 0) {
      // Navigate within search results
      const currentLeads = searchBaseLeads;
      const currentLead = currentLeads[currentIndex];
      const nextIndex = (currentIndex + 1) % currentLeads.length;
      const nextLead = currentLeads[nextIndex];
      
      if (nextLead) {
        selectLead(nextLead);
      }
    } else {
      handleNext();
    }
    
    // Set flag to trigger auto-call after navigation
    if (autoCall) {
      setShouldAutoCall(true);
    }
  };

  const handlePreviousWrapper = () => {
    if (searchBasedNavigation && searchBaseLeads.length > 0) {
      // Navigate within search results
      const currentLeads = searchBaseLeads;
      const prevIndex = currentIndex === 0 ? currentLeads.length - 1 : currentIndex - 1;
      const prevLead = currentLeads[prevIndex];
      
      if (prevLead) {
        selectLead(prevLead);
      }
    } else {
      handlePrevious();
    }
  };

  // Handle manual call button click
  const handleCallClick = () => {
    makeCall(currentLead);
    setDailyCallCount(prev => prev + 1);
  };

  // Reset daily call count
  const resetDailyCallCount = () => {
    setDailyCallCount(0);
  };

  // Get the current navigation context
  const getCurrentLeads = () => {
    return searchBasedNavigation ? searchBaseLeads : getBaseLeads();
  };

  const currentLeads = getCurrentLeads();
  const currentLead = currentLeads[currentIndex];
  
  if (leadsData.length === 0) {
    return (
      <div className="h-screen h-[100vh] h-[100svh] bg-background overflow-hidden">
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
      <div className="h-screen h-[100vh] h-[100svh] bg-background flex items-center justify-center p-4 overflow-hidden">
        <Card className="w-full max-w-md shadow-lg rounded-2xl">
          <CardContent className="p-8 text-center">
            <p className="text-lg">No leads found with current filters</p>
            <div className="mt-4 space-y-2">
              <Button 
                onClick={() => {
                  toggleTimezoneFilter();
                  toggleCallFilter();
                  setSearchQuery('');
                  setSearchBasedNavigation(false);
                  setSearchBaseLeads([]);
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
    <div className="h-screen h-[100vh] h-[100svh] bg-background flex flex-col overflow-hidden">
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

      {/* Main Content */}
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
        onPrevious={handlePreviousWrapper}
        onNext={handleNextWrapper}
        canGoPrevious={currentLeads.length > 1}
        canGoNext={currentLeads.length > 1}
      />

      {/* Daily Progress Bar at Bottom */}
      <DailyProgress
        dailyCallCount={dailyCallCount}
        onResetDailyCount={resetDailyCallCount}
      />
    </div>
  );
};

export default CallingScreen;
