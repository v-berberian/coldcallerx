
import React from 'react';
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
  const placeholder = "Search by name or phone number";

  return (
    <div className="relative">
      <input 
        type="text" 
        placeholder={placeholder}
        value={searchQuery} 
        onChange={e => onSearchChange(e.target.value)} 
        onFocus={onSearchFocus} 
        onBlur={onSearchBlur} 
        className="w-full px-4 py-2 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 text-center placeholder:text-center caret-white text-white placeholder:text-white/60" 
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)'
        }}
      />
      {searchQuery && (
        <button 
          onClick={onClearSearch} 
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 transition-all duration-200 hover:bg-white/20"
        >
          <X className="h-4 w-4 text-white/80" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
