import React, { useState, useRef } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Lead } from '../types/lead';
import SearchAutocomplete from './SearchAutocomplete';
import SearchBar, { SearchBarRef } from './SearchBar';
import CSVFileSelector from './CSVFileSelector';
import SettingsMenu from './SettingsMenu';

interface CallingHeaderProps {
  searchQuery: string;
  showAutocomplete: boolean;
  searchResults: Lead[];
  allSearchResults?: Lead[];
  leadsData: Lead[];
  fileName: string;
  onSearchChange: (query: string) => void;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  onClearSearch: () => void;
  onLeadSelect: (lead: Lead) => void;
  onLeadsImported: (leads: Lead[], fileName: string, csvId: string) => void;
  onCSVSelect?: (csvId: string, leads: Lead[], fileName: string) => void;
  currentCSVId?: string | null;
  refreshTrigger?: number;
  loadMoreResults?: () => void;
  loadedResultsCount?: number;
  totalResultsCount?: number;
  onCloseAutocomplete?: () => void;
  onAllListsDeleted?: () => void;
}

const CallingHeader: React.FC<CallingHeaderProps> = ({
  searchQuery,
  showAutocomplete,
  searchResults,
  allSearchResults,
  leadsData,
  fileName,
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
  onClearSearch,
  onLeadSelect,
  onLeadsImported,
  onCSVSelect,
  currentCSVId,
  refreshTrigger = 0,
  loadMoreResults,
  loadedResultsCount,
  totalResultsCount,
  onCloseAutocomplete,
  onAllListsDeleted
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

    setIsFullscreen(!isFullscreen);
    // Keep the autocomplete visible when toggling fullscreen
    // The autocomplete will automatically adjust its height based on isFullscreen prop
  };

  return (
    <div className="relative bg-background border-b border-border p-3 sm:p-4 pt-safe flex-shrink-0 w-full" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
      <div className="flex items-center justify-between mb-3 sm:mb-4 w-full">
        <div className="min-w-0 flex-shrink-0">
          <CSVFileSelector 
            onCSVSelect={onCSVSelect || ((csvId: string, leads: Lead[], fileName: string) => {
              // Fallback: treat as import if onCSVSelect is not provided
              onLeadsImported(leads, fileName, csvId);
            })}
            refreshTrigger={refreshTrigger}
            currentCSVId={currentCSVId}
            onLeadsImported={onLeadsImported}
            onAllListsDeleted={onAllListsDeleted}
          />
        </div>
        
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-2 sm:space-x-3 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold truncate dark:text-white text-black bg-gradient-to-r from-[#6EC6F1] to-[#6EC6F1]/90 bg-clip-text text-transparent dark:bg-none dark:text-white">
            ColdCall X
          </h1>
        </div>
        
        <div className="flex-shrink-0">
          <SettingsMenu>
            {(isOpen) => (
              <Button 
                variant="ghost" 
                size="icon" 
                className={`no-hover h-8 w-8 text-base focus:bg-transparent active:bg-transparent transition-all duration-300 ease-out rounded-lg ${
                  isOpen 
                    ? 'text-muted-foreground shadow-[inset_0_2px_4px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.1)] bg-gray-100/50 dark:bg-gray-800/50' 
                    : 'text-muted-foreground'
                }`}
              >
                <Settings 
                  className={`h-5 w-5 transition-all duration-300 ease-out ${
                    isOpen ? 'scale-95' : 'scale-100'
                  }`}
                  style={{
                    filter: isOpen ? 'drop-shadow(inset 0 1px 2px rgba(0,0,0,0.3))' : 'none',
                    color: 'inherit'
                  }}
                />
              </Button>
            )}
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
          onCloseAutocomplete={onCloseAutocomplete}
          onFilterClick={() => {
            // TODO: Implement filter functionality
            console.log('Filter button clicked');
          }}
          onFilterSelect={(filter) => {
            console.log('Filter selected:', filter);
            // TODO: Implement filter selection logic
          }}
        />
        
        {/* Autocomplete Dropdown */}
        <SearchAutocomplete 
          isVisible={showAutocomplete}
          isFullscreen={isFullscreen}
          loadMoreResults={loadMoreResults}
          loadedResultsCount={loadedResultsCount}
          totalResultsCount={totalResultsCount}
          searchResults={searchResults}
          allSearchResults={allSearchResults}
          onLeadSelect={onLeadSelect}
          leadsData={leadsData}
          onAnimationComplete={() => {
            onCloseAutocomplete?.();
          }}
          onCloseAutocomplete={onCloseAutocomplete}
        />
      </div>
    </div>
  );
};

export default CallingHeader;
