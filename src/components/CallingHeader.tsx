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
          <h1 className="text-xl sm:text-2xl font-bold truncate">
            <span className="text-blue-500">ColdCall </span>
            <span className="text-blue-500">X</span>
          </h1>
        </div>
        
        <div className="flex-shrink-0">
          <SettingsMenu>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-base hover:bg-transparent focus:bg-transparent active:bg-transparent">
              <Settings className="h-4 w-4" />
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
