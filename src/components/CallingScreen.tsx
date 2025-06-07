import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import SearchAutocomplete from './SearchAutocomplete';
import SearchBar from './SearchBar';
import LeadCard from './LeadCard';
import NavigationControls from './NavigationControls';
import ThemeToggle from './ThemeToggle';
import CSVImporter from './CSVImporter';
import { useLeadSearch } from '@/hooks/useLeadSearch';
import { useLeadNavigation } from '@/hooks/useLeadNavigation';
import { getTimezoneGroup } from '@/utils/timezoneUtils';

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
  const [autoCall, setAutoCall] = useState(false);
  const [timezoneFilter, setTimezoneFilter] = useState<'ALL' | 'EST_CST'>('ALL');
  const [leadsData, setLeadsData] = useState<Lead[]>(leads.map(lead => ({
    ...lead,
    called: lead.called || 0,
    lastCalled: lead.lastCalled || undefined
  })));

  // Filter leads by timezone
  const filterLeadsByTimezone = (leads: Lead[]): Lead[] => {
    if (timezoneFilter === 'ALL') return leads;
    return leads.filter(lead => {
      const timezoneGroup = getTimezoneGroup(lead.phone);
      return timezoneGroup === 'EST' || timezoneGroup === 'CST';
    });
  };

  const baseFilteredLeads = filterLeadsByTimezone(leadsData);
  console.log('baseFilteredLeads length:', baseFilteredLeads.length);
  
  // Use search hook with timezone-filtered leads
  const {
    searchQuery,
    setSearchQuery,
    filteredLeads,
    isSearching,
    showAutocomplete,
    clearSearch,
    handleSearchFocus,
    handleSearchBlur
  } = useLeadSearch(baseFilteredLeads);

  console.log('filteredLeads length:', filteredLeads.length);

  // Use navigation hook
  const {
    currentIndex,
    setCurrentIndex,
    handleNext,
    handlePrevious,
    resetNavigation,
    navigateToIndex,
    shuffleMode,
    toggleShuffle,
    canGoPrevious
  } = useLeadNavigation(filteredLeads.length);

  console.log('Current navigation state - currentIndex:', currentIndex, 'filteredLeads.length:', filteredLeads.length);

  // Reset navigation when filtered leads change
  useEffect(() => {
    console.log('Filtered leads changed, resetting navigation');
    resetNavigation();
  }, [filteredLeads.length, resetNavigation]);

  // Update leads data when props change
  useEffect(() => {
    setLeadsData(leads.map(lead => ({
      ...lead,
      called: lead.called || 0,
      lastCalled: lead.lastCalled || undefined
    })));
  }, [leads]);

  const handleCall = () => {
    const currentLead = filteredLeads[currentIndex];
    console.log('handleCall - currentLead:', currentLead);
    if (currentLead) {
      const phoneNumber = currentLead.phone.replace(/\D/g, '');
      window.location.href = `tel:${phoneNumber}`;

      const updatedLeads = leadsData.map(lead => 
        lead.name === currentLead.name && lead.phone === currentLead.phone ? {
          ...lead,
          called: (lead.called || 0) + 1,
          lastCalled: new Date().toLocaleDateString()
        } : lead
      );
      setLeadsData(updatedLeads);
    }
  };

  const handleNextWithAutoCall = () => {
    console.log('handleNextWithAutoCall called');
    const nextIndex = handleNext();
    
    if (autoCall && filteredLeads[nextIndex]) {
      const phoneNumber = filteredLeads[nextIndex].phone.replace(/\D/g, '');
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  const toggleAutoCall = () => {
    setAutoCall(!autoCall);
  };

  const handleLeadSelect = (lead: Lead) => {
    const leadIndex = filteredLeads.findIndex(l => l.name === lead.name && l.phone === lead.phone);
    if (leadIndex !== -1) {
      navigateToIndex(leadIndex);
      clearSearch();
    }
  };

  const toggleTimezoneFilter = () => {
    setTimezoneFilter(timezoneFilter === 'ALL' ? 'EST_CST' : 'ALL');
  };

  const currentLead = filteredLeads[currentIndex];
  console.log('Current lead:', currentLead);

  if (leadsData.length === 0) {
    return (
      <div className="h-screen h-[100vh] h-[100dvh] bg-background overflow-hidden">
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

  // Fixed: Show "No results found" message instead of kicking to empty state
  if (!currentLead && isSearching) {
    return (
      <div className="h-screen h-[100vh] h-[100dvh] bg-background flex flex-col overflow-hidden">
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
          
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchFocus={handleSearchFocus}
            onSearchBlur={handleSearchBlur}
            onClear={clearSearch}
          />
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-lg rounded-2xl">
            <CardContent className="p-8 text-center">
              <p className="text-lg">No results found for "{searchQuery}"</p>
              <Button onClick={clearSearch} className="mt-4 rounded-xl">
                Clear Search
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!currentLead) {
    return (
      <div className="h-screen h-[100vh] h-[100dvh] bg-background flex items-center justify-center p-4 overflow-hidden">
        <Card className="w-full max-w-md shadow-lg rounded-2xl">
          <CardContent className="p-8 text-center">
            <p className="text-lg">No leads found</p>
            <Button onClick={onBack} className="mt-4 rounded-xl">Back to Import</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate the actual index in the original array for display
  const actualLeadIndex = isSearching 
    ? leadsData.findIndex(lead => lead.name === currentLead.name && lead.phone === currentLead.phone) + 1
    : currentIndex + 1;

  const totalLeadCount = baseFilteredLeads.length;

  return (
    <div className="h-screen h-[100vh] h-[100dvh] bg-background flex flex-col overflow-hidden">
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
        
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchFocus={handleSearchFocus}
          onSearchBlur={handleSearchBlur}
          onClear={clearSearch}
        />
        
        {/* Autocomplete Dropdown */}
        {showAutocomplete && (
          <SearchAutocomplete 
            leads={searchQuery ? filteredLeads : baseFilteredLeads} 
            onLeadSelect={handleLeadSelect} 
            searchQuery={searchQuery}
            actualIndices={(searchQuery ? filteredLeads : baseFilteredLeads).map(lead => 
              leadsData.findIndex(l => l.name === lead.name && l.phone === lead.phone) + 1
            )}
            totalLeads={leadsData.length}
          />
        )}
      </div>

      {/* Main Content - Centered properly for PWA */}
      <div className="flex-1 flex items-center justify-center p-4 min-h-0 px-6">
        <div className="w-full max-w-sm space-y-6 relative">
          {/* Timezone filter button - positioned to the left of the card */}
          <button
            onClick={toggleTimezoneFilter}
            className="absolute -left-16 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 -rotate-90 whitespace-nowrap"
          >
            {timezoneFilter === 'ALL' ? 'All States' : 'EST & CST'}
          </button>

          <LeadCard
            lead={currentLead}
            currentIndex={actualLeadIndex - 1}
            totalCount={totalLeadCount}
            fileName={fileName}
            onCall={handleCall}
          />

          <NavigationControls
            onPrevious={handlePrevious}
            onNext={handleNextWithAutoCall}
            onToggleShuffle={toggleShuffle}
            onToggleAutoCall={toggleAutoCall}
            canGoPrevious={canGoPrevious}
            canGoNext={filteredLeads.length > 1}
            shuffleMode={shuffleMode}
            autoCall={autoCall}
          />
        </div>
      </div>
    </div>
  );
};

export default CallingScreen;
