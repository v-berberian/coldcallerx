import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  onClearSearch: () => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
  fileName: string;
}

export interface SearchBarRef {
  blur: () => void;
  focus: () => void;
}

const SearchBar = forwardRef<SearchBarRef, SearchBarProps>(({
  searchQuery,
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
  onClearSearch,
  onToggleFullscreen,
  isFullscreen,
  fileName
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const staticPlaceholder = "Search and view leads";

  // Expose blur and focus methods
  useImperativeHandle(ref, () => ({
    blur: () => {
      inputRef.current?.blur();
    },
    focus: () => {
      inputRef.current?.focus();
    }
  }));

  const handleFocus = () => {
    setIsFocused(true);
    // Only trigger focus if we're not already showing autocomplete (prevents reset)
    if (!isFullscreen) {
      onSearchFocus();
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Only trigger blur if we're not in fullscreen mode and not transitioning from fullscreen
    // This prevents search results from being reset when shrinking from fullscreen
    if (!isFullscreen) {
      onSearchBlur();
    }
  };

  const handleFullscreenToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isFullscreen) {
      // When shrinking from fullscreen, focus the input to bring back keyboard
      inputRef.current?.focus();
    } else {
      // When expanding to fullscreen, hide keyboard
      inputRef.current?.blur();
    }
    
    // Call the fullscreen toggle function
    onToggleFullscreen?.();
  };

  return (
    <div className="relative search-area" onTouchStart={(e) => e.stopPropagation()} onTouchEnd={(e) => e.stopPropagation()}>
      <input 
        type="text" 
        placeholder={searchQuery ? "" : staticPlaceholder}
        value={searchQuery} 
        onChange={e => onSearchChange(e.target.value)} 
        onFocus={handleFocus} 
        onBlur={handleBlur} 
        className="w-full px-4 py-2 bg-card text-card-foreground rounded-xl border border-border placeholder:text-center placeholder:text-muted-foreground text-center focus:border-primary/50 focus:bg-card shadow-sm"
        ref={inputRef}
      />
      {/* Fullscreen button on the left */}
      {(isFocused || isFullscreen) && (
        <button 
          onClick={handleFullscreenToggle}
          onMouseDown={(e) => e.preventDefault()}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 hover:bg-muted/50 rounded-full p-1 transition-colors"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4 text-muted-foreground" /> : <Maximize2 className="h-4 w-4 text-muted-foreground" />}
        </button>
      )}
      {/* X button on the right */}
      {searchQuery && (
        <button 
          onClick={onClearSearch} 
          className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:bg-muted/50 rounded-full p-1 transition-colors"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );
});

export default SearchBar;
