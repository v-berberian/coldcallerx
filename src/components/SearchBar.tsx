import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
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
  onCloseAutocomplete?: () => void;
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
  onCloseAutocomplete
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const [isTogglingFullscreen, setIsTogglingFullscreen] = useState(false);
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
    setIsFocused(true);
    // Only trigger focus if we're not already showing autocomplete (prevents reset)
    if (!isFullscreen) {
      onSearchFocus();
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    
    // Don't close autocomplete when:
    // 1. We're in fullscreen mode (user might dismiss keyboard but want to keep autocomplete)
    // 2. We're toggling fullscreen (maximize button was clicked)
    // 3. The input is being blurred as part of fullscreen toggle
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

  return (
    <div className="relative search-area max-w-sm mx-auto" onTouchStart={(e) => e.stopPropagation()} onTouchEnd={(e) => e.stopPropagation()}>
      <input 
        type="text" 
        placeholder={searchQuery ? "" : staticPlaceholder}
        value={searchQuery} 
        onChange={handleInputChange} 
        onFocus={handleFocus} 
        onBlur={handleBlur} 
        onClick={handleInputClick}
        enterKeyHint="done"
        className={`w-full px-4 py-2 bg-card text-card-foreground rounded-xl border border-border placeholder:text-center placeholder:text-muted-foreground text-center focus:border-primary/50 focus:bg-card shadow-sm ${!hasStartedTyping && isFocused ? 'caret-transparent' : ''}`}
        ref={inputRef}
        style={{
          caretColor: (!hasStartedTyping && isFocused) ? 'transparent' : 'auto'
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
      {/* X button on the right */}
      {searchQuery && (
        <button 
          onClick={onClearSearch} 
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:bg-muted/50 rounded-full p-1 transition-colors"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );
});

export default SearchBar;
