import React, { memo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import CallingHeader from './CallingHeader';
import MainContent from './MainContent';
import { Lead } from '../types/lead';
import { useLocalCallingScreenState } from '../hooks/useLocalCallingScreenState';
import { useSimplifiedCallingScreenEffects } from '../hooks/useSimplifiedCallingScreenEffects';
import { useCallingScreenActions } from './CallingScreenActions';
import { useLocalLeadOperations } from '../hooks/useLocalLeadOperations';
import { appStorage } from '../utils/storage';

interface CallingScreenContainerProps {
  leads: Lead[];
  fileName: string;
  onBack: () => void;
  onLeadsImported: (leads: Lead[], fileName: string, csvId: string) => void;
  currentCSVId: string | null;
  onCSVSelect: (csvId: string, leads: Lead[], fileName: string) => void;
  onAllListsDeleted?: () => void;
  refreshTrigger?: number;
}

const CallingScreenContainer: React.FC<CallingScreenContainerProps> = memo(({
  leads,
  fileName,
  onBack,
  onLeadsImported,
  currentCSVId,
  onCSVSelect,
  onAllListsDeleted,
  refreshTrigger: externalRefreshTrigger = 0
}) => {
  const { importLeadsFromCSV, updateLeadCallCount, resetCallCount, resetAllCallCounts } = useLocalLeadOperations();
  const [isCommenting, setIsCommenting] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  
  const {
    componentReady,
    setComponentReady,
    leadsInitialized,
    setLeadsInitialized,
    leadsData,
    currentIndex,
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
    isFilterChanging,
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
    memoizedResetLeadsData,
    updateLeadsDataDirectly,
    searchQuery,
    setSearchQuery,
    searchResults,
    allSearchResults,
    loadedResultsCount,
    loadMoreResults,
    showAutocomplete,
    setShowAutocomplete,
    clearSearch,
    handleSearchFocus,
    handleSearchBlur,
    closeAutocomplete,
    getDelayDisplayType,
    isLoaded
  } = useLocalCallingScreenState({ leads, onCallMade: undefined, refreshTrigger: externalRefreshTrigger });

  // Handle commenting state from MainContent
  const handleCommentingChange = (commenting: boolean) => {
    setIsCommenting(commenting);
  };

  const handleCommentModalOpenChange = (open: boolean) => {
    setIsCommentModalOpen(open);
  };

  useSimplifiedCallingScreenEffects({
    componentReady,
    setComponentReady,
    leadsInitialized,
    setLeadsInitialized,
    leads,
    leadsData,
    memoizedResetLeadsData,
    currentIndex,
    autoCall,
    callDelay,
    shouldAutoCall,
    setShouldAutoCall,
    setCurrentLeadForAutoCall,
    executeAutoCall,
    getBaseLeads,
    isFilterChanging
  });

  // Handle leads data updates without navigation reset
  const handleLeadsDataUpdate = (updatedLeads: Lead[]) => {
    updateLeadsDataDirectly(updatedLeads);
  };

  // Store the resetSwipe function for navigation handlers
  const [resetSwipe, setResetSwipe] = useState<(() => void) | null>(null);

  // Handle full leads data reset (for CSV import)
  const handleLeadsDataReset = (updatedLeads: Lead[]) => {
    memoizedResetLeadsData(updatedLeads);
  };

  const {
    handleLeadSelect,
    handleCallClick,
    handleNextWrapper,
    handlePreviousWrapper,
    handleResetCallCount,
    handleResetAllCallCounts
  } = useCallingScreenActions({
    getBaseLeads,
    currentIndex,
    makeCall,
    handleNext,
    handlePrevious,
    selectLead,
    leadsData,
    setSearchQuery,
    setShowAutocomplete,
    updateLeadCallCount: updateLeadCallCount,
    resetCallCount: resetCallCount,
    resetAllCallCounts: resetAllCallCounts,
    onLeadsDataUpdate: handleLeadsDataUpdate,
    resetSwipe
  });

  // Handle CSV import locally
  const handleLeadsImported = async (newLeads: Lead[], newFileName: string, csvId: string) => {
    const success = await importLeadsFromCSV(newLeads, newFileName, csvId);
    if (success) {
      onLeadsImported(newLeads, newFileName, csvId);
    }
  };

  // Handle CSV selection
  const handleCSVSelect = (csvId: string, newLeads: Lead[], newFileName: string) => {
    // For CSV switching, update leads data directly without resetting navigation
    // This preserves the lastCalled status from storage
    updateLeadsDataDirectly(newLeads);
    onCSVSelect(csvId, newLeads, newFileName);
  };

  // Handle swipe reset callback to pass to navigation handlers
  const handleSwipeReset = (resetFn: () => void) => {
    setResetSwipe(() => resetFn);
  };

  // Handle lead deletion
  const handleDeleteLead = async (lead: Lead) => {
    if (!currentCSVId) {
      console.error('No current CSV ID available for lead deletion');
      return;
    }

    // Store the current lead info before deletion for navigation logic
    const currentLeads = getBaseLeads();
    const wasCurrentLead = currentLeads[currentIndex] && 
      currentLeads[currentIndex].name === lead.name && 
      currentLeads[currentIndex].phone === lead.phone;

    try {
      // Remove lead from CSV storage
      const success = await appStorage.removeLeadFromCSV(currentCSVId, lead);
      
      if (success) {
        // Get updated leads data from storage
        const updatedLeads = await appStorage.getCSVLeadsData(currentCSVId);
        
        // Update local state
        updateLeadsDataDirectly(updatedLeads);
        
        // Clear search and close autocomplete to refresh search results
        clearSearch();
        closeAutocomplete();
        
        // Force refresh of search state by temporarily clearing search results
        setShowAutocomplete(false);
        
        // Check if this was the last lead in the CSV
        if (updatedLeads.length === 0) {
          // Remove the empty CSV file from storage
          try {
            await appStorage.removeAllCSVData(currentCSVId);
          } catch (error) {
            console.error('Error removing empty CSV file:', error);
          }
          
          // No leads remain, trigger the all lists deleted callback
          if (onAllListsDeleted) {
            onAllListsDeleted();
          }
          return;
        }
        
        // If we deleted the current lead, navigate to the next available lead
        if (wasCurrentLead && updatedLeads.length > 0) {
          // Adjust currentIndex to show the correct "next" lead after deletion
          // If we were at index N and deleted that lead, the lead that was at N+1 is now at N
          // So we want to stay at the same index to show what was the "next" lead
          const adjustedIndex = Math.min(currentIndex, updatedLeads.length - 1);
          
          // Add a small delay to ensure the UI has updated
          setTimeout(() => {
            // Instead of calling handleNextWrapper (which would skip a lead),
            // directly navigate to the adjusted index to show the correct next lead
            if (adjustedIndex < updatedLeads.length) {
              // This will show the lead that was immediately after the deleted one
              const currentLeads = getBaseLeads();
              if (currentLeads.length > 0) {
                handleNext(currentLeads);
              }
            }
          }, 100);
        }
      } else {
        console.error('Failed to remove lead from CSV');
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  };

  // Add: Wait for navigation state to be loaded
  if (!componentReady || !leadsInitialized || !isLoaded) {
    return (
      <div className="h-[100dvh] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading caller...</p>
        </div>
      </div>
    );
  }

  const currentLeads = getBaseLeads();
  // Clamp currentIndex to valid range for filtered leads
  const safeCurrentIndex = Math.max(0, Math.min(currentIndex, currentLeads.length - 1));
  const currentLead = currentLeads[safeCurrentIndex];

  // If no leads remain after deletion, trigger the all lists deleted callback
  if (currentLeads.length === 0 && leadsData.length === 0 && onAllListsDeleted) {
    onAllListsDeleted();
    return null; // Return null to prevent rendering with undefined currentLead
  }

  if (leadsData.length === 0) {
    return (
      <div className="h-[100dvh] overflow-hidden fixed inset-0">
        <div className="border-b border-border p-4">
          <CallingHeader
            searchQuery={searchQuery}
            showAutocomplete={showAutocomplete}
            searchResults={searchResults}
            allSearchResults={allSearchResults}
            leadsData={leadsData}
            fileName={fileName}
            onSearchChange={setSearchQuery}
            onSearchFocus={handleSearchFocus}
            onSearchBlur={handleSearchBlur}
            onClearSearch={clearSearch}
            onLeadSelect={handleLeadSelect}
            onLeadsImported={handleLeadsImported}
            onCSVSelect={handleCSVSelect}
            currentCSVId={currentCSVId}
            refreshTrigger={externalRefreshTrigger}
            loadMoreResults={loadMoreResults}
            loadedResultsCount={loadedResultsCount}
            totalResultsCount={allSearchResults?.length || 0}
            onCloseAutocomplete={closeAutocomplete}
            onAllListsDeleted={onAllListsDeleted}
          />
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h2 className="text-xl font-semibold text-foreground">No leads loaded</h2>
            <p className="text-muted-foreground">Import a CSV file to get started</p>
          </div>
        </div>
      </div>
    );
  }

  const totalLeadCount = currentLeads.length;

  // Safety check: if currentLead is undefined, we shouldn't render the main content
  if (!currentLead) {
    return (
      <div className="h-[100dvh] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading caller...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden fixed inset-0">
      {/* Header */}
      <div className={`transition-all duration-300 ease-out ${isCommenting && !isCommentModalOpen ? 'opacity-0 scale-95 -translate-y-2 pointer-events-none' : ''}`}>
        <CallingHeader
          searchQuery={searchQuery}
          showAutocomplete={showAutocomplete}
          searchResults={searchResults}
          allSearchResults={allSearchResults}
          leadsData={leadsData}
          fileName={fileName}
          onSearchChange={setSearchQuery}
          onSearchFocus={handleSearchFocus}
          onSearchBlur={handleSearchBlur}
          onClearSearch={clearSearch}
          onLeadSelect={handleLeadSelect}
          onLeadsImported={handleLeadsImported}
          onCSVSelect={handleCSVSelect}
          currentCSVId={currentCSVId}
          refreshTrigger={externalRefreshTrigger}
          loadMoreResults={loadMoreResults}
          loadedResultsCount={loadedResultsCount}
          totalResultsCount={allSearchResults?.length || 0}
          onCloseAutocomplete={closeAutocomplete}
          onAllListsDeleted={onAllListsDeleted}
        />
      </div>

      {/* Main Content - takes remaining space */}
      <div className="flex-1 overflow-hidden min-h-0">
        <MainContent
          currentLead={currentLead}
          currentIndex={safeCurrentIndex}
          totalCount={totalLeadCount}
          fileName={fileName}
          currentCSVId={currentCSVId}
          timezoneFilter={timezoneFilter}
          callFilter={callFilter}
          shuffleMode={shuffleMode}
          autoCall={autoCall}
          callDelay={callDelay}
          isCountdownActive={isCountdownActive}
          countdownTime={countdownTime}
          showAutocomplete={showAutocomplete}
          onCall={handleCallClick}
          onResetCallCount={() => handleResetCallCount(currentLead)}
          onCSVSelect={handleCSVSelect}
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
          getDelayDisplayType={getDelayDisplayType}
          noLeadsMessage={!currentLead ? "No Leads Found" : undefined}
          refreshTrigger={externalRefreshTrigger}
          onImportNew={() => {
            // Trigger the CSV importer by clicking the import button in the header
            const importButton = document.querySelector('[data-import-csv]') as HTMLElement;
            if (importButton) {
              importButton.click();
            }
          }}
          onSwipeReset={handleSwipeReset}
          onDeleteLead={handleDeleteLead}
          onCommentingChange={handleCommentingChange}
          onCommentModalOpenChange={handleCommentModalOpenChange}
        />
      </div>
    </div>
  );
});

export default CallingScreenContainer;
