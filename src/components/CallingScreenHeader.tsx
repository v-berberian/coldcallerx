
import React from 'react';
import SearchBar from './SearchBar';
import ThemeToggle from './ThemeToggle';
import CSVImporter from './CSVImporter';
import SearchAutocomplete from './SearchAutocomplete';

interface Lead {
  name: string;
  phone: string;
  called?: number;
  lastCalled?: string;
}

interface CallingScreenHeaderProps {
  fileName: string;
  searchQuery: string;
  showAutocomplete: boolean;
  searchResults: Lead[];
  leadsData: Lead[];
  onLeadsImported: (leads: Lead[], fileName: string) => void;
  onSearchChange: (query: string) => void;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  onClearSearch: () => void;
  onLeadSelect: (lead: Lead) => void;
}

const CallingScreenHeader: React.FC<CallingScreenHeaderProps> = ({
  fileName,
  searchQuery,
  showAutocomplete,
  searchResults,
  leadsData,
  onLeadsImported,
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
  onClearSearch,
  onLeadSelect
}) => {
  return (
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

export default CallingScreenHeader;
