import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import SearchAutocomplete from './SearchAutocomplete';
import SearchBar from './SearchBar';
import ThemeToggle from './ThemeToggle';
import CSVImporter from './CSVImporter';
import LeadCard from './LeadCard';
import FilterButtons from './FilterButtons';
import NavigationControls from './NavigationControls';
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
      const baseLeads = getBaseLeads();
      const currentLead = baseLeads[currentIndex];
      
      if (currentLead) {
        console.log('Auto-call triggered for displayed lead:', currentLead.name, currentLead.phone);
        executeAutoCall(currentLead);
      }
      
      setShouldAutoCall(false);
    }
  }, [shouldAutoCall, autoCall, currentIndex, cardKey]);

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

  const totalLeadCount = baseLeads.length;
  
  return (
    <div className="h-screen h-[100vh] h-[100svh] bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-background border-b border-border p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <CSVImporter onLeadsImported={onLeadsImported} />
          
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold">
              <span className="text-blue-500">Cold</span>
              <span className="text-foreground">Caller </span>
              <span className="text-blue-500">X</span>
            </h1>
          </div>
          
          <ThemeToggle />
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <SearchBar 
            searchQuery={searchQuery} 
            onSearchChange={setSearchQuery} 
            onSearchFocus={handleSearchFocus} 
            onSearchBlur={handleSearchBlur} 
            onClearSearch={clearSearch} 
            fileName={fileName} 
          />
          
          {/* Autocomplete Dropdown */}
          {showAutocomplete && (
            <SearchAutocomplete 
              leads={searchResults} 
              onLeadSelect={handleLeadSelect} 
              searchQuery={searchQuery} 
              actualIndices={searchResults.map(lead => 
                leadsData.findIndex(l => l.name === lead.name && l.phone === lead.phone) + 1
              )} 
              totalLeads={leadsData.length} 
            />
          )}
        </div>
      </div>

      {/* Main Content with consistent spacing */}
      <div className="flex-1 flex items-start justify-center pt-3 p-4 min-h-0 px-6">
        <div className="w-full max-w-sm space-y-2">
          {/* Filter Buttons */}
          <FilterButtons
            timezoneFilter={timezoneFilter}
            callFilter={callFilter}
            shuffleMode={shuffleMode}
            autoCall={autoCall}
            onToggleTimezone={toggleTimezoneFilter}
            onToggleCallFilter={toggleCallFilter}
            onToggleShuffle={toggleShuffle}
            onToggleAutoCall={toggleAutoCall}
            onResetAllCalls={resetAllCallCounts}
          />

          {/* Current Lead Card */}
          <LeadCard
            lead={currentLead}
            currentIndex={currentIndex}
            totalCount={totalLeadCount}
            fileName={fileName}
            cardKey={cardKey}
            onCall={() => makeCall(currentLead)}
            onResetCallCount={() => resetCallCount(currentLead)}
          />

          {/* Navigation Controls */}
          <div className="pt-2">
            <NavigationControls
              onPrevious={handlePrevious}
              onNext={handleNext}
              canGoPrevious={historyIndex > 0}
              canGoNext={baseLeads.length > 1}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallingScreen;
