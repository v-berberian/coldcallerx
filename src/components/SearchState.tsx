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

  // Reduced debounce time for faster response
  const debouncedSearchQuery = useDebounce(searchQuery, 50);

  // Memoize base leads to avoid recalculation
  const baseLeads = useMemo(() => {
    return getBaseLeads();
  }, [getBaseLeads]);

  // Pre-initialize search results with all leads for instant display
  const initialSearchResults = useMemo(() => {
    return baseLeads.slice(0, INITIAL_RESULTS);
  }, [baseLeads]);

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
      const phone = lead.phone.toLowerCase();
      const company = lead.company?.toLowerCase() || '';
      const additionalPhones = lead.additionalPhones?.toLowerCase() || '';
      
      // Search across name, phone, company, and additional phones
      if (name.includes(searchTerm) || 
          phone.includes(searchTerm) || 
          company.includes(searchTerm) ||
          additionalPhones.includes(searchTerm)) {
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

  // Pre-populate search results on mount for instant display
  useEffect(() => {
    // Only pre-populate if there's no active search query
    if (searchResults.length === 0 && initialSearchResults.length > 0 && !debouncedSearchQuery.trim()) {
      setSearchResults(initialSearchResults);
    }
  }, [initialSearchResults, searchResults.length, debouncedSearchQuery]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    // Don't close autocomplete - just clear the search query
    // setShowAutocomplete(false); // Removed this line
    setLoadedResultsCount(INITIAL_RESULTS);
  }, []);

  const handleSearchFocus = useCallback(() => {
    // Immediately show autocomplete with pre-loaded results
    setShowAutocomplete(true);
    // Ensure we have results to show immediately
    if (searchResults.length === 0 && initialSearchResults.length > 0) {
      setSearchResults(initialSearchResults);
    }
  }, [searchResults.length, initialSearchResults]);

  const handleSearchBlur = useCallback(() => {
    // Keep autocomplete open if there's an active search query, even with no results
    // This allows users to see "No leads found" message
    if (searchResults.length === 0 && !debouncedSearchQuery.trim()) {
      setTimeout(() => setShowAutocomplete(false), 20);
    }
    // Don't reset search results when blurring - keep current results
  }, [searchResults.length, debouncedSearchQuery]);

  const closeAutocomplete = useCallback(() => {
    setShowAutocomplete(false);
    
    // On mobile, also blur the input to close the keyboard
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      // Try multiple methods to ensure the keyboard closes
      const input = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (input) {
        input.blur();
        // Force blur by focusing on body
        document.body.focus();
        // Additional mobile-specific keyboard closing
        setTimeout(() => {
          const activeElement = document.activeElement as HTMLElement;
          if (activeElement && activeElement.tagName === 'INPUT') {
            activeElement.blur();
          }
        }, 10);
      }
    }
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
    handleSearchBlur,
    closeAutocomplete
  };
};
