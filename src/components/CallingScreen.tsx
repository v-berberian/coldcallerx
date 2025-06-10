
import React, { useState, useEffect } from 'react';
import CallingScreenHeader from './CallingScreenHeader';
import CallingScreenMain from './CallingScreenMain';
import CallingScreenEmpty from './CallingScreenEmpty';
import { useLeadNavigation } from '../hooks/useLeadNavigation';
import { filterLeadsByTimezone } from '../utils/timezoneUtils';

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
    getBaseLeads,
    makeCall,
    handleNext,
    handlePrevious,
    resetCallCount,
    resetAllCallCounts,
    selectLead,
    toggleTimezoneFilter,
    toggleCallFilter,
    toggleShuffle,
    toggleAutoCall,
    resetLeadsData,
    isLeadPendingCall
  } = useLeadNavigation(leads);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(leads);
  const [isSearching, setIsSearching] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);

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
    }
  }, [searchQuery, leadsData, timezoneFilter, callFilter]);

  const clearSearch = () => {
    setSearchQuery('');
    setShowAutocomplete(false);
  };

  const handleSearchFocus = () => {
    setShowAutocomplete(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => setShowAutocomplete(false), 150);
  };

  const handleLeadSelect = (lead: Lead) => {
    selectLead(lead);
    setSearchQuery('');
    setShowAutocomplete(false);
  };

  const handleClearFilters = () => {
    toggleTimezoneFilter();
    toggleCallFilter();
    setSearchQuery('');
  };

  const baseLeads = getBaseLeads();
  const currentLead = baseLeads[currentIndex];
  
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
      <CallingScreenEmpty
        onClearFilters={handleClearFilters}
        onBack={onBack}
      />
    );
  }

  const totalLeadCount = baseLeads.length;
  
  return (
    <div className="h-screen h-[100vh] h-[100svh] bg-background flex flex-col overflow-hidden">
      <CallingScreenHeader
        fileName={fileName}
        searchQuery={searchQuery}
        showAutocomplete={showAutocomplete}
        searchResults={searchResults}
        leadsData={leadsData}
        onLeadsImported={onLeadsImported}
        onSearchChange={setSearchQuery}
        onSearchFocus={handleSearchFocus}
        onSearchBlur={handleSearchBlur}
        onClearSearch={clearSearch}
        onLeadSelect={handleLeadSelect}
      />

      <CallingScreenMain
        currentLead={currentLead}
        currentIndex={currentIndex}
        totalCount={totalLeadCount}
        fileName={fileName}
        cardKey={cardKey}
        timezoneFilter={timezoneFilter}
        callFilter={callFilter}
        shuffleMode={shuffleMode}
        autoCall={autoCall}
        historyIndex={historyIndex}
        canGoPrevious={historyIndex > 0}
        canGoNext={baseLeads.length > 1}
        isLeadPendingCall={isLeadPendingCall}
        onCall={() => makeCall(currentLead)}
        onResetCallCount={() => resetCallCount(currentLead)}
        onToggleTimezone={toggleTimezoneFilter}
        onToggleCallFilter={toggleCallFilter}
        onResetAllCalls={resetAllCallCounts}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToggleShuffle={toggleShuffle}
        onToggleAutoCall={toggleAutoCall}
      />
    </div>
  );
};

export default CallingScreen;
