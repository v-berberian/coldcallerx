
import React from 'react';
import { X } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  onClear: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
  onClear
}) => {
  return (
    <div className="relative">
      <input 
        type="text" 
        placeholder="Search leads by name or phone number" 
        value={searchQuery} 
        onChange={e => onSearchChange(e.target.value)} 
        onFocus={onSearchFocus} 
        onBlur={onSearchBlur} 
        className="w-full px-4 py-2 bg-muted/30 rounded-xl border border-input text-center placeholder:text-center caret-transparent" 
      />
      {searchQuery && (
        <button onClick={onClear} className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
