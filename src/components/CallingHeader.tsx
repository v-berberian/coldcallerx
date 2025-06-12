
import React from 'react';
import { Lead } from '../types/lead';
import SearchAutocomplete from './SearchAutocomplete';
import SearchBar from './SearchBar';
import CSVImporter from './CSVImporter';
import UserProfile from './UserProfile';
import CloudSyncIndicator from './CloudSyncIndicator';

interface CloudSyncProps {
  isLoading: boolean;
  lastSyncTime?: Date;
}

interface CallingHeaderProps {
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
  cloudSyncProps?: CloudSyncProps;
}

const CallingHeader: React.FC<CallingHeaderProps> = ({
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
  cloudSyncProps
}) => {
  return (
    <div className="bg-background border-b border-border p-4 pt-safe flex-shrink-0" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
      <div className="flex items-center justify-between mb-4">
        <CSVImporter onLeadsImported={onLeadsImported} />
        
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold">
            <span className="text-blue-500">Cold</span>
            <span className="text-foreground">Caller </span>
            <span className="text-blue-500">X</span>
          </h1>
        </div>
        
        <div className="flex items-center space-x-2">
          {cloudSyncProps && (
            <CloudSyncIndicator 
              isLoading={cloudSyncProps.isLoading} 
              lastSyncTime={cloudSyncProps.lastSyncTime} 
            />
          )}
          <UserProfile />
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="relative">
        <SearchBar 
          searchQuery={searchQuery} 
          onSearchChange={onSearchChange} 
          onSearchFocus={onSearchFocus} 
          onSearchBlur={onSearchBlur} 
          onClearSearch={onClearSearch} 
          fileName={fileName} 
        />
        
        {/* Autocomplete Dropdown */}
        {showAutocomplete && (
          <SearchAutocomplete 
            leads={searchResults} 
            onLeadSelect={onLeadSelect} 
            searchQuery={searchQuery} 
            actualIndices={searchResults.map(lead => 
              leadsData.findIndex(l => l.name === lead.name && l.phone === lead.phone) + 1
            )} 
            totalLeads={leadsData.length} 
          />
        )}
      </div>
    </div>
  );
};

export default CallingHeader;
