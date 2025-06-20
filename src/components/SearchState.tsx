import { useState, useEffect, useMemo, useCallback } from 'react';
import { Lead } from '../types/lead';

interface UseSearchStateProps {
  leads: Lead[];
  getBaseLeads: () => Lead[];
  leadsData: Lead[];
  timezoneFilter: string;
  callFilter: string;
}

// Debounce hook for search optimization
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const INITIAL_RESULTS = 1000;
const LOAD_MORE_INCREMENT = 1000;

export const useSearchState = ({ leads, getBaseLeads, leadsData, timezoneFilter, callFilter }: UseSearchStateProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Lead[]>([]);
  const [loadedResultsCount, setLoadedResultsCount] = useState(INITIAL_RESULTS);
  const [isSearching, setIsSearching] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  // Debounce search query to avoid excessive filtering
  const debouncedSearchQuery = useDebounce(searchQuery, 150);

  // Memoize base leads to avoid recalculation
  const baseLeads = useMemo(() => {
    return getBaseLeads();
  }, [getBaseLeads]);

  // Ultra-optimized search function with incremental loading
  const performSearch = useCallback((query: string, leads: Lead[]) => {
    if (!query.trim()) {
      return leads; // Show all leads when no search query
    }

    const searchTerm = query.toLowerCase();
    const results: Lead[] = [];
    const length = leads.length;

    // Use for loop for better performance - no limit here, we'll limit in the UI
    for (let i = 0; i < length; i++) {
      const lead = leads[i];
      const name = lead.name.toLowerCase();
      const phone = lead.phone;
      
      if (name.includes(searchTerm) || phone.includes(searchTerm)) {
        results.push(lead);
      }
    }

    return results;
  }, []);

  // Memoized search results - get all matching results
  const allSearchResults = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return baseLeads; // Show all leads when no search query
    }
    return performSearch(debouncedSearchQuery, baseLeads);
  }, [debouncedSearchQuery, baseLeads, performSearch]);

  // Get only the loaded portion of results
  const visibleSearchResults = useMemo(() => {
    return allSearchResults.slice(0, loadedResultsCount);
  }, [allSearchResults, loadedResultsCount]);

  // Function to load more results
  const loadMoreResults = useCallback(() => {
    if (loadedResultsCount < allSearchResults.length) {
      setLoadedResultsCount(prev => Math.min(prev + LOAD_MORE_INCREMENT, allSearchResults.length));
    }
  }, [loadedResultsCount, allSearchResults.length]);

  // Reset loaded count when search query changes
  useEffect(() => {
    setLoadedResultsCount(INITIAL_RESULTS);
  }, [debouncedSearchQuery]);

  // Update search results when memoized results change
  useEffect(() => {
    setSearchResults(visibleSearchResults);
    setIsSearching(debouncedSearchQuery.trim().length > 0);
  }, [visibleSearchResults, debouncedSearchQuery]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setShowAutocomplete(false);
    setLoadedResultsCount(INITIAL_RESULTS);
  }, []);

  const handleSearchFocus = useCallback(() => {
    setShowAutocomplete(true);
  }, []);

  const handleSearchBlur = useCallback(() => {
    setTimeout(() => setShowAutocomplete(false), 20);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    allSearchResults,
    loadedResultsCount,
    loadMoreResults,
    isSearching,
    showAutocomplete,
    setShowAutocomplete,
    clearSearch,
    handleSearchFocus,
    handleSearchBlur
  };
};
