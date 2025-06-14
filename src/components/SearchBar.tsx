
import React, { useState, useEffect } from 'react';
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
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  
  const fullPlaceholder = "Search by name or phone number";

  // Typewriter effect for placeholder
  useEffect(() => {
    if (isFocused || searchQuery) {
      setDisplayedPlaceholder('');
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    let currentIndex = 0;
    setDisplayedPlaceholder('');

    const typeInterval = setInterval(() => {
      if (currentIndex < fullPlaceholder.length) {
        setDisplayedPlaceholder(fullPlaceholder.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, 80); // Typing speed - 80ms per character

    return () => clearInterval(typeInterval);
  }, [isFocused, searchQuery]);

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
        placeholder={displayedPlaceholder}
        value={searchQuery} 
        onChange={e => onSearchChange(e.target.value)} 
        onFocus={handleFocus} 
        onBlur={handleBlur} 
        className={`w-full px-4 py-2 bg-muted/30 rounded-xl border border-input text-center placeholder:text-center ${
          isTyping ? 'caret-transparent' : ''
        }`}
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
