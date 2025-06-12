import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import CallingHeader from './CallingHeader';
import MainContent from './MainContent';
import DailyProgress from './DailyProgress';
import ListSelector from './ListSelector';
import { useSearchState } from './SearchState';
import { useDailyCallState } from './DailyCallState';
import { useLeadNavigation } from '../hooks/useLeadNavigation';
import { useSupabaseLeads } from '../hooks/useSupabaseLeads';
import { useAuth } from '@/hooks/useAuth';
import { Lead } from '../types/lead';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  
  const {
    leadLists,
    currentListId,
    leadsData,
    loading,
    createLeadList,
    updateLeadCallStatus,
    switchToList,
    getCurrentListName,
    refreshLists,
    deleteLeadList
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

  // Handle CSV imports from props (legacy support for non-authenticated users)
  useEffect(() => {
    if (leads.length > 0 && fileName && !user) {
      // For non-authenticated users, use the legacy local storage approach
      console.log('Legacy CSV import for non-authenticated user');
      resetLeadsData(leads);
    }
  }, [leads, fileName, user]);

  // Simplified import handler for authenticated users
  const handleLeadsImported = async (importedLeads: Lead[], importedFileName: string) => {
    if (!user?.id) {
      console.error('No authenticated user found for import');
      toast({
        title: "Authentication Required",
        description: "Please log in to import lead lists",
        variant: "destructive",
      });
      return;
    }

    console.log('Creating lead list for user:', user.id, 'with', importedLeads.length, 'leads');
    
    try {
      const listId = await createLeadList(importedFileName, importedLeads);
      if (listId) {
        console.log('Lead list created successfully:', listId);
        toast({
          title: "Success",
          description: `Lead list "${importedFileName}" imported successfully`,
        });
      } else {
        console.error('Failed to create lead list - no ID returned');
        toast({
          title: "Import Failed",
          description: "Failed to create lead list",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error importing leads:', error);
      toast({
        title: "Import Failed",
        description: "Failed to create lead list. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle call click with server sync
  const handleCallClick = async () => {
    const currentLeads = getBaseLeads();
    const currentLead = currentLeads[currentIndex];
    
    makeCall(currentLead);
    incrementDailyCallCount();
    
    if (user?.id && currentLead) {
      const updatedLead = {
        ...currentLead,
        called: (currentLead.called || 0) + 1,
        lastCalled: new Date().toLocaleString()
      };
      
      await updateLeadCallStatus(updatedLead);
    }
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
        
        if (user?.id) {
          const updatedLead = {
            ...currentLead,
            called: (currentLead.called || 0) + 1,
            lastCalled: new Date().toLocaleString()
          };
          updateLeadCallStatus(updatedLead);
        }
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

  const handleResetCallCount = async () => {
    const currentLeads = getBaseLeads();
    const currentLead = currentLeads[currentIndex];
    
    resetCallCount(currentLead);
    
    if (user?.id && currentLead) {
      const updatedLead = {
        ...currentLead,
        called: 0,
        lastCalled: undefined
      };
      await updateLeadCallStatus(updatedLead);
    }
  };

  const handleListNameClick = () => {
    setShowListSelector(true);
  };

  // Add state for list selector
  const [showListSelector, setShowListSelector] = useState(false);

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

  const currentLeads = getBaseLeads();
  const currentLead = currentLeads[currentIndex];
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
        onDeleteList={deleteLeadList}
      />

      {/* Main Content - takes remaining space */}
      <div className="flex-1 overflow-hidden">
        {currentLead ? (
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
            onListNameClick={handleListNameClick}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-lg rounded-2xl">
              <CardContent className="p-8 text-center">
                <h2 className="text-xl font-semibold mb-4">Ready to Start Calling</h2>
                <p className="text-muted-foreground mb-6">
                  {!user 
                    ? "Please log in to import and manage your lead lists"
                    : leadLists.length === 0 
                      ? "Import your first lead list to get started"
                      : leadsData.length === 0 
                        ? "No leads found with current filters"
                        : "No leads found"
                  }
                </p>
                {user && (leadLists.length === 0 || leadsData.length === 0) ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Use the import options in the header to add leads
                    </p>
                  </div>
                ) : user && leadsData.length === 0 ? (
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
                ) : null}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Daily Progress Bar - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <DailyProgress
          dailyCallCount={dailyCallCount}
          onResetDailyCount={resetDailyCallCount}
        />
      </div>

      {/* List Selector Modal */}
      <ListSelector
        isOpen={showListSelector}
        onClose={() => setShowListSelector(false)}
        leadLists={leadLists}
        currentListId={currentListId}
        onSelectList={switchToList}
        onCreateList={createLeadList}
        onDeleteList={deleteLeadList}
      />
    </div>
  );
};

export default CallingScreenLogic;
