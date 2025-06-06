
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Phone, ChevronLeft, ChevronRight, Shuffle, Search, X } from 'lucide-react';

interface Lead {
  name: string;
  phone: string;
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

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = leads.filter(lead => 
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone.includes(searchQuery)
      );
      setFilteredLeads(filtered);
      setCurrentIndex(0);
      setIsSearching(true);
    } else {
      setFilteredLeads(leads);
      setIsSearching(false);
    }
  }, [searchQuery, leads]);

  const currentLead = filteredLeads[currentIndex];
  const totalLeads = isSearching ? filteredLeads.length : leads.length;

  const handleCall = () => {
    if (currentLead) {
      const phoneNumber = currentLead.phone.replace(/\D/g, '');
      window.location.href = `tel:${phoneNumber}`;
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Badge variant="secondary" className="text-xs font-medium">
              {fileName}
            </Badge>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search leads by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-6">
        {/* Lead Counter */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Lead {currentIndex + 1} of {totalLeads}
            {isSearching && <span className="ml-1">(filtered)</span>}
          </p>
        </div>

        {/* Current Lead Card */}
        <Card className="shadow-lg">
          <CardContent className="p-6 text-center space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-blue-900 mb-2">{currentLead.name}</h2>
              <p className="text-lg font-mono text-gray-700">{currentLead.phone}</p>
            </div>

            {/* Main Call Button */}
            <Button
              onClick={handleCall}
              size="lg"
              className="w-full h-14 text-lg font-semibold bg-green-600 hover:bg-green-700"
            >
              <Phone className="mr-2 h-6 w-6" />
              Call Now
            </Button>
          </CardContent>
        </Card>

        {/* Navigation Controls */}
        <Card>
          <CardContent className="p-4 space-y-4">
            {/* Auto Call Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Auto-call on next</span>
              <Switch
                checked={autoCall}
                onCheckedChange={setAutoCall}
              />
            </div>

            {/* Navigation Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={filteredLeads.length <= 1}
                className="h-12"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <Button
                variant="outline"
                onClick={handleShuffle}
                disabled={filteredLeads.length <= 1}
                className="h-12"
              >
                <Shuffle className="h-5 w-5" />
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={filteredLeads.length <= 1}
                className="h-12 bg-blue-600 hover:bg-blue-700"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CallingScreen;
