import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { Card } from '@/components/ui/card';
import { Lead } from '../types/lead';

interface SearchAutocompleteProps {
  isVisible: boolean;
  isFullscreen?: boolean;
  onAnimationComplete?: () => void;
  onCloseAutocomplete?: () => void;
  loadMoreResults?: () => void;
  loadedResultsCount?: number;
  totalResultsCount?: number;
  itemHeight?: number;
  maxHeight?: number;
  maxItems?: number;
  // New props for direct search results
  searchResults?: Lead[];
  allSearchResults?: Lead[]; // Add this prop for fullscreen mode
  onLeadSelect?: (lead: Lead) => void;
  leadsData?: Lead[];
}

const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({ 
  isVisible,
  isFullscreen = false,
  onAnimationComplete,
  onCloseAutocomplete,
  loadMoreResults,
  loadedResultsCount = 0,
  totalResultsCount = 0,
  itemHeight = 85,
  maxHeight = 400,
  maxItems = 50, // Only used as fallback when not using virtualized list
  searchResults = [],
  allSearchResults = [], // Add this prop for fullscreen mode
  onLeadSelect,
  leadsData = []
}) => {

  
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Check if we're on a mobile device
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Check if item is loaded
  const isItemLoaded = useCallback((index: number) => {
    return index < loadedResultsCount;
  }, [loadedResultsCount]);

  // Render individual lead item for virtualized list
  const renderLeadItem = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    // Determine which data source to use based on fullscreen state
    const dataSource = isFullscreen ? allSearchResults : searchResults;
    const lead = dataSource[index];
    
    if (!lead) {
      return (
        <div style={style} key={`loading-${index}`}>
          <div className="w-full px-4 py-4 text-left border-b border-border/10 last:border-b-0">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-3 bg-muted rounded mb-1"></div>
              <div className="h-3 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      );
    }

    const handleLeadClick = () => {
      onLeadSelect?.(lead);
      
      // Explicitly close the autocomplete when a lead is selected
      if (onCloseAutocomplete) {
        onCloseAutocomplete();
      }
    };

    // For virtualized lists, we need a different approach since react-window handles scrolling
    // We'll use a combination of click and touch events that work better with virtualized lists
    let touchStartTime = 0;
    let touchStartY = 0;
    let touchStartX = 0;
    let hasMoved = false;
    const moveThreshold = 10; // Slightly higher threshold for virtualized lists
    const timeThreshold = 300; // Maximum time for a tap

    const handleTouchStart = (e: React.TouchEvent) => {
      e.stopPropagation();
      
      // Reset tracking
      hasMoved = false;
      touchStartTime = Date.now();
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      e.stopPropagation();
      
      // Check if finger has moved significantly
      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const deltaY = Math.abs(currentY - touchStartY);
      const deltaX = Math.abs(currentX - touchStartX);
      
      if (deltaY > moveThreshold || deltaX > moveThreshold) {
        hasMoved = true;
      }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
      e.stopPropagation();
      
      const touchDuration = Date.now() - touchStartTime;
      
      // Only trigger lead selection if:
      // 1. No significant movement occurred
      // 2. Touch duration is short (indicating a tap, not a long press)
      if (!hasMoved && touchDuration < timeThreshold) {
        handleLeadClick();
      }
    };


    
    return (
      <div style={style} key={`${lead.name}-${lead.phone}-${index}`}>
        <button
          onClick={handleLeadClick}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="w-full px-4 py-4 text-left border-b border-border/10 last:border-b-0 transition-colors duration-75 cursor-pointer hover:bg-muted/50 active:bg-muted/70 touch-manipulation"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0 mr-3">
              <p className="font-medium text-foreground truncate mb-1">{lead.name}</p>
              {lead.company && (
                <p className="text-xs text-muted-foreground truncate mb-1">{lead.company}</p>
              )}
              <p className="text-sm text-muted-foreground break-all">{lead.phone}</p>
            </div>
            <div className="flex-shrink-0 text-xs text-muted-foreground">
              {leadsData.findIndex(l => l.name === lead.name && l.phone === lead.phone) + 1}/{leadsData.length}
            </div>
          </div>
        </button>
      </div>
    );
  }, [isFullscreen, allSearchResults, searchResults, onLeadSelect, onCloseAutocomplete, leadsData, totalResultsCount]);

  // Handle loading more items
  const handleLoadMoreItems = useCallback((startIndex: number, stopIndex: number) => {
    if (loadMoreResults && loadedResultsCount < totalResultsCount) {
      loadMoreResults();
    }
    return Promise.resolve();
  }, [loadMoreResults, loadedResultsCount, totalResultsCount]);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setIsAnimating(true);
    } else if (shouldRender) {
      setIsAnimating(false);
      // Fade out animation duration
      const timer = setTimeout(() => {
        setShouldRender(false);
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }, 20); // Reduced from 50ms to 20ms for even faster disappearance
      return () => clearTimeout(timer);
    }
  }, [isVisible, shouldRender, onAnimationComplete]);

  useEffect(() => {
    if (shouldRender) {
      document.body.classList.add('overflow-hidden');
      // Add class to main container
      const mainContainer = document.querySelector('.h-\\[100dvh\\].bg-background.flex.flex-col.overflow-hidden.fixed.inset-0');
      if (mainContainer) {
        mainContainer.classList.add('autocomplete-open');
      }
      
      // Prevent touch scrolling on mobile
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${window.scrollY}px`;
      
      // Add touch event prevention to main content
      const preventScroll = (e: TouchEvent) => {
        e.preventDefault();
      };
      
      const mainContent = document.querySelector('.flex-1.overflow-hidden.min-h-0');
      if (mainContent) {
        mainContent.addEventListener('touchmove', preventScroll, { passive: false });
        mainContent.addEventListener('touchstart', preventScroll, { passive: false });
      }
      
      return () => {
        if (mainContent) {
          mainContent.removeEventListener('touchmove', preventScroll);
          mainContent.removeEventListener('touchstart', preventScroll);
        }
        if (mainContainer) {
          mainContainer.classList.remove('autocomplete-open');
        }
      };
    } else {
      document.body.classList.remove('overflow-hidden');
      // Remove class from main container
      const mainContainer = document.querySelector('.h-\\[100dvh\\].bg-background.flex.flex-col.overflow-hidden.fixed.inset-0');
      if (mainContainer) {
        mainContainer.classList.remove('autocomplete-open');
      }
      
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      const mainContainer = document.querySelector('.h-\\[100dvh\\].bg-background.flex.flex-col.overflow-hidden.fixed.inset-0');
      if (mainContainer) {
        mainContainer.classList.remove('autocomplete-open');
      }
    };
  }, [shouldRender]);

  // iOS-friendly touch detection - only close on true taps outside
  useEffect(() => {
    if (!shouldRender) return;

    let touchStartY = 0;
    let touchStartX = 0;
    let hasMoved = false;
    const moveThreshold = 5; // Very small threshold for iOS

    const handleTouchStart = (e: TouchEvent) => {
      hasMoved = false;
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const deltaY = Math.abs(currentY - touchStartY);
      const deltaX = Math.abs(currentX - touchStartX);
      
      // If finger moved more than threshold, mark as moved
      if (deltaY > moveThreshold || deltaX > moveThreshold) {
        hasMoved = true;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      // Only close if:
      // 1. No movement occurred (true tap)
      // 2. Touch ended outside autocomplete
      if (!hasMoved) {
        const target = e.target as Element;
        const autocompleteArea = target.closest('.search-autocomplete-container');
        const searchArea = target.closest('.search-area');
        
        if (!autocompleteArea && !searchArea) {
          onCloseAutocomplete?.();
        }
      }
      
      // Reset state
      hasMoved = false;
      touchStartY = 0;
      touchStartX = 0;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [shouldRender, onCloseAutocomplete]);

  if (!shouldRender) {
    return null;
  }

  const animationClass = isAnimating ? 'animate-slide-down' : 'animate-slide-up';

  // If we have loadMoreResults function, use infinite loader (including for empty results)
  if (loadMoreResults) {
    
    // Calculate height based on fullscreen state and number of results
    let listHeight: number;
    let containerStyle: React.CSSProperties = {};
    
    if (isFullscreen) {
      // Fullscreen mode - use CSS calc() for better iOS compatibility
      const fullscreenHeight = window.innerHeight - 80; // Calculate for List component
      
      containerStyle = {
        position: 'absolute' as const, // Same positioning as normal mode
        top: '100%', // Same as normal mode - below search bar
        left: '0',
        right: '0',
        height: 'calc(100vh - 80px)', // Use CSS calc with viewport units
        zIndex: 50,
        transition: 'height 0.3s ease-in-out', // Smooth height transition
      };

      return (
        <div 
          className={`z-50 mt-1 mb-1 rounded-xl shadow-lg overflow-hidden ${animationClass} bg-background/15 backdrop-blur-sm border border-border/15 search-autocomplete-container`} 
          style={{ ...containerStyle, overflow: 'hidden' }}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          {searchResults.length === 0 ? (
            <div className="flex items-center justify-center h-full p-4 text-center text-muted-foreground">
              No leads found
            </div>
          ) : (
            <InfiniteLoader
              isItemLoaded={isItemLoaded}
              itemCount={totalResultsCount}
              loadMoreItems={handleLoadMoreItems}
              threshold={5} // Load more when 5 items away from the end
            >
              {({ onItemsRendered, ref }) => (
                <List
                  ref={ref}
                  height={fullscreenHeight}
                  itemCount={totalResultsCount} // Use totalResultsCount instead of searchResults.length
                  itemSize={itemHeight}
                  width="100%"
                  onItemsRendered={onItemsRendered}
                  overscanCount={10}
                >
                  {renderLeadItem}
                </List>
              )}
            </InfiniteLoader>
          )}
        </div>
      );
    } else {
      // Normal mode - dynamic height based on number of results
      const maxCollapsedHeight = 260; // Exactly accommodate 3 full cards (3 * 85 + 4 = 259px, rounded to 260)
      const minCollapsedHeight = itemHeight; // Minimum height for one item
      const heightBuffer = 4; // Small buffer to ensure last item is fully visible
      const dynamicHeight = Math.min(Math.max(searchResults.length * itemHeight + heightBuffer, minCollapsedHeight), maxCollapsedHeight);
      
      containerStyle = {
        position: 'absolute' as const, // Same positioning as normal mode
        top: '100%', // Same as normal mode - below search bar
        left: '0',
        right: '0',
        height: `${dynamicHeight}px`, // Dynamic height based on results
        zIndex: 50,
        transition: 'height 0.3s ease-in-out', // Smooth height transition
        marginBottom: '0.25rem', // Account for mb-1 class
      };

      return (
        <div 
          className={`z-50 mt-1 rounded-xl shadow-lg overflow-hidden ${animationClass} bg-background/15 backdrop-blur-sm border border-border/15 search-autocomplete-container`} 
          style={{ ...containerStyle, overflow: 'hidden' }}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          {searchResults.length === 0 ? (
            <div className="flex items-center justify-center h-full p-4 text-center text-muted-foreground">
              No leads found
            </div>
          ) : (
            <InfiniteLoader
              isItemLoaded={isItemLoaded}
              itemCount={totalResultsCount}
              loadMoreItems={handleLoadMoreItems}
              threshold={5} // Load more when 5 items away from the end
            >
              {({ onItemsRendered, ref }) => (
                <List
                  ref={ref}
                  height={dynamicHeight}
                  itemCount={searchResults.length}
                  itemSize={itemHeight}
                  width="100%"
                  onItemsRendered={onItemsRendered}
                  overscanCount={10}
                >
                  {renderLeadItem}
                </List>
              )}
            </InfiniteLoader>
          )}
        </div>
      );
    }
  }

  // Fallback to original rendering for non-virtualized content
  
  const contactsToShow = Math.min(3, searchResults.length);
  const heightBuffer = 4; // Small buffer to ensure last item is fully visible
  const fallbackHeight = Math.max(searchResults.length * itemHeight + heightBuffer, itemHeight); // Dynamic height based on actual results
  
  return (
    <div 
      className={`absolute top-full left-0 right-0 z-50 mt-1 rounded-3xl shadow-lg overflow-hidden ${animationClass} bg-background/15 backdrop-blur-sm border border-white/10 search-autocomplete-container`}
      style={{ 
        height: `${fallbackHeight}px`,
        touchAction: 'pan-y', // Allow vertical scrolling, prevent horizontal
        pointerEvents: 'auto'
      }}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
    >
      {searchResults.length === 0 ? (
        <div className="flex items-center justify-center h-full p-4 text-center text-muted-foreground">
          No leads found
        </div>
      ) : (
        searchResults.map((lead, index) => {
          const handleLeadClick = () => {
            onLeadSelect?.(lead);
            
            // Explicitly close the autocomplete when a lead is selected
            if (onCloseAutocomplete) {
              onCloseAutocomplete();
            }
          };

          // Track touch state for this specific lead button
          let touchStartY = 0;
          let touchStartX = 0;
          let hasMoved = false;
          const moveThreshold = 5;

          const handleTouchStart = (e: React.TouchEvent) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Reset movement tracking
            hasMoved = false;
            touchStartY = e.touches[0].clientY;
            touchStartX = e.touches[0].clientX;
          };

          const handleTouchMove = (e: React.TouchEvent) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Check if finger has moved significantly
            const currentY = e.touches[0].clientY;
            const currentX = e.touches[0].clientX;
            const deltaY = Math.abs(currentY - touchStartY);
            const deltaX = Math.abs(currentX - touchStartX);
            
            if (deltaY > moveThreshold || deltaX > moveThreshold) {
              hasMoved = true;
            }
          };

          const handleTouchEnd = (e: React.TouchEvent) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Only trigger lead selection if no movement occurred (it was a tap, not a scroll)
            if (!hasMoved) {
              handleLeadClick();
            }
          };

          return (
            <button
              key={`${lead.name}-${lead.phone}-${index}`}
              onClick={handleLeadClick}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="w-full px-4 py-4 text-left border-b border-border/10 last:border-b-0 transition-colors duration-75 cursor-pointer hover:bg-muted/50 active:bg-muted/70 touch-manipulation"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="font-medium text-foreground truncate mb-1">{lead.name}</p>
                  {lead.company && (
                    <p className="text-xs text-muted-foreground truncate mb-1">{lead.company}</p>
                  )}
                  <p className="text-sm text-muted-foreground break-all">{lead.phone}</p>
                </div>
                <div className="flex-shrink-0 text-xs text-muted-foreground">
                  {leadsData.findIndex(l => l.name === lead.name && l.phone === lead.phone) + 1}/{leadsData.length}
                </div>
              </div>
            </button>
          );
        })
      )}
    </div>
  );
};

export default SearchAutocomplete;
