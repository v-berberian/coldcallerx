
import { useState, useMemo, useCallback } from 'react';
import { Lead } from '../types/lead';
import { useDebounce } from './useDebounce';

interface UseOptimizedSearchProps {
  leads: Lead[];
  getBaseLeads: () => Lead[];
}

export const useOptimizedSearch = ({ leads, getBaseLeads }: UseOptimizedSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  
  // Debounce search query to avoid excessive filtering
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Memoized filtered results
  const searchResults = useMemo(() => {
    if (!debouncedSearchQuery || debouncedSearchQuery.trim() === '') {
      return [];
    }

    const baseLeads = getBaseLeads();
    const query = debouncedSearchQuery.toLowerCase();
    
    return baseLeads
      .map((lead, index) => ({ lead, index }))
      .filter(({ lead }) => 
        lead.name.toLowerCase().includes(query) ||
        lead.phone.includes(query) ||
        (lead.company && lead.company.toLowerCase().includes(query)) ||
        (lead.email && lead.email.toLowerCase().includes(query))
      )
      .slice(0, 50); // Limit results for performance
  }, [debouncedSearchQuery, getBaseLeads]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setShowAutocomplete(false);
  }, []);

  const handleSearchFocus = useCallback(() => {
    if (searchQuery.trim()) {
      setShowAutocomplete(true);
    }
  }, [searchQuery]);

  const handleSearchBlur = useCallback(() => {
    // Delay hiding to allow for clicks
    setTimeout(() => setShowAutocomplete(false), 150);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    showAutocomplete,
    setShowAutocomplete,
    clearSearch,
    handleSearchFocus,
    handleSearchBlur
  };
};
