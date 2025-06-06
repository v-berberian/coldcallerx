import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, ArrowLeft, ArrowRight, Shuffle, Search, X, Upload } from 'lucide-react';
import SearchAutocomplete from './SearchAutocomplete';
import CSVImporter from './CSVImporter';
import ThemeToggle from './ThemeToggle';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
  onImport: (leads: Lead[], fileName: string) => void;
}

const CallingScreen: React.FC<CallingScreenProps> = ({
  leads,
  fileName,
  onBack,
  onImport
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoCall, setAutoCall] = useState(false);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLeads, setFilteredLeads] = useState(leads);
  const [isSearching, setIsSearching] = useState(false);
  const [leadsData, setLeadsData] = useState<Lead[]>(leads.map(lead => ({
    ...lead,
    called: 0
  })));
  const [navigationHistory, setNavigationHistory] = useState<number[]>([0]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = leadsData.filter(lead => lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || lead.phone.includes(searchQuery));
      setFilteredLeads(filtered);
      setCurrentIndex(0);
      setNavigationHistory([0]);
      setHistoryIndex(0);
      setIsSearching(true);
    } else {
      setFilteredLeads(leadsData);
      setIsSearching(false);
    }
  }, [searchQuery, leadsData]);

  const currentLead = filteredLeads[currentIndex];
  const totalLeads = isSearching ? filteredLeads.length : leadsData.length;
  const currentLeadNumber = currentIndex + 1;

  const handleCall = () => {
    if (currentLead) {
      const phoneNumber = currentLead.phone.replace(/\D/g, '');
      window.location.href = `tel:${phoneNumber}`;

      const updatedLeads = leadsData.map(lead => lead.name === currentLead.name && lead.phone === currentLead.phone ? {
        ...lead,
        called: (lead.called || 0) + 1,
        lastCalled: new Date().toLocaleDateString()
      } : lead);
      setLeadsData(updatedLeads);
    }
  };

  const handleNext = () => {
    let nextIndex;
    if (shuffleMode) {
      do {
        nextIndex = Math.floor(Math.random() * filteredLeads.length);
      } while (nextIndex === currentIndex && filteredLeads.length > 1);
    } else {
      nextIndex = (currentIndex + 1) % filteredLeads.length;
    }
    setCurrentIndex(nextIndex);

    const newHistory = navigationHistory.slice(0, historyIndex + 1);
    newHistory.push(nextIndex);
    setNavigationHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    if (autoCall && filteredLeads[nextIndex]) {
      setTimeout(() => {
        const phoneNumber = filteredLeads[nextIndex].phone.replace(/\D/g, '');
        window.location.href = `tel:${phoneNumber}`;
      }, 500);
    }
  };

  const handlePrevious = () => {
    if (historyIndex > 0) {
      const newHistoryIndex = historyIndex - 1;
      const prevIndex = navigationHistory[newHistoryIndex];
      setCurrentIndex(prevIndex);
      setHistoryIndex(newHistoryIndex);
    }
  };

  const toggleShuffle = () => {
    setShuffleMode(!shuffleMode);
  };

  const toggleAutoCall = () => {
    setAutoCall(!autoCall);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setCurrentIndex(0);
    setNavigationHistory([0]);
    setHistoryIndex(0);
    setShowAutocomplete(false);
  };

  const handleSearchFocus = () => {
    setShowAutocomplete(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => setShowAutocomplete(false), 150);
  };

  const handleLeadSelect = (lead: Lead) => {
    const leadIndex = filteredLeads.findIndex(l => l.name === lead.name && l.phone === lead.phone);
    if (leadIndex !== -1) {
      setCurrentIndex(leadIndex);
      setNavigationHistory([leadIndex]);
      setHistoryIndex(0);
      setSearchQuery('');
      setShowAutocomplete(false);
    }
  };

  const handleImportFromModal = (importedLeads: Lead[], importedFileName: string) => {
    onImport(importedLeads, importedFileName);
    setIsImportOpen(false);
  };

  if (leadsData.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-background border-b border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <Sheet open={isImportOpen} onOpenChange={setIsImportOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2 h-auto text-muted-foreground hover:text-foreground">
                  <Upload className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[90vh]">
                <SheetHeader>
                  <SheetTitle>Import Leads</SheetTitle>
                  <SheetDescription>
                    Upload a CSV file to import your leads
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <CSVImporter onImport={handleImportFromModal} />
                </div>
              </SheetContent>
            </Sheet>
            
            <ThemeToggle />
          </div>
          
          <div className="flex items-center justify-center">
            <h1 className="text-2xl font-bold text-primary">ColdCaller</h1>
          </div>
        </div>

        {/* Empty state content */}
        <div className="p-6 text-center">
          <p className="text-lg text-muted-foreground">No leads imported</p>
        </div>
      </div>
    );
  }

  if (!currentLead) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg rounded-2xl">
          <CardContent className="p-8 text-center">
            <p className="text-lg">No leads found</p>
            <Button onClick={onBack} className="mt-4 rounded-xl">Back to Import</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <Sheet open={isImportOpen} onOpenChange={setIsImportOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2 h-auto text-muted-foreground hover:text-foreground">
                <Upload className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[90vh]">
              <SheetHeader>
                <SheetTitle>Import Leads</SheetTitle>
                <SheetDescription>
                  Upload a CSV file to import your leads
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <CSVImporter onImport={handleImportFromModal} />
              </div>
            </SheetContent>
          </Sheet>
          
          <h1 className="text-2xl font-bold text-primary">ColdCaller</h1>
          
          <ThemeToggle />
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search leads by name or phone number" 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            onFocus={handleSearchFocus} 
            onBlur={handleSearchBlur} 
            className="w-full px-4 py-2 bg-muted/30 rounded-xl border border-input text-center placeholder:text-center focus:outline-none focus:ring-2 focus:ring-ring caret-transparent" 
          />
          {searchQuery && (
            <button onClick={clearSearch} className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
          
          {/* Autocomplete Dropdown */}
          {showAutocomplete && (
            <SearchAutocomplete 
              leads={searchQuery ? filteredLeads : leadsData} 
              onLeadSelect={handleLeadSelect} 
              searchQuery={searchQuery} 
            />
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Current Lead Card */}
        <Card className="shadow-2xl border-border/50 rounded-3xl bg-card">
          <CardContent className="p-6 space-y-6">
            {/* Top row with count and list name */}
            <div className="flex items-start justify-between">
              <p className="text-sm text-muted-foreground">
                {currentIndex + 1}/{totalLeads}
              </p>
              <p className="text-sm text-muted-foreground">
                {fileName}
              </p>
            </div>

            {/* Lead info */}
            <div className="text-center space-y-4">
              <p className="text-lg font-medium text-muted-foreground">#{currentLeadNumber}</p>
              <h2 className="text-3xl font-bold text-foreground">{currentLead.name}</h2>
              
              <div className="flex items-center justify-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">{currentLead.phone}</p>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Called: {currentLead.called || 0} times
              </p>
              {currentLead.lastCalled && (
                <p className="text-sm text-muted-foreground">
                  Last called: {currentLead.lastCalled}
                </p>
              )}
            </div>

            {/* Main Call Button */}
            <Button 
              onClick={handleCall} 
              size="lg" 
              className="w-full h-16 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white rounded-2xl shadow-lg"
            >
              <Phone className="h-6 w-6 mr-2" />
              Call
            </Button>
          </CardContent>
        </Card>

        {/* Navigation Controls */}
        <div className="space-y-4">
          {/* Previous/Next Navigation */}
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={handlePrevious} 
              disabled={historyIndex <= 0} 
              className="flex-1 h-12 rounded-2xl shadow-lg"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleNext} 
              disabled={filteredLeads.length <= 1} 
              className="flex-1 h-12 rounded-2xl shadow-lg"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Bottom Controls */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center space-y-1 flex-1">
              <button 
                onClick={toggleShuffle} 
                disabled={filteredLeads.length <= 1} 
                className="p-3 rounded-full transition-colors disabled:opacity-50"
              >
                <Shuffle className={`h-5 w-5 ${shuffleMode ? 'text-orange-500' : 'text-muted-foreground'}`} />
              </button>
            </div>
            
            <div className="flex flex-col items-center space-y-1 flex-1">
              <button 
                onClick={toggleAutoCall} 
                className={`text-sm font-medium transition-colors px-3 py-1 rounded ${autoCall ? 'text-green-600' : 'text-muted-foreground'}`}
              >
                Auto Call
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallingScreen;
