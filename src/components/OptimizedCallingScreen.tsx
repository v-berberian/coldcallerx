
import React, { useState, useCallback, useMemo } from 'react';
import { Lead } from '../types/lead';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Phone, Settings } from 'lucide-react';
import VirtualizedLeadList from './VirtualizedLeadList';
import LeadCard from './LeadCard';
import FilterButtons from './FilterButtons';
import NavigationControls from './NavigationControls';
import { useOptimizedSearch } from '../hooks/useOptimizedSearch';
import { useOptimizedLeadFiltering } from '../hooks/useOptimizedLeadFiltering';
import { useFilters } from '../hooks/useFilters';
import { useNavigationState } from '../hooks/useNavigationState';
import { useLeadsData } from '../hooks/useLeadsData';

interface OptimizedCallingScreenProps {
  leads: Lead[];
  fileName: string;
  onBack: () => void;
  onLeadsImported: (leads: Lead[], fileName: string) => void;
}

const OptimizedCallingScreen: React.FC<OptimizedCallingScreenProps> = ({
  leads,
  fileName,
  onBack,
  onLeadsImported
}) => {
  const [showLeadList, setShowLeadList] = useState(false);

  const {
    leadsData,
    makeCall,
    resetCallCount,
    resetAllCallCounts
  } = useLeadsData(leads);

  const {
    timezoneFilter,
    callFilter,
    shuffleMode,
    autoCall,
    toggleTimezoneFilter,
    toggleCallFilter,
    toggleShuffle,
    toggleAutoCall
  } = useFilters();

  const { getBaseLeads } = useOptimizedLeadFiltering(leadsData, timezoneFilter, callFilter);

  const {
    currentIndex,
    setCurrentIndex,
    updateNavigation
  } = useNavigationState();

  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    showAutocomplete,
    clearSearch,
    handleSearchFocus,
    handleSearchBlur
  } = useOptimizedSearch({ leads: leadsData, getBaseLeads });

  const currentLeads = useMemo(() => getBaseLeads(), [getBaseLeads]);
  const currentLead = currentLeads[currentIndex];

  const handleLeadSelect = useCallback((index: number) => {
    setCurrentIndex(index);
    setShowLeadList(false);
    clearSearch();
  }, [setCurrentIndex, clearSearch]);

  const handleNext = useCallback(() => {
    const nextIndex = Math.min(currentIndex + 1, currentLeads.length - 1);
    setCurrentIndex(nextIndex);
  }, [currentIndex, currentLeads.length, setCurrentIndex]);

  const handlePrevious = useCallback(() => {
    const prevIndex = Math.max(currentIndex - 1, 0);
    setCurrentIndex(prevIndex);
  }, [currentIndex, setCurrentIndex]);

  const handleCallClick = useCallback((phone: string) => {
    if (currentLead) {
      makeCall(currentLead);
    }
  }, [currentLead, makeCall]);

  if (showLeadList) {
    return (
      <div className="h-[100dvh] bg-background flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Button onClick={() => setShowLeadList(false)} variant="ghost">
            Back to Current Lead
          </Button>
          <h1 className="text-lg font-semibold">Lead List ({currentLeads.length})</h1>
          <div className="w-16" />
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              className="pl-10"
            />
          </div>
        </div>

        {/* Virtualized List */}
        <div className="flex-1 overflow-hidden">
          <VirtualizedLeadList
            leads={searchQuery ? searchResults.map(r => r.lead) : currentLeads}
            onLeadSelect={handleLeadSelect}
            currentIndex={currentIndex}
            searchQuery={searchQuery}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button onClick={() => setShowLeadList(true)} variant="outline" size="sm">
          Lead List ({currentLeads.length})
        </Button>
        <h1 className="text-xl font-bold">
          <span style={{ color: '#6EC6F1' }}>ColdCall X</span>
        </h1>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-border">
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
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-auto">
        {currentLead ? (
          <>
            <LeadCard
              lead={currentLead}
              currentIndex={currentIndex}
              totalCount={currentLeads.length}
              fileName={fileName}
              onCall={handleCallClick}
              onResetCallCount={() => resetCallCount(currentLead)}
            />
            
            <NavigationControls
              onPrevious={handlePrevious}
              onNext={handleNext}
              canGoPrevious={currentIndex > 0}
              canGoNext={currentIndex < currentLeads.length - 1}
            />
          </>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-lg text-muted-foreground">No leads found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OptimizedCallingScreen;
