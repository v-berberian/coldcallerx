
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
  const [searchBasedNavigation, setSearchBasedNavigation] = useState(false);
  const [searchBaseLeads, setSearchBaseLeads] = useState<Lead[]>([]);
  const [searchCurrentIndex, setSearchCurrentIndex] = useState(0);

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
      if (searchBasedNavigation) {
        setSearchBasedNavigation(false);
        setSearchBaseLeads([]);
        setSearchCurrentIndex(0);
      }
    }
  }, [searchQuery, leadsData, timezoneFilter, callFilter]);

  const clearSearch = () => {
    setSearchQuery('');
    setShowAutocomplete(false);
    setSearchBasedNavigation(false);
    setSearchBaseLeads([]);
    setSearchCurrentIndex(0);
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
    searchBasedNavigation,
    setSearchBasedNavigation,
    searchBaseLeads,
    setSearchBaseLeads,
    searchCurrentIndex,
    setSearchCurrentIndex,
    clearSearch,
    handleSearchFocus,
    handleSearchBlur
  };
};
