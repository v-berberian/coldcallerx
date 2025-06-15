
import React, { useState } from 'react';
import { Lead } from '../types/lead';
import SearchAutocomplete from './SearchAutocomplete';
import SearchBar from './SearchBar';
import CSVImporter from './CSVImporter';

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
  const [isAutocompleteVisible, setIsAutocompleteVisible] = useState(showAutocomplete);

  React.useEffect(() => {
    if (showAutocomplete) {
      setIsAutocompleteVisible(true);
    } else {
      // Delay hiding to allow slide-up animation
      const timer = setTimeout(() => {
        setIsAutocompleteVisible(false);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [showAutocomplete]);

  return (
    <div className="bg-background border-b border-border p-3 sm:p-4 pt-safe flex-shrink-0 w-full" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
      <div className="flex items-center justify-between mb-3 sm:mb-4 w-full">
        <div className="min-w-0 flex-shrink-0">
          <CSVImporter onLeadsImported={onLeadsImported} />
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 justify-center min-w-0">
          <img 
            src="/lovable-uploads/664ca8e4-0033-4faf-9c3d-9b585dc1de97.png" 
            alt="Cold Caller X" 
            className="h-6 sm:h-8 w-auto object-contain"
          />
        </div>
        
        <div className="w-8 sm:w-8 flex-shrink-0"></div>
      </div>
      
      {/* Search Bar */}
      <div className="relative w-full">
        <SearchBar 
          searchQuery={searchQuery} 
          onSearchChange={onSearchChange} 
          onSearchFocus={onSearchFocus} 
          onSearchBlur={onSearchBlur} 
          onClearSearch={onClearSearch} 
          fileName={fileName} 
        />
        
        {/* Autocomplete Dropdown */}
        <SearchAutocomplete 
          leads={searchResults} 
          onLeadSelect={onLeadSelect} 
          searchQuery={searchQuery} 
          actualIndices={searchResults.map(lead => 
            leadsData.findIndex(l => l.name === lead.name && l.phone === lead.phone) + 1
          )} 
          totalLeads={leadsData.length}
          isVisible={showAutocomplete}
        />
      </div>
    </div>
  );
};

export default CallingHeader;
