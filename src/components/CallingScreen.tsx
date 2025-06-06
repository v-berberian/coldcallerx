import React, { useState, useEffect } from 'react';
import CallingScreenHeader from '@/components/CallingScreenHeader';
import LeadCard from '@/components/LeadCard';
import NavigationControls from '@/components/NavigationControls';
import SearchBar from '@/components/SearchBar';

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
  const [timezoneFilter, setTimezoneFilter] = useState<'ALL' | 'EST_CST'>('ALL');

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
          setTimezoneFilter(parsed.timezoneFilter || 'ALL');
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
      timezoneFilter,
      fileName
    };
    localStorage.setItem('coldcaller-state', JSON.stringify(stateToSave));
  }, [leadsData, currentIndex, autoCall, timezoneFilter, fileName]);

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

  const timezoneMapping: { [key: string]: string } = {
    '201': 'EST', '202': 'EST', '203': 'EST', '205': 'CST', '206': 'PST', '207': 'EST', '208': 'MST', '209': 'PST',
    '210': 'CST', '212': 'EST', '213': 'PST', '214': 'CST', '215': 'EST', '216': 'EST', '217': 'CST', '218': 'CST',
    '219': 'CST', '220': 'EST', '224': 'CST', '225': 'CST', '226': 'EST', '227': 'PST', '228': 'CST', '229': 'EST',
    '231': 'EST', '234': 'EST', '236': 'PST', '239': 'EST', '240': 'EST', '248': 'EST', '251': 'CST', '252': 'EST',
    '253': 'PST', '254': 'CST', '256': 'CST', '260': 'EST', '262': 'CST', '267': 'EST', '269': 'EST', '270': 'CST',
    '272': 'EST', '274': 'EST', '276': 'EST', '281': 'CST', '283': 'EST', '301': 'EST', '302': 'EST', '303': 'MST',
    '304': 'EST', '305': 'EST', '307': 'MST', '308': 'MST', '309': 'CST', '310': 'PST', '312': 'CST', '313': 'EST',
    '314': 'CST', '315': 'EST', '316': 'CST', '317': 'EST', '318': 'CST', '319': 'CST', '320': 'CST', '321': 'EST',
    '323': 'PST', '325': 'CST', '330': 'EST', '331': 'CST', '334': 'CST', '336': 'EST', '337': 'CST', '339': 'EST',
    '346': 'CST', '347': 'EST', '351': 'EST', '352': 'EST', '360': 'PST', '361': 'CST', '364': 'CST', '369': 'EST',
    '380': 'EST', '385': 'MST', '386': 'EST', '401': 'EST', '402': 'CST', '404': 'EST', '405': 'CST', '406': 'MST',
    '407': 'EST', '408': 'PST', '409': 'CST', '410': 'EST', '412': 'EST', '413': 'EST', '414': 'CST', '415': 'PST',
    '417': 'CST', '419': 'EST', '423': 'EST', '424': 'PST', '425': 'PST', '430': 'CST', '432': 'CST', '434': 'EST',
    '435': 'MST', '440': 'EST', '442': 'PST', '443': 'EST', '447': 'CST', '458': 'PST', '469': 'CST', '470': 'EST',
    '475': 'EST', '478': 'EST', '479': 'CST', '480': 'MST', '484': 'EST', '501': 'CST', '502': 'EST', '503': 'PST',
    '504': 'CST', '505': 'MST', '507': 'CST', '508': 'EST', '509': 'PST', '510': 'PST', '512': 'CST', '513': 'EST',
    '515': 'CST', '516': 'EST', '517': 'EST', '518': 'EST', '520': 'MST', '530': 'PST', '531': 'CST', '534': 'CST',
    '539': 'CST', '540': 'EST', '541': 'PST', '551': 'EST', '559': 'PST', '561': 'EST', '562': 'PST', '563': 'CST',
    '567': 'EST', '570': 'EST', '571': 'EST', '573': 'CST', '574': 'EST', '575': 'MST', '580': 'CST', '585': 'EST',
    '586': 'EST', '601': 'CST', '602': 'MST', '603': 'EST', '605': 'CST', '606': 'EST', '607': 'EST', '608': 'CST',
    '609': 'EST', '610': 'EST', '612': 'CST', '614': 'EST', '615': 'CST', '616': 'EST', '617': 'EST', '618': 'CST',
    '619': 'PST', '620': 'CST', '623': 'MST', '626': 'PST', '627': 'PST', '628': 'PST', '629': 'CST', '630': 'CST',
    '631': 'EST', '636': 'CST', '639': 'CST', '641': 'CST', '646': 'EST', '650': 'PST', '651': 'CST', '660': 'CST',
    '661': 'PST', '662': 'CST', '667': 'EST', '669': 'PST', '678': 'EST', '681': 'EST', '682': 'CST', '701': 'CST',
    '702': 'PST', '703': 'EST', '704': 'EST', '706': 'EST', '707': 'PST', '708': 'CST', '712': 'CST', '713': 'CST',
    '714': 'PST', '715': 'CST', '716': 'EST', '717': 'EST', '718': 'EST', '719': 'MST', '720': 'MST', '724': 'EST',
    '725': 'PST', '727': 'EST', '731': 'CST', '732': 'EST', '734': 'EST', '737': 'CST', '740': 'EST', '743': 'EST',
    '747': 'PST', '754': 'EST', '757': 'EST', '760': 'PST', '762': 'EST', '763': 'CST', '765': 'EST', '769': 'CST',
    '770': 'EST', '772': 'EST', '773': 'CST', '774': 'EST', '775': 'PST', '779': 'CST', '781': 'EST', '785': 'CST',
    '786': 'EST', '801': 'MST', '802': 'EST', '803': 'EST', '804': 'EST', '805': 'PST', '806': 'CST', '808': 'HST',
    '810': 'EST', '812': 'EST', '813': 'EST', '814': 'EST', '815': 'CST', '816': 'CST', '817': 'CST', '818': 'PST',
    '828': 'EST', '830': 'CST', '831': 'PST', '832': 'CST', '843': 'EST', '845': 'EST', '847': 'CST', '848': 'EST',
    '850': 'EST', '854': 'EST', '856': 'EST', '857': 'EST', '858': 'PST', '859': 'EST', '860': 'EST', '862': 'EST',
    '863': 'EST', '864': 'EST', '865': 'EST', '870': 'CST', '901': 'CST', '903': 'CST', '904': 'EST', '906': 'EST',
    '907': 'AKST', '908': 'EST', '909': 'PST', '910': 'EST', '912': 'EST', '913': 'CST', '914': 'EST', '915': 'MST',
    '916': 'PST', '917': 'EST', '918': 'CST', '919': 'EST', '920': 'CST', '925': 'PST', '928': 'MST', '929': 'EST',
    '931': 'CST', '935': 'PST', '936': 'CST', '937': 'EST', '939': 'EST', '940': 'CST', '941': 'EST', '947': 'EST',
    '949': 'PST', '951': 'PST', '952': 'CST', '954': 'EST', '956': 'CST', '959': 'EST', '961': 'LBN', '970': 'MST',
    '971': 'PST', '972': 'CST', '973': 'EST', '975': 'EST', '978': 'EST', '979': 'CST', '980': 'EST', '984': 'EST',
    '985': 'CST', '986': 'EST', '989': 'EST'
  };

  const getTimezone = (phone: string): string => {
    const areaCode = phone.replace(/\D/g, '').slice(0, 3);
    return timezoneMapping[areaCode] || 'Unknown';
  };

  const filterLeadsByTimezone = (leads: Lead[]): Lead[] => {
    if (timezoneFilter === 'ALL') return leads;
    return leads.filter(lead => {
      const timezone = getTimezone(lead.phone);
      return timezone === 'EST' || timezone === 'CST';
    });
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

  const filteredLeads = filterLeadsByTimezone(leadsData);
  const currentLead = isSearching 
    ? leadsData.find(lead => lead.name === searchResults[0]?.name && lead.phone === searchResults[0]?.phone) || filteredLeads[currentIndex]
    : filteredLeads[currentIndex];

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
    
    const nextIndex = Math.min(currentIndex + 1, filteredLeads.length - 1);
    setCurrentIndex(nextIndex);
    
    const newHistory = navigationHistory.slice(0, historyIndex + 1);
    newHistory.push(nextIndex);
    setNavigationHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    // Remove delay for auto call - make it immediate
    if (autoCall && filteredLeads[nextIndex]) {
      const phoneNumber = filteredLeads[nextIndex].phone.replace(/\D/g, '');
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
    const lastIndex = filteredLeads.length - 1;
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
    const leadIndex = leadsData.findIndex(l => l.name === lead.name && l.phone === lead.phone);
    if (leadIndex !== -1) {
      const filteredIndex = filteredLeads.findIndex(l => l.name === lead.name && l.phone === lead.phone);
      if (filteredIndex !== -1) {
        setCurrentIndex(filteredIndex);
        setIsSearching(false);
        setSearchQuery('');
        
        const newHistory = navigationHistory.slice(0, historyIndex + 1);
        newHistory.push(filteredIndex);
        setNavigationHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    }
  };

  const toggleTimezoneFilter = () => {
    const newFilter = timezoneFilter === 'ALL' ? 'EST_CST' : 'ALL';
    setTimezoneFilter(newFilter);
    setCurrentIndex(0);
    setNavigationHistory([0]);
    setHistoryIndex(0);
  };

  const toggleAutoCall = () => {
    setAutoCall(!autoCall);
  };

  const actualLeadIndex = isSearching 
    ? leadsData.findIndex(lead => lead.name === currentLead.name && lead.phone === currentLead.phone) + 1
    : currentIndex + 1;

  // Get the total count based on current filter
  const totalLeadCount = timezoneFilter === 'ALL' ? leadsData.length : filterLeadsByTimezone(leadsData).length;

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

      {/* Main Content - Better centering for mobile app */}
      <div className="flex-1 flex items-center justify-center p-4 min-h-0 px-6">
        <div className="w-full max-w-sm space-y-6">
          <LeadCard
            currentLead={currentLead}
            fileName={fileName}
            timezoneFilter={timezoneFilter}
            actualLeadIndex={actualLeadIndex}
            totalLeadCount={totalLeadCount}
            onToggleTimezoneFilter={toggleTimezoneFilter}
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
