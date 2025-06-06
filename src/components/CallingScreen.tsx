import React, { useState, useEffect } from 'react';
import CallingScreenHeader from '@/components/CallingScreenHeader';
import LeadCard from '@/components/LeadCard';
import NavigationControls from '@/components/NavigationControls';
import SearchBar from '@/components/SearchBar';
import { timezoneMapping } from '@/utils/timezoneMapping';

interface Lead {
  name: string;
  phone: string;
  called?: number;
  lastCalled?: string;
}

interface CallingScreenProps {
  leads: Lead[];
  fileName: string;
  onBack: () => void;
  onLeadsImported: (leads: Lead[], fileName: string) => void;
}

const CallingScreen: React.FC<CallingScreenProps> = ({ leads, fileName, onBack, onLeadsImported }) => {
  const [leadsData, setLeadsData] = useState<Lead[]>(leads);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Lead[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState<number[]>([0]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [autoCall, setAutoCall] = useState(false);

  // Load saved state
  useEffect(() => {
    const savedState = localStorage.getItem('coldcaller-state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.fileName === fileName) {
          setLeadsData(parsed.leads || leads);
          setCurrentIndex(parsed.currentIndex || 0);
          setAutoCall(parsed.autoCall || false);
        }
      } catch (error) {
        console.error('Error loading saved state:', error);
      }
    }
  }, [leads, fileName]);

  // Save state when it changes
  useEffect(() => {
    const stateToSave = {
      leads: leadsData,
      currentIndex,
      autoCall,
      fileName
    };
    localStorage.setItem('coldcaller-state', JSON.stringify(stateToSave));
  }, [leadsData, currentIndex, autoCall, fileName]);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = leadsData.filter(lead =>
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone.includes(searchQuery)
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, leadsData]);

  const getTimezone = (phone: string): string => {
    const areaCode = phone.replace(/\D/g, '').slice(0, 3);
    return timezoneMapping[areaCode] || 'Unknown';
  };

  const formatLastCalled = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return `${diffInDays}d ago`;
    }
  };

  const currentLead = isSearching && searchResults.length > 0
    ? searchResults[0]
    : leadsData[currentIndex] || leadsData[0];

  const handleCall = () => {
    const phoneNumber = currentLead.phone.replace(/\D/g, '');
    window.location.href = `tel:${phoneNumber}`;
    
    const updatedLeads = leadsData.map(lead => {
      if (lead.name === currentLead.name && lead.phone === currentLead.phone) {
        return {
          ...lead,
          called: (lead.called || 0) + 1,
          lastCalled: new Date().toISOString()
        };
      }
      return lead;
    });
    setLeadsData(updatedLeads);
  };

  const handleNext = () => {
    if (isSearching) return;
    
    const nextIndex = Math.min(currentIndex + 1, leadsData.length - 1);
    setCurrentIndex(nextIndex);
    
    const newHistory = navigationHistory.slice(0, historyIndex + 1);
    newHistory.push(nextIndex);
    setNavigationHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    if (autoCall && leadsData[nextIndex]) {
      const phoneNumber = leadsData[nextIndex].phone.replace(/\D/g, '');
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  const handlePrevious = () => {
    if (isSearching) return;
    const prevIndex = Math.max(currentIndex - 1, 0);
    setCurrentIndex(prevIndex);
    
    const newHistory = navigationHistory.slice(0, historyIndex + 1);
    newHistory.push(prevIndex);
    setNavigationHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleFirst = () => {
    if (isSearching) return;
    setCurrentIndex(0);
    
    const newHistory = navigationHistory.slice(0, historyIndex + 1);
    newHistory.push(0);
    setNavigationHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleLast = () => {
    if (isSearching) return;
    const lastIndex = leadsData.length - 1;
    setCurrentIndex(lastIndex);
    
    const newHistory = navigationHistory.slice(0, historyIndex + 1);
    newHistory.push(lastIndex);
    setNavigationHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newHistoryIndex = historyIndex - 1;
      setHistoryIndex(newHistoryIndex);
      setCurrentIndex(navigationHistory[newHistoryIndex]);
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setIsSearching(query.trim().length > 0);
  };

  const handleLeadSelect = (lead: Lead) => {
    const originalIndex = leadsData.findIndex(l => l.name === lead.name && l.phone === lead.phone);
    if (originalIndex !== -1) {
      setCurrentIndex(originalIndex);
      setIsSearching(false);
      setSearchQuery('');
      
      const newHistory = navigationHistory.slice(0, historyIndex + 1);
      newHistory.push(originalIndex);
      setNavigationHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const toggleAutoCall = () => {
    setAutoCall(!autoCall);
  };

  const actualLeadIndex = isSearching && searchResults.length > 0
    ? leadsData.findIndex(lead => lead.name === currentLead.name && lead.phone === currentLead.phone) + 1
    : currentIndex + 1;

  const totalLeadCount = leadsData.length;

  const searchResultsWithIndices = searchResults.map(result => {
    const actualIndex = leadsData.findIndex(lead => lead.name === result.name && lead.phone === result.phone);
    return actualIndex;
  });

  return (
    <div className="h-screen h-[100vh] h-[100svh] bg-background flex flex-col overflow-hidden">
      <CallingScreenHeader
        fileName={fileName}
        onBack={onBack}
        onLeadsImported={onLeadsImported}
      />

      <div className="flex-1 flex items-center justify-center p-4 min-h-0 px-6">
        <div className="w-full max-w-sm space-y-6">
          <LeadCard
            currentLead={currentLead}
            fileName={fileName}
            actualLeadIndex={actualLeadIndex}
            totalLeadCount={totalLeadCount}
            onCall={handleCall}
            getTimezone={getTimezone}
            formatLastCalled={formatLastCalled}
          />

          <NavigationControls
            onPrevious={handlePrevious}
            onNext={handleNext}
            onFirst={handleFirst}
            onLast={handleLast}
            onUndo={handleUndo}
            canUndo={historyIndex > 0}
            autoCall={autoCall}
            onToggleAutoCall={toggleAutoCall}
          />

          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            searchResults={searchResults}
            onLeadSelect={handleLeadSelect}
            actualIndices={searchResultsWithIndices}
            totalLeads={leadsData.length}
            showResults={searchQuery.trim().length > 0}
          />
        </div>
      </div>
    </div>
  );
};

export default CallingScreen;
