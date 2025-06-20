import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { Card } from '@/components/ui/card';
import { Lead } from '../types/lead';

interface SearchAutocompleteProps {
  isVisible: boolean;
  onAnimationComplete?: () => void;
  children?: React.ReactNode;
  loadMoreResults?: () => void;
  loadedResultsCount?: number;
  totalResultsCount?: number;
  itemHeight?: number;
  maxHeight?: number;
  maxItems?: number;
  // New props for direct search results
  searchResults?: Lead[];
  onLeadSelect?: (lead: Lead) => void;
  leadsData?: Lead[];
}

const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({ 
  isVisible,
  onAnimationComplete,
  children,
  loadMoreResults,
  loadedResultsCount = 0,
  totalResultsCount = 0,
  itemHeight = 70,
  maxHeight = 400,
  maxItems = 50, // Only used as fallback when not using virtualized list
  searchResults = [],
  onLeadSelect,
  leadsData = []
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Check if item is loaded
  const isItemLoaded = useCallback((index: number) => {
    return index < loadedResultsCount;
  }, [loadedResultsCount]);

  // Render individual lead item for virtualized list
  const renderLeadItem = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const lead = searchResults[index];
    if (!lead) return null;

    return (
      <div style={style} key={`${lead.name}-${lead.phone}-${index}`}>
        <button
          onClick={() => onLeadSelect?.(lead)}
          className="w-full px-4 py-3 text-left border-b border-border/10 last:border-b-0 transition-colors duration-75 cursor-default hover:bg-muted/50"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0 mr-3">
              <p className="font-medium text-foreground truncate">{lead.name}</p>
              {lead.company && (
                <p className="text-xs text-muted-foreground truncate">{lead.company}</p>
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
  }, [searchResults, onLeadSelect, leadsData]);

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

  if (!shouldRender) {
    return null;
  }

  const animationClass = isAnimating ? 'animate-slide-down' : 'animate-fade-out';

  // If we have loadMoreResults function and searchResults, use infinite loader
  if (loadMoreResults && searchResults.length > 0) {
    // Calculate height to account for iOS system bar above keyboard
    // Reduce the available height to leave space for the system bar (typically ~60px)
    const systemBarHeight = 60; // Increased from 40px to 60px for more space
    const availableHeight = window.innerHeight * 0.5 - systemBarHeight; // 50% of viewport minus system bar
    const maxDropdownHeight = Math.min(400, availableHeight);
    const listHeight = Math.min(maxDropdownHeight, searchResults.length * itemHeight);

    return (
      <div className={`absolute top-full left-0 right-0 z-50 mt-1 rounded-xl shadow-lg overflow-hidden ${animationClass} bg-background/15 backdrop-blur-sm border border-border/15`} style={{ maxHeight: `${availableHeight}px` }}>
        <InfiniteLoader
          isItemLoaded={isItemLoaded}
          itemCount={totalResultsCount}
          loadMoreItems={handleLoadMoreItems}
          threshold={5} // Load more when 5 items away from the end
        >
          {({ onItemsRendered, ref }) => (
            <List
              ref={ref}
              height={listHeight}
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
      </div>
    );
  }

  // Fallback to original rendering for non-virtualized content
  return (
    <div className={`absolute top-full left-0 right-0 z-50 mt-1 rounded-xl shadow-lg overflow-hidden ${animationClass} bg-background/15 backdrop-blur-sm border border-border/15`} style={{ maxHeight: `${Math.min(400, window.innerHeight * 0.5 - 60)}px` }}>
      {children}
    </div>
  );
};

export default SearchAutocomplete;
