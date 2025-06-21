import React, { useState, useRef } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Lead } from '../types/lead';
import SearchAutocomplete from './SearchAutocomplete';
import SearchBar, { SearchBarRef } from './SearchBar';
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
  onCloseAutocomplete?: () => void;
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
  totalResultsCount,
  onCloseAutocomplete
}) => {
  const [isAutocompleteVisible, setIsAutocompleteVisible] = useState(showAutocomplete);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const searchBarRef = useRef<SearchBarRef>(null);

  React.useEffect(() => {
    if (showAutocomplete) {
      setIsAutocompleteVisible(true);
    } else {
      // Reset fullscreen state when autocomplete closes
      setIsFullscreen(false);
      // Delay hiding to allow slide-up animation
      const timer = setTimeout(() => {
        setIsAutocompleteVisible(false);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [showAutocomplete]);

  const handleToggleFullscreen = () => {
    console.log('CallingHeader: handleToggleFullscreen called, current isFullscreen:', isFullscreen);
    setIsFullscreen(!isFullscreen);
    console.log('CallingHeader: isFullscreen will be set to:', !isFullscreen);
    // Keep the autocomplete visible when toggling fullscreen
    
    // When transitioning from fullscreen to normal, keep it open
  };

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
          onToggleFullscreen={handleToggleFullscreen}
          isFullscreen={isFullscreen}
          fileName={fileName} 
          ref={searchBarRef}
        />
        
        {/* Autocomplete Dropdown */}
        {(() => {
          console.log('CallingHeader: Rendering SearchAutocomplete', { showAutocomplete, isFullscreen, searchResultsLength: searchResults.length });
          return (
            <SearchAutocomplete 
              isVisible={showAutocomplete}
              isFullscreen={isFullscreen}
              loadMoreResults={loadMoreResults}
              loadedResultsCount={loadedResultsCount}
              totalResultsCount={totalResultsCount}
              searchResults={searchResults}
              onLeadSelect={onLeadSelect}
              leadsData={leadsData}
              onAnimationComplete={() => {
                onCloseAutocomplete?.();
              }}
              onCloseAutocomplete={onCloseAutocomplete}
            />
          );
        })()}
      </div>
    </div>
  );
};

export default CallingHeader;
