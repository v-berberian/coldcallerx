
import { useState, useEffect } from 'react';

interface Lead {
  name: string;
  phone: string;
  called?: number;
  lastCalled?: string;
}

export const useLeadSearch = (leads: Lead[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLeads, setFilteredLeads] = useState(leads);
  const [isSearching, setIsSearching] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = leads.filter(lead =>
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone.includes(searchQuery)
      );
      setFilteredLeads(filtered);
      setIsSearching(true);
    } else {
      setFilteredLeads(leads);
      setIsSearching(false);
    }
  }, [searchQuery, leads]);

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
    filteredLeads,
    isSearching,
    showAutocomplete,
    clearSearch,
    handleSearchFocus,
    handleSearchBlur
  };
};
