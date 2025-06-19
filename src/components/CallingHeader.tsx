import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Lead } from '../types/lead';
import SearchAutocomplete from './SearchAutocomplete';
import SearchBar from './SearchBar';
import CSVImporter from './CSVImporter';
import SettingsMenu from './SettingsMenu';

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
  loadMoreResults?: () => void;
  loadedResultsCount?: number;
  totalResultsCount?: number;
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
  loadMoreResults,
  loadedResultsCount,
  totalResultsCount
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
          <h1 className="text-xl sm:text-2xl font-bold truncate">
            <span style={{ color: '#6EC6F1' }}>ColdCall </span>
            <span style={{ color: '#6EC6F1' }}>X</span>
          </h1>
        </div>
        
        <div className="flex-shrink-0">
          <SettingsMenu>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-base hover:bg-transparent focus:bg-transparent active:bg-transparent">
              <Settings className="h-5 w-5" />
            </Button>
          </SettingsMenu>
        </div>
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
          isVisible={showAutocomplete}
          loadMoreResults={loadMoreResults}
          loadedResultsCount={loadedResultsCount}
          totalResultsCount={totalResultsCount}
          searchResults={searchResults}
          onLeadSelect={onLeadSelect}
          leadsData={leadsData}
        >
          <div className="max-h-60 overflow-y-auto">
            {searchResults.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No leads found
              </div>
            ) : (
              searchResults.map((lead, index) => (
                <button
                  key={`${lead.name}-${lead.phone}-${index}`}
                  onClick={() => onLeadSelect(lead)}
                  className="w-full px-4 py-3 text-left border-b border-border/10 last:border-b-0 transition-colors duration-75 cursor-default hover:bg-muted/50"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{lead.name}</p>
                      {lead.company && (
                        <p className="text-xs text-muted-foreground truncate">{lead.company}</p>
                      )}
                      <p className="text-sm text-muted-foreground">{lead.phone}</p>
                    </div>
                    <div className="ml-2 text-xs text-muted-foreground">
                      {leadsData.findIndex(l => l.name === lead.name && l.phone === lead.phone) + 1}/{leadsData.length}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </SearchAutocomplete>
      </div>
    </div>
  );
};

export default CallingHeader;
