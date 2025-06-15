
import React from 'react';
import CallingHeader from '../CallingHeader';
import MainContent from '../MainContent';
import { Lead } from '../../types/lead';

interface CallingScreenLayoutProps {
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
  onLeadsImported: (leads: Lead[], fileName: string) => Promise<void>;
  
  // Main content props
  currentLead: Lead;
  currentIndex: number;
  totalCount: number;
  timezoneFilter: 'ALL' | 'EST_CST';
  callFilter: 'ALL' | 'UNCALLED';
  shuffleMode: boolean;
  autoCall: boolean;
  callDelay: number;
  isCountdownActive?: boolean;
  countdownTime?: number;
  onCall: () => void;
  onResetCallCount: () => void;
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
  getDelayDisplayType?: () => 'timer' | 'rocket' | '5s' | '10s';
  noLeadsMessage?: string;
}

const CallingScreenLayout: React.FC<CallingScreenLayoutProps> = ({
  // Header props
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
  
  // Main content props
  currentLead,
  currentIndex,
  totalCount,
  timezoneFilter,
  callFilter,
  shuffleMode,
  autoCall,
  callDelay,
  isCountdownActive,
  countdownTime,
  onCall,
  onResetCallCount,
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
  getDelayDisplayType,
  noLeadsMessage
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
          timezoneFilter={timezoneFilter}
          callFilter={callFilter}
          shuffleMode={shuffleMode}
          autoCall={autoCall}
          callDelay={callDelay}
          isCountdownActive={isCountdownActive}
          countdownTime={countdownTime}
          showAutocomplete={showAutocomplete}
          onCall={onCall}
          onResetCallCount={onResetCallCount}
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
          getDelayDisplayType={getDelayDisplayType}
          noLeadsMessage={noLeadsMessage}
        />
      </div>
    </div>
  );
};

export default CallingScreenLayout;
