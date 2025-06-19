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

export const useSearchState = ({ leads, getBaseLeads, leadsData, timezoneFilter, callFilter }: UseSearchStateProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Lead[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  // Debounce search query to avoid excessive filtering
  const debouncedSearchQuery = useDebounce(searchQuery, 150);

  // Memoize base leads to avoid recalculation
  const baseLeads = useMemo(() => {
    return getBaseLeads();
  }, [getBaseLeads]);

  // Optimized search function with result limiting
  const performSearch = useCallback((query: string, leads: Lead[]) => {
    if (!query.trim()) {
      return leads; // Show all leads when no search query
    }

    const searchTerm = query.toLowerCase();
    const results: Lead[] = [];
    let count = 0;
    const maxResults = 50; // Limit search results for performance

    for (const lead of leads) {
      if (count >= maxResults) break;
      
      if (
        lead.name.toLowerCase().includes(searchTerm) || 
        lead.phone.includes(searchTerm)
      ) {
        results.push(lead);
        count++;
      }
    }

    return results;
  }, []);

  // Memoized search results
  const memoizedSearchResults = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return baseLeads; // Show all leads when no search query
    }
    return performSearch(debouncedSearchQuery, baseLeads);
  }, [debouncedSearchQuery, baseLeads, performSearch]);

  // Update search results when memoized results change
  useEffect(() => {
    setSearchResults(memoizedSearchResults);
    setIsSearching(debouncedSearchQuery.trim().length > 0);
  }, [memoizedSearchResults, debouncedSearchQuery]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setShowAutocomplete(false);
  }, []);

  const handleSearchFocus = useCallback(() => {
    setShowAutocomplete(true);
  }, []);

  const handleSearchBlur = useCallback(() => {
    setTimeout(() => setShowAutocomplete(false), 150);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    showAutocomplete,
    setShowAutocomplete,
    clearSearch,
    handleSearchFocus,
    handleSearchBlur
  };
};
