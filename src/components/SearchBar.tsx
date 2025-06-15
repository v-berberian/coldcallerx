
import React, { useState } from 'react';
import { X } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  onClearSearch: () => void;
  fileName: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
  onClearSearch,
  fileName
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const staticPlaceholder = "Search by name or phone number";

  const handleFocus = () => {
    setIsFocused(true);
    onSearchFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onSearchBlur();
  };

  return (
    <div className="relative">
      <input 
        type="text" 
        placeholder={staticPlaceholder}
        value={searchQuery} 
        onChange={e => onSearchChange(e.target.value)} 
        onFocus={handleFocus} 
        onBlur={handleBlur} 
        className="w-full px-4 py-2 bg-card text-card-foreground rounded-xl border border-border placeholder:text-center placeholder:text-muted-foreground text-center focus:border-primary/50 focus:bg-card transition-all duration-200 shadow-sm"
      />
      {searchQuery && (
        <button onClick={onClearSearch} className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
