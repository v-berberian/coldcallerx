
import React from 'react';
import { Lead } from '../types/lead';
import { LeadList } from '../services/leadService';
import CallingHeader from './CallingHeader';
import MainContent from './MainContent';
import DailyProgress from './DailyProgress';

interface CallingScreenContentProps {
  // Header props
  searchQuery: string;
  showAutocomplete: boolean;
  searchResults: Lead[];
  leadsData: Lead[];
  fileName: string;
  onSearchChange: (query: string) => void;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  onClearSearch: () => void;
  onLeadSelect: (lead: Lead) => void;
  onLeadsImported: (leads: Lead[], fileName: string) => void;
  
  // Main content props
  currentLead: Lead;
  currentIndex: number;
  totalCount: number;
  cardKey: number;
  leadLists: LeadList[];
  timezoneFilter: 'ALL' | 'EST_CST';
  callFilter: 'ALL' | 'UNCALLED';
  shuffleMode: boolean;
  autoCall: boolean;
  callDelay: number;
  isCountdownActive: boolean;
  countdownTime: number;
  onCall: () => void;
  onResetCallCount: () => void;
  onLeadListSelect: (leadList: LeadList) => void;
  onLeadListDelete: (leadListId: string) => void;
  onToggleTimezone: () => void;
  onToggleCallFilter: () => void;
  onToggleShuffle: () => void;
  onToggleAutoCall: () => void;
  onToggleCallDelay: () => void;
  onResetCallDelay: () => void;
  onResetAllCalls: () => void;
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  
  // Daily progress props
  dailyCallCount: number;
  onResetDailyCount: () => void;
}

const CallingScreenContent: React.FC<CallingScreenContentProps> = ({
  searchQuery,
  showAutocomplete,
  searchResults,
  leadsData,
  fileName,
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
  onClearSearch,
  onLeadSelect,
  onLeadsImported,
  currentLead,
  currentIndex,
  totalCount,
  cardKey,
  leadLists,
  timezoneFilter,
  callFilter,
  shuffleMode,
  autoCall,
  callDelay,
  isCountdownActive,
  countdownTime,
  onCall,
  onResetCallCount,
  onLeadListSelect,
  onLeadListDelete,
  onToggleTimezone,
  onToggleCallFilter,
  onToggleShuffle,
  onToggleAutoCall,
  onToggleCallDelay,
  onResetCallDelay,
  onResetAllCalls,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  dailyCallCount,
  onResetDailyCount
}) => {
  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden fixed inset-0">
      {/* Header */}
      <CallingHeader
        searchQuery={searchQuery}
        showAutocomplete={showAutocomplete}
        searchResults={searchResults}
        leadsData={leadsData}
        fileName={fileName}
        onSearchChange={onSearchChange}
        onSearchFocus={onSearchFocus}
        onSearchBlur={onSearchBlur}
        onClearSearch={onClearSearch}
        onLeadSelect={onLeadSelect}
        onLeadsImported={onLeadsImported}
      />

      {/* Main Content - takes remaining space */}
      <div className="flex-1 overflow-hidden">
        <MainContent
          currentLead={currentLead}
          currentIndex={currentIndex}
          totalCount={totalCount}
          fileName={fileName}
          cardKey={cardKey}
          leadLists={leadLists}
          timezoneFilter={timezoneFilter}
          callFilter={callFilter}
          shuffleMode={shuffleMode}
          autoCall={autoCall}
          callDelay={callDelay}
          isCountdownActive={isCountdownActive}
          countdownTime={countdownTime}
          onCall={onCall}
          onResetCallCount={onResetCallCount}
          onLeadListSelect={onLeadListSelect}
          onLeadListDelete={onLeadListDelete}
          onToggleTimezone={onToggleTimezone}
          onToggleCallFilter={onToggleCallFilter}
          onToggleShuffle={onToggleShuffle}
          onToggleAutoCall={onToggleAutoCall}
          onToggleCallDelay={onToggleCallDelay}
          onResetCallDelay={onResetCallDelay}
          onResetAllCalls={onResetAllCalls}
          onPrevious={onPrevious}
          onNext={onNext}
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
        />
      </div>

      {/* Daily Progress Bar - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <DailyProgress
          dailyCallCount={dailyCallCount}
          onResetDailyCount={onResetDailyCount}
        />
      </div>
    </div>
  );
};

export default CallingScreenContent;
