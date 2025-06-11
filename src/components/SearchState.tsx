
import { useState, useEffect } from 'react';
import { Lead } from '../types/lead';

interface UseSearchStateProps {
  leads: Lead[];
  getBaseLeads: () => Lead[];
  leadsData: Lead[];
  timezoneFilter: string;
  callFilter: string;
}

export const useSearchState = ({ leads, getBaseLeads, leadsData, timezoneFilter, callFilter }: UseSearchStateProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(leads);
  const [isSearching, setIsSearching] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  useEffect(() => {
    const baseLeads = getBaseLeads();
    if (searchQuery.trim()) {
      const filtered = baseLeads.filter(lead => 
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        lead.phone.includes(searchQuery)
      );
      setSearchResults(filtered);
      setIsSearching(true);
    } else {
      setSearchResults(baseLeads);
      setIsSearching(false);
    }
  }, [searchQuery, leadsData, timezoneFilter, callFilter]);

  const clearSearch = () => {
    setSearchQuery('');
    setShowAutocomplete(false);
  };

  const handleSearchFocus = () => {
    setShowAutocomplete(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => setShowAutocomplete(false), 150);
  };

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
