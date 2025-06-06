
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Phone, ArrowLeft, ArrowRight, Shuffle, Search, X } from 'lucide-react';

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
}

const CallingScreen: React.FC<CallingScreenProps> = ({ leads, fileName, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoCall, setAutoCall] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLeads, setFilteredLeads] = useState(leads);
  const [isSearching, setIsSearching] = useState(false);
  const [leadsData, setLeadsData] = useState<Lead[]>(leads.map(lead => ({ ...lead, called: 0 })));

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = leadsData.filter(lead => 
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone.includes(searchQuery)
      );
      setFilteredLeads(filtered);
      setCurrentIndex(0);
      setIsSearching(true);
    } else {
      setFilteredLeads(leadsData);
      setIsSearching(false);
    }
  }, [searchQuery, leadsData]);

  const currentLead = filteredLeads[currentIndex];
  const totalLeads = isSearching ? filteredLeads.length : leadsData.length;

  const handleCall = () => {
    if (currentLead) {
      const phoneNumber = currentLead.phone.replace(/\D/g, '');
      window.location.href = `tel:${phoneNumber}`;
      
      // Update called count and last called time
      const updatedLeads = leadsData.map(lead => 
        lead.name === currentLead.name && lead.phone === currentLead.phone
          ? { 
              ...lead, 
              called: (lead.called || 0) + 1,
              lastCalled: new Date().toLocaleDateString()
            }
          : lead
      );
      setLeadsData(updatedLeads);
    }
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % filteredLeads.length;
    setCurrentIndex(nextIndex);
    
    if (autoCall && filteredLeads[nextIndex]) {
      setTimeout(() => {
        const phoneNumber = filteredLeads[nextIndex].phone.replace(/\D/g, '');
        window.location.href = `tel:${phoneNumber}`;
      }, 500);
    }
  };

  const handlePrevious = () => {
    const prevIndex = currentIndex === 0 ? filteredLeads.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
  };

  const handleShuffle = () => {
    const shuffled = [...filteredLeads].sort(() => Math.random() - 0.5);
    setFilteredLeads(shuffled);
    setCurrentIndex(0);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setCurrentIndex(0);
  };

  if (!currentLead) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-lg">No leads found</p>
            <Button onClick={onBack} className="mt-4">Back to Import</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b border-border p-4">
        <div className="flex items-center justify-center mb-4">
          <h1 className="text-2xl font-bold text-primary">ColdCaller</h1>
        </div>
        
        <div className="text-center mb-4">
          <Button variant="outline" size="sm" onClick={onBack} className="px-6">
            Import
          </Button>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search leads by name or phone number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 bg-muted/30"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Lead Info */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            List: {fileName}
          </p>
          <p className="text-sm text-muted-foreground">
            {currentIndex + 1}/{totalLeads}
          </p>
        </div>

        {/* Current Lead Card */}
        <Card className="shadow-sm border-border/50">
          <CardContent className="p-8 text-center space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">{currentLead.name}</h2>
              <p className="text-lg text-muted-foreground mb-4">{currentLead.phone}</p>
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
              className="w-full h-16 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white"
            >
              Call
            </Button>
          </CardContent>
        </Card>

        {/* Navigation Controls */}
        <div className="space-y-4">
          {/* Previous/Next Navigation */}
          <div className="flex gap-4">
            {(currentLead.called || 0) > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={filteredLeads.length <= 1}
                className="flex-1 h-12"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            )}
            
            <div className="flex-1" />
            
            {(currentLead.called || 0) > 0 && (
              <Button
                variant="outline"
                onClick={handleNext}
                disabled={filteredLeads.length <= 1}
                className="flex-1 h-12"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
            
            {(currentLead.called || 0) === 0 && (
              <Button
                variant="outline"
                onClick={handleNext}
                disabled={filteredLeads.length <= 1}
                className="w-full h-12"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>

          {/* Bottom Controls */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              onClick={handleShuffle}
              disabled={filteredLeads.length <= 1}
              className="h-12 w-12"
            >
              <Shuffle className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Auto Call</span>
              <Switch
                checked={autoCall}
                onCheckedChange={setAutoCall}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallingScreen;
