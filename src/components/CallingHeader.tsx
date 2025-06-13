
import React, { useState } from 'react';
import { Lead } from '../types/lead';
import SearchBar from './SearchBar';
import ThemeToggle from './ThemeToggle';
import CSVImporter from './CSVImporter';
import DraggableSearch from './DraggableSearch';

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
  onLeadsImported
}) => {
  const [showDraggableSearch, setShowDraggableSearch] = useState(false);

  const handleSearchFocus = () => {
    setShowDraggableSearch(true);
    onSearchFocus();
  };

  const handleCloseDraggableSearch = () => {
    setShowDraggableSearch(false);
    onClearSearch();
  };

  return (
    <>
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
          
          <ThemeToggle />
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <SearchBar 
            searchQuery={searchQuery} 
            onSearchChange={onSearchChange} 
            onSearchFocus={handleSearchFocus} 
            onSearchBlur={onSearchBlur} 
            onClearSearch={onClearSearch} 
            fileName={fileName} 
          />
        </div>
      </div>

      {/* Draggable Search Modal */}
      {showDraggableSearch && (
        <DraggableSearch
          searchQuery={searchQuery}
          searchResults={searchResults}
          leadsData={leadsData}
          fileName={fileName}
          onSearchChange={onSearchChange}
          onLeadSelect={(lead) => {
            onLeadSelect(lead);
            setShowDraggableSearch(false);
          }}
          onClose={handleCloseDraggableSearch}
        />
      )}
    </>
  );
};

export default CallingHeader;
