
import React from 'react';
import { Lead } from '../types/lead';
import CallingHeader from './CallingHeader';
import MainContent from './MainContent';

interface CallingScreenMainProps {
  currentLead: Lead;
  currentIndex: number;
  totalCount: number;
  fileName: string;
  cardKey: number;
  timezoneFilter: 'ALL' | 'EST_CST';
  callFilter: 'ALL' | 'UNCALLED';
  shuffleMode: boolean;
  autoCall: boolean;
  callDelay: number;
  isCountdownActive: boolean;
  countdownTime: number;
  searchQuery: string;
  showAutocomplete: boolean;
  searchResults: Lead[];
  leadsData: Lead[];
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
  onSearchChange: (query: string) => void;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  onClearSearch: () => void;
  onLeadSelect: (lead: Lead) => void;
  onLeadsImported: (leads: Lead[], fileName: string) => void;
  getDelayDisplayType: () => 'timer' | 'rocket' | '5s' | '10s';
}

const CallingScreenMain: React.FC<CallingScreenMainProps> = ({
  currentLead,
  currentIndex,
  totalCount,
  fileName,
  cardKey,
  timezoneFilter,
  callFilter,
  shuffleMode,
  autoCall,
  callDelay,
  isCountdownActive,
  countdownTime,
  searchQuery,
  showAutocomplete,
  searchResults,
  leadsData,
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
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
  onClearSearch,
  onLeadSelect,
  onLeadsImported,
  getDelayDisplayType
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

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <MainContent
          currentLead={currentLead}
          currentIndex={currentIndex}
          totalCount={totalCount}
          fileName={fileName}
          cardKey={cardKey}
          timezoneFilter={timezoneFilter}
          callFilter={callFilter}
          shuffleMode={shuffleMode}
          autoCall={autoCall}
          callDelay={callDelay}
          isCountdownActive={isCountdownActive}
          countdownTime={countdownTime}
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
        />
      </div>
    </div>
  );
};

export default CallingScreenMain;
