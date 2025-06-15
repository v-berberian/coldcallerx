
import React from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SearchAutocomplete from './SearchAutocomplete';
import CSVImporter from './CSVImporter';
import { Lead } from '../types/lead';

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
  return (
    <div className="bg-background border-b border-border p-4" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <CSVImporter onLeadsImported={onLeadsImported} />
          <h1 className="text-xl font-bold">
            <span className="text-blue-500">ColdCall </span>
            <span className="text-blue-500">X</span>
          </h1>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {fileName}
        </div>
      </div>

      {/* Search Bar with Autocomplete */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={onSearchFocus}
            onBlur={onSearchBlur}
            className="pl-10 pr-10 rounded-xl"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted rounded-full"
            >
              ×
            </Button>
          )}
        </div>

        {/* Autocomplete Results */}
        {showAutocomplete && searchResults.length > 0 && (
          <SearchAutocomplete
            results={searchResults}
            onLeadSelect={onLeadSelect}
            leadsData={leadsData}
          />
        )}
      </div>
    </div>
  );
};

export default CallingHeader;
