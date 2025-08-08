import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Maximize2, Minimize2, Filter } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  onClearSearch: () => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
  fileName: string;
  onCloseAutocomplete?: () => void;
  onFilterClick?: () => void;
  onFilterSelect?: (filter: string) => void;
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
  fileName,
  onCloseAutocomplete,
  onFilterClick,
  onFilterSelect
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const [isTogglingFullscreen, setIsTogglingFullscreen] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const staticPlaceholder = "Search and View Leads";

  // Expose blur and focus methods
  useImperativeHandle(ref, () => ({
    blur: () => {
      inputRef.current?.blur();
    },
    focus: () => {
      inputRef.current?.focus();
    }
  }));

  // Reset typing state when search query is cleared
  useEffect(() => {
    if (!searchQuery) {
      setHasStartedTyping(false);
    }
  }, [searchQuery]);

  // Handle click outside to close filter dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showFilterDropdown) {
        const target = event.target as Element;
        // Check if click is outside the filter button and dropdown
        if (!target.closest('.filter-dropdown-container')) {
          setShowFilterDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterDropdown]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if the input is focused and we're in collapsed mode (not fullscreen)
      if (isFocused && !isFullscreen && inputRef.current === document.activeElement) {
        // Handle "Done" key on iOS keyboard
        if (event.key === 'Done' || event.key === 'Enter') {
          event.preventDefault();
          // Close autocomplete and blur the input
          if (onCloseAutocomplete) {
            onCloseAutocomplete();
          }
          inputRef.current?.blur();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFocused, isFullscreen, onCloseAutocomplete]);

  const handleFocus = () => {
    // iOS-specific: Add small delay to ensure proper event handling
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      setTimeout(() => {
        setIsFocused(true);
        // Only trigger focus if we're not already showing autocomplete (prevents reset)
        if (!isFullscreen) {
          onSearchFocus();
        }
      }, 10);
    } else {
      setIsFocused(true);
      // Only trigger focus if we're not already showing autocomplete (prevents reset)
      if (!isFullscreen) {
        onSearchFocus();
      }
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    
    // Don't close autocomplete when:
    // 1. We're in fullscreen mode (user might dismiss keyboard but want to keep autocomplete)
    // 2. We're toggling fullscreen (maximize button was clicked)
    // 3. The input is being blurred as part of fullscreen toggle
    // 4. We're clearing the search (X button was clicked)
    if (onCloseAutocomplete && !isTogglingFullscreen && !isFullscreen) {
      onCloseAutocomplete();
    }
    
    // Only trigger blur if we're not in fullscreen mode and not transitioning from fullscreen
    // This prevents search results from being reset when shrinking from fullscreen
    if (!isFullscreen) {
      onSearchBlur();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Set typing state when user starts typing
    if (!hasStartedTyping && value.length > 0) {
      setHasStartedTyping(true);
    }
    onSearchChange(value);
  };

  const handleFullscreenToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    
    console.log('Maximize button clicked, preventing event propagation');
    
    // Set flag to prevent autocomplete from closing
    setIsTogglingFullscreen(true);
    
    // Call the fullscreen toggle function first
    onToggleFullscreen?.();
    
    // Then handle input focus/blur after a short delay to ensure flag is set
    setTimeout(() => {
      if (isFullscreen) {
        // When shrinking from fullscreen, focus the input to bring back keyboard
        inputRef.current?.focus();
      } else {
        // When expanding to fullscreen, hide keyboard
        inputRef.current?.blur();
      }
      
      // Reset flag after the blur/focus operation
      setTimeout(() => {
        setIsTogglingFullscreen(false);
      }, 50);
    }, 10);
  };

  const handleFilterClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowFilterDropdown(!showFilterDropdown);
  };

  const handleFilterSelect = (filter: string) => {
    setShowFilterDropdown(false);
    onFilterSelect?.(filter);
  };

  const handleInputClick = () => {
    // If in fullscreen mode, collapse when input is clicked
    if (isFullscreen) {
      onToggleFullscreen?.();
      // Focus the input after collapsing
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  };

  // iOS-specific touch handling for better responsiveness
  const handleTouchStart = (e: React.TouchEvent) => {
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      // Ensure the input becomes focused on touch start for iOS
      if (inputRef.current && !isFocused) {
        e.preventDefault();
        inputRef.current.focus();
      }
    }
  };

  return (
    <div className="relative search-area w-full" onTouchStart={(e) => e.stopPropagation()} onTouchEnd={(e) => e.stopPropagation()}>
      <input 
        type="text" 
        placeholder={searchQuery ? "" : staticPlaceholder}
        value={searchQuery} 
        onChange={handleInputChange} 
        onFocus={handleFocus} 
        onBlur={handleBlur} 
        onClick={handleInputClick}
        onTouchStart={handleTouchStart}
        enterKeyHint="done"
        className={`w-full py-2 bg-card text-card-foreground rounded-xl border border-border placeholder:text-center placeholder:text-muted-foreground text-center focus:border-primary/50 focus:bg-card shadow-sm ${!hasStartedTyping ? 'caret-transparent' : ''}`}
        ref={inputRef}
        style={{
          caretColor: (!hasStartedTyping) ? 'transparent' : 'auto',
          paddingLeft: '2.5rem',
          paddingRight: searchQuery ? '2.5rem' : '1rem'
        }}
      />
      {/* Fullscreen button on the left */}
      {(isFocused || isFullscreen) && (
        <button 
          onClick={handleFullscreenToggle}
          onMouseDown={(e) => e.preventDefault()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 rounded-full p-1 transition-colors"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4 text-muted-foreground" /> : <Maximize2 className="h-4 w-4 text-muted-foreground" />}
        </button>
      )}
      {/* Filter button on the right - only show when focused or when there's text */}
      {/* Temporarily hidden - will be reimplemented later */}
      {/* {(isFocused || searchQuery) && (
        <div className="absolute top-1/2 transform -translate-y-1/2 right-3 filter-dropdown-container">
          <button 
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleFilterClick(e);
            }}
            className="rounded-full p-1.5 transition-colors duration-75 hover:bg-muted/50 active:bg-muted/70"
          >
            <Filter className="h-4 w-4 text-muted-foreground" />
          </button>
          
          <!- Filter dropdown ->
          {showFilterDropdown && createPortal(
            <div 
              className="fixed bg-background border border-border/15 rounded-xl shadow-lg z-[999999] w-[80px] filter-dropdown-container animate-slide-down-fast"
              style={{
                top: inputRef.current?.getBoundingClientRect().bottom + 4,
                right: window.innerWidth - (inputRef.current?.getBoundingClientRect().right || 0) + 12
              }}
            >
              <button
                onClick={() => handleFilterSelect('current')}
                className="w-full px-4 py-3 text-center text-sm border-b border-border/10 last:border-b-0 transition-colors duration-75 cursor-default hover:bg-muted/50 rounded-t-xl"
              >
                Current List
              </button>
              <button
                onClick={() => handleFilterSelect('all')}
                className="w-full px-4 py-3 text-center text-sm border-b border-border/10 last:border-b-0 transition-colors duration-75 cursor-default hover:bg-muted/50 rounded-b-xl"
              >
                All Lists
              </button>
            </div>,
            document.body
          )}
        </div>
      )} */}
      {/* X button on the right (when there's a search query) */}
      {searchQuery && (
        <button 
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClearSearch();
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            onClearSearch();
          }}
          onTouchEnd={(e) => e.stopPropagation()}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 rounded-full p-1 transition-colors"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;
