import { useCallback } from 'react';
import { Lead } from '@/types/lead';

export const useSearchVirtualization = (
  searchResults: Lead[],
  allSearchResults: Lead[],
  isFullscreen: boolean,
  loadedResultsCount: number,
  totalResultsCount: number,
  loadMoreResults?: () => void
) => {
  // Check if item is loaded
  const isItemLoaded = useCallback((index: number) => {
    return index < loadedResultsCount;
  }, [loadedResultsCount]);

  // Handle loading more items
  const handleLoadMoreItems = useCallback((startIndex: number, stopIndex: number) => {
    if (loadMoreResults && loadedResultsCount < totalResultsCount) {
      loadMoreResults();
    }
    return Promise.resolve();
  }, [loadMoreResults, loadedResultsCount, totalResultsCount]);

  // Get data source based on fullscreen state
  const getDataSource = useCallback(() => {
    return isFullscreen ? allSearchResults : searchResults;
  }, [isFullscreen, allSearchResults, searchResults]);

  return {
    isItemLoaded,
    handleLoadMoreItems,
    getDataSource
  };
}; 