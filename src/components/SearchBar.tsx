
import React from 'react';
import { Search } from 'lucide-react';
import SearchAutocomplete from '@/components/SearchAutocomplete';

interface Lead {
  name: string;
  phone: string;
  called?: number;
}

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchResults: Lead[];
  onLeadSelect: (lead: Lead) => void;
  actualIndices: number[];
  totalLeads: number;
  showResults: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  searchResults,
  onLeadSelect,
  actualIndices,
  totalLeads,
  showResults
}) => {
  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search leads..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
        />
      </div>
      
      {showResults && (
        <SearchAutocomplete
          leads={searchResults}
          onLeadSelect={onLeadSelect}
          searchQuery={searchQuery}
          actualIndices={actualIndices}
          totalLeads={totalLeads}
        />
      )}
    </div>
  );
};

export default SearchBar;
