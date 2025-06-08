
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, ArrowLeft, ArrowRight, X } from 'lucide-react';
import { formatPhoneNumber, getStateFromAreaCode } from '@/lib/utils';
import SearchAutocomplete from '@/components/SearchAutocomplete';
import SearchBar from '@/components/SearchBar';

interface Lead {
  name: string;
  phone: string;
  called?: number;
  lastCalled?: Date;
}

interface CallingScreenProps {
  leads: Lead[];
  fileName: string;
  onBack: () => void;
  onLeadsImported: (updatedLeads: Lead[]) => void;
}

const CallingScreen: React.FC<CallingScreenProps> = ({
  leads,
  fileName,
  onBack,
  onLeadsImported
}) => {
  const [currentLead, setCurrentLead] = useState<Lead>(leads[0]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalLeadCount, setTotalLeadCount] = useState(leads.length);
  const [cardKey, setCardKey] = useState(0); // Key to force re-render of the card
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<Lead[]>([]);
  const [actualIndices, setActualIndices] = useState<number[]>([]);

  useEffect(() => {
    if (leads && leads.length > 0) {
      setCurrentLead(leads[0]);
      setCurrentIndex(0);
      setTotalLeadCount(leads.length);
    }
  }, [leads]);

  const updateSearchResults = useCallback(() => {
    if (searchQuery) {
      const results = leads.map((lead, index) => ({ lead, index })).filter(({ lead }) => {
        const lowerQuery = searchQuery.toLowerCase();
        return (
          lead.name.toLowerCase().includes(lowerQuery) ||
          lead.phone.includes(lowerQuery)
        );
      });

      setSearchResults(results.map(({ lead }) => lead));
      setActualIndices(results.map(({ index }) => index + 1));
    } else {
      setSearchResults([]);
      setActualIndices([]);
    }
  }, [searchQuery, leads]);

  useEffect(() => {
    updateSearchResults();
  }, [searchQuery, updateSearchResults]);

  const handleNext = () => {
    if (currentIndex < totalLeadCount - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentLead(leads[currentIndex + 1]);
      setCardKey(prevKey => prevKey + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setCurrentLead(leads[currentIndex - 1]);
      setCardKey(prevKey => prevKey + 1);
    }
  };

  const handleCall = () => {
    const updatedLeads = [...leads];
    updatedLeads[currentIndex].called = (updatedLeads[currentIndex].called || 0) + 1;
    updatedLeads[currentIndex].lastCalled = new Date();
    onLeadsImported(updatedLeads);
    setCurrentLead({ ...updatedLeads[currentIndex] });
  };

  const handleSearchSelect = (lead: Lead) => {
    const index = leads.findIndex(l => l.phone === lead.phone);
    if (index !== -1) {
      setCurrentIndex(index);
      setCurrentLead(lead);
      setSearchQuery('');
      setIsSearchFocused(false);
      setCardKey(prevKey => prevKey + 1);
    }
  };

  const resetCallCount = () => {
    const updatedLeads = [...leads];
    updatedLeads[currentIndex].called = 0;
    onLeadsImported(updatedLeads);
    setCurrentLead({ ...updatedLeads[currentIndex] });
  };

  return <div className="h-screen h-[100vh] h-[100svh] bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-background border-b border-border p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <SearchBar 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchFocus={() => setIsSearchFocused(true)}
            onSearchBlur={() => setIsSearchFocused(false)}
            onClearSearch={() => {
              setSearchQuery('');
              setIsSearchFocused(false);
            }}
            fileName={fileName}
          />
        </div>
        {isSearchFocused && searchQuery !== '' && (
          <SearchAutocomplete 
            leads={searchResults}
            onLeadSelect={handleSearchSelect}
            searchQuery={searchQuery}
            actualIndices={actualIndices}
            totalLeads={totalLeadCount}
          />
        )}
      </div>

      {/* Main Content - Better centering for mobile app */}
      <div className="flex-1 flex items-center justify-center p-4 min-h-0 px-6">
        <div className="w-full max-w-sm space-y-4">
          {/* Filter Buttons - Centered relative to Previous and Next buttons */}
          <div className="flex">
            <div className="flex-1"></div>
            <div className="flex space-x-2">
              <Button onClick={() => {
                  const filteredLeads = leads.filter(lead => (lead.called || 0) === 0);
                  if (filteredLeads.length > 0) {
                    const firstIndex = leads.findIndex(lead => lead.phone === filteredLeads[0].phone);
                    setCurrentIndex(firstIndex);
                    setCurrentLead(filteredLeads[0]);
                    setCardKey(prevKey => prevKey + 1);
                  }
                }} variant="outline">
                Uncalled
              </Button>
              <Button onClick={() => {
                  const filteredLeads = leads.filter(lead => (lead.called || 0) > 0);
                  if (filteredLeads.length > 0) {
                    const firstIndex = leads.findIndex(lead => lead.phone === filteredLeads[0].phone);
                    setCurrentIndex(firstIndex);
                    setCurrentLead(filteredLeads[0]);
                    setCardKey(prevKey => prevKey + 1);
                  }
                }} variant="outline">
                Called
              </Button>
            </div>
            <div className="flex-1"></div>
          </div>

          {/* Current Lead Card */}
          <Card key={cardKey} className="shadow-2xl border-border/50 rounded-3xl bg-card h-[400px] flex flex-col animate-scale-in">
            <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
              {/* Top row with lead count and file name */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground opacity-40">
                  {currentIndex + 1}/{totalLeadCount}
                </p>
                <p className="text-sm text-muted-foreground opacity-40">
                  {fileName}
                </p>
              </div>

              {/* Lead info - Main content area with animation */}
              <div key={`${currentLead.name}-${currentLead.phone}`} className="text-center space-y-3 flex-1 flex flex-col justify-center animate-content-change">
                {/* State and timezone - above contact name with same styling as called/last called */}
                <p className="text-xs text-muted-foreground">
                  {getStateFromAreaCode(currentLead.phone)}
                </p>
                
                {/* Contact name with reset button */}
                <div className="relative">
                  <h2 className="text-3xl font-bold text-foreground">{currentLead.name}</h2>
                  <button onClick={resetCallCount} className="absolute -top-2 -right-2 p-1 hover:bg-accent/50 rounded-full transition-colors" style={{
                    WebkitTapHighlightColor: 'transparent'
                  }}>
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>
                
                <p className="text-lg text-muted-foreground text-center">{formatPhoneNumber(currentLead.phone)}</p>
                
                <p className="text-xs text-muted-foreground">
                  Called: {currentLead.called || 0} times
                </p>
                
                {currentLead.lastCalled && (
                  <p className="text-xs text-muted-foreground">
                    Last called: {currentLead.lastCalled.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                )}
              </div>

              {/* Call Button */}
              <div className="flex-shrink-0">
                <Button onClick={handleCall} className="w-full bg-green-600 hover:bg-green-700 text-white rounded-2xl h-14 text-lg font-semibold flex items-center justify-center space-x-2 shadow-lg active:scale-95 transition-transform" style={{
                  WebkitTapHighlightColor: 'transparent'
                }}>
                  <Phone className="w-6 h-6" />
                  <span>Call</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={handlePrevious} disabled={currentIndex === 0}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              Previous
            </Button>
            <Button variant="outline" onClick={handleNext} disabled={currentIndex === totalLeadCount - 1}>
              Next
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>;
};

export default CallingScreen;
