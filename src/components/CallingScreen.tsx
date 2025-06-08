import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, ArrowLeft, ArrowRight, X } from 'lucide-react';
import SearchAutocomplete from './SearchAutocomplete';
import SearchBar from './SearchBar';
import ThemeToggle from './ThemeToggle';
import CSVImporter from './CSVImporter';
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
const CallingScreen: React.FC<CallingScreenProps> = ({
  leads,
  fileName,
  onBack,
  onLeadsImported
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoCall, setAutoCall] = useState(false);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(leads); // Separate search results from main navigation
  const [isSearching, setIsSearching] = useState(false);
  const [leadsData, setLeadsData] = useState<Lead[]>(leads.map(lead => ({
    ...lead,
    called: lead.called || 0,
    lastCalled: lead.lastCalled || undefined
  })));
  const [navigationHistory, setNavigationHistory] = useState<number[]>([0]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [timezoneFilter, setTimezoneFilter] = useState<'ALL' | 'EST_CST'>('ALL');
  const [callFilter, setCallFilter] = useState<'ALL' | 'UNCALLED'>('ALL');
  const [cardKey, setCardKey] = useState(0);

  // Get the base leads list (filtered by timezone and call status but not by search)
  const getBaseLeads = () => {
    let filtered = filterLeadsByTimezone(leadsData);
    if (callFilter === 'UNCALLED') {
      filtered = filtered.filter(lead => !lead.called || lead.called === 0);
    }
    return filtered;
  };
  useEffect(() => {
    // Update search results based on search query
    const baseLeads = getBaseLeads();
    if (searchQuery.trim()) {
      const filtered = baseLeads.filter(lead => lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || lead.phone.includes(searchQuery));
      setSearchResults(filtered);
      setIsSearching(true);
    } else {
      setSearchResults(baseLeads);
      setIsSearching(false);
    }
  }, [searchQuery, leadsData, timezoneFilter, callFilter]);
  const formatPhoneNumber = (phone: string): string => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return phone;
  };
  const getStateFromAreaCode = (phone: string): string => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length >= 3) {
      const areaCode = digits.slice(0, 3);
      const stateMap: {
        [key: string]: {
          state: string;
          timezone: string;
        };
      } = {
        '201': {
          state: 'NJ',
          timezone: 'America/New_York'
        },
        '202': {
          state: 'DC',
          timezone: 'America/New_York'
        },
        '203': {
          state: 'CT',
          timezone: 'America/New_York'
        },
        '205': {
          state: 'AL',
          timezone: 'America/Chicago'
        },
        '206': {
          state: 'WA',
          timezone: 'America/Los_Angeles'
        },
        '207': {
          state: 'ME',
          timezone: 'America/New_York'
        },
        '208': {
          state: 'ID',
          timezone: 'America/Boise'
        },
        '209': {
          state: 'CA',
          timezone: 'America/Los_Angeles'
        },
        '210': {
          state: 'TX',
          timezone: 'America/Chicago'
        },
        '212': {
          state: 'NY',
          timezone: 'America/New_York'
        },
        '213': {
          state: 'CA',
          timezone: 'America/Los_Angeles'
        },
        '214': {
          state: 'TX',
          timezone: 'America/Chicago'
        },
        '215': {
          state: 'PA',
          timezone: 'America/New_York'
        },
        '216': {
          state: 'OH',
          timezone: 'America/New_York'
        },
        '217': {
          state: 'IL',
          timezone: 'America/Chicago'
        },
        '218': {
          state: 'MN',
          timezone: 'America/Chicago'
        },
        '219': {
          state: 'IN',
          timezone: 'America/New_York'
        },
        '224': {
          state: 'IL',
          timezone: 'America/Chicago'
        },
        '225': {
          state: 'LA',
          timezone: 'America/Chicago'
        },
        '228': {
          state: 'MS',
          timezone: 'America/Chicago'
        },
        '229': {
          state: 'GA',
          timezone: 'America/New_York'
        },
        '231': {
          state: 'MI',
          timezone: 'America/New_York'
        },
        '234': {
          state: 'OH',
          timezone: 'America/New_York'
        },
        '239': {
          state: 'FL',
          timezone: 'America/New_York'
        },
        '240': {
          state: 'MD',
          timezone: 'America/New_York'
        },
        '248': {
          state: 'MI',
          timezone: 'America/New_York'
        },
        '251': {
          state: 'AL',
          timezone: 'America/Chicago'
        },
        '252': {
          state: 'NC',
          timezone: 'America/New_York'
        },
        '253': {
          state: 'WA',
          timezone: 'America/Los_Angeles'
        },
        '254': {
          state: 'TX',
          timezone: 'America/Chicago'
        },
        '256': {
          state: 'AL',
          timezone: 'America/Chicago'
        },
        '260': {
          state: 'IN',
          timezone: 'America/New_York'
        },
        '262': {
          state: 'WI',
          timezone: 'America/Chicago'
        },
        '267': {
          state: 'PA',
          timezone: 'America/New_York'
        },
        '269': {
          state: 'MI',
          timezone: 'America/New_York'
        },
        '270': {
          state: 'KY',
          timezone: 'America/Chicago'
        },
        '276': {
          state: 'VA',
          timezone: 'America/New_York'
        },
        '281': {
          state: 'TX',
          timezone: 'America/Chicago'
        },
        '301': {
          state: 'MD',
          timezone: 'America/New_York'
        },
        '302': {
          state: 'DE',
          timezone: 'America/New_York'
        },
        '303': {
          state: 'CO',
          timezone: 'America/Denver'
        },
        '304': {
          state: 'WV',
          timezone: 'America/New_York'
        },
        '305': {
          state: 'FL',
          timezone: 'America/New_York'
        },
        '307': {
          state: 'WY',
          timezone: 'America/Denver'
        },
        '308': {
          state: 'NE',
          timezone: 'America/Chicago'
        },
        '309': {
          state: 'IL',
          timezone: 'America/Chicago'
        },
        '310': {
          state: 'CA',
          timezone: 'America/Los_Angeles'
        },
        '312': {
          state: 'IL',
          timezone: 'America/Chicago'
        },
        '313': {
          state: 'MI',
          timezone: 'America/New_York'
        },
        '314': {
          state: 'MO',
          timezone: 'America/Chicago'
        },
        '315': {
          state: 'NY',
          timezone: 'America/New_York'
        },
        '316': {
          state: 'KS',
          timezone: 'America/Chicago'
        },
        '317': {
          state: 'IN',
          timezone: 'America/New_York'
        },
        '318': {
          state: 'LA',
          timezone: 'America/Chicago'
        },
        '319': {
          state: 'IA',
          timezone: 'America/Chicago'
        },
        '320': {
          state: 'MN',
          timezone: 'America/Chicago'
        },
        '321': {
          state: 'FL',
          timezone: 'America/New_York'
        },
        '323': {
          state: 'CA',
          timezone: 'America/Los_Angeles'
        },
        '330': {
          state: 'OH',
          timezone: 'America/New_York'
        },
        '331': {
          state: 'IL',
          timezone: 'America/Chicago'
        },
        '334': {
          state: 'AL',
          timezone: 'America/Chicago'
        },
        '336': {
          state: 'NC',
          timezone: 'America/New_York'
        },
        '337': {
          state: 'LA',
          timezone: 'America/Chicago'
        },
        '339': {
          state: 'MA',
          timezone: 'America/New_York'
        },
        '347': {
          state: 'NY',
          timezone: 'America/New_York'
        },
        '351': {
          state: 'MA',
          timezone: 'America/New_York'
        },
        '352': {
          state: 'FL',
          timezone: 'America/New_York'
        },
        '360': {
          state: 'WA',
          timezone: 'America/Los_Angeles'
        },
        '361': {
          state: 'TX',
          timezone: 'America/Chicago'
        },
        '386': {
          state: 'FL',
          timezone: 'America/New_York'
        },
        '401': {
          state: 'RI',
          timezone: 'America/New_York'
        },
        '402': {
          state: 'NE',
          timezone: 'America/Chicago'
        },
        '404': {
          state: 'GA',
          timezone: 'America/New_York'
        },
        '405': {
          state: 'OK',
          timezone: 'America/Chicago'
        },
        '406': {
          state: 'MT',
          timezone: 'America/Denver'
        },
        '407': {
          state: 'FL',
          timezone: 'America/New_York'
        },
        '408': {
          state: 'CA',
          timezone: 'America/Los_Angeles'
        },
        '409': {
          state: 'TX',
          timezone: 'America/Chicago'
        },
        '410': {
          state: 'MD',
          timezone: 'America/New_York'
        },
        '412': {
          state: 'PA',
          timezone: 'America/New_York'
        },
        '413': {
          state: 'MA',
          timezone: 'America/New_York'
        },
        '414': {
          state: 'WI',
          timezone: 'America/Chicago'
        },
        '415': {
          state: 'CA',
          timezone: 'America/Los_Angeles'
        },
        '417': {
          state: 'MO',
          timezone: 'America/Chicago'
        },
        '419': {
          state: 'OH',
          timezone: 'America/New_York'
        },
        '423': {
          state: 'TN',
          timezone: 'America/Chicago'
        },
        '424': {
          state: 'CA',
          timezone: 'America/Los_Angeles'
        },
        '425': {
          state: 'WA',
          timezone: 'America/Los_Angeles'
        },
        '430': {
          state: 'TX',
          timezone: 'America/Chicago'
        },
        '432': {
          state: 'TX',
          timezone: 'America/Chicago'
        },
        '434': {
          state: 'VA',
          timezone: 'America/New_York'
        },
        '435': {
          state: 'UT',
          timezone: 'America/Denver'
        },
        '440': {
          state: 'OH',
          timezone: 'America/New_York'
        },
        '443': {
          state: 'MD',
          timezone: 'America/New_York'
        },
        '458': {
          state: 'OR',
          timezone: 'America/Los_Angeles'
        },
        '469': {
          state: 'TX',
          timezone: 'America/Chicago'
        },
        '470': {
          state: 'GA',
          timezone: 'America/New_York'
        },
        '475': {
          state: 'CT',
          timezone: 'America/New_York'
        },
        '478': {
          state: 'GA',
          timezone: 'America/New_York'
        },
        '479': {
          state: 'AR',
          timezone: 'America/Chicago'
        },
        '480': {
          state: 'AZ',
          timezone: 'America/Phoenix'
        },
        '484': {
          state: 'PA',
          timezone: 'America/New_York'
        },
        '501': {
          state: 'AR',
          timezone: 'America/Chicago'
        },
        '502': {
          state: 'KY',
          timezone: 'America/New_York'
        },
        '503': {
          state: 'OR',
          timezone: 'America/Los_Angeles'
        },
        '504': {
          state: 'LA',
          timezone: 'America/Chicago'
        },
        '505': {
          state: 'NM',
          timezone: 'America/Denver'
        },
        '507': {
          state: 'MN',
          timezone: 'America/Chicago'
        },
        '508': {
          state: 'MA',
          timezone: 'America/New_York'
        },
        '509': {
          state: 'WA',
          timezone: 'America/Los_Angeles'
        },
        '510': {
          state: 'CA',
          timezone: 'America/Los_Angeles'
        },
        '512': {
          state: 'TX',
          timezone: 'America/Chicago'
        },
        '513': {
          state: 'OH',
          timezone: 'America/New_York'
        },
        '515': {
          state: 'IA',
          timezone: 'America/Chicago'
        },
        '516': {
          state: 'NY',
          timezone: 'America/New_York'
        },
        '517': {
          state: 'MI',
          timezone: 'America/New_York'
        },
        '518': {
          state: 'NY',
          timezone: 'America/New_York'
        },
        '520': {
          state: 'AZ',
          timezone: 'America/Phoenix'
        },
        '530': {
          state: 'CA',
          timezone: 'America/Los_Angeles'
        },
        '540': {
          state: 'VA',
          timezone: 'America/New_York'
        },
        '541': {
          state: 'OR',
          timezone: 'America/Los_Angeles'
        },
        '551': {
          state: 'NJ',
          timezone: 'America/New_York'
        },
        '559': {
          state: 'CA',
          timezone: 'America/Los_Angeles'
        },
        '561': {
          state: 'FL',
          timezone: 'America/New_York'
        },
        '562': {
          state: 'CA',
          timezone: 'America/Los_Angeles'
        },
        '563': {
          state: 'IA',
          timezone: 'America/Chicago'
        },
        '567': {
          state: 'OH',
          timezone: 'America/New_York'
        },
        '570': {
          state: 'PA',
          timezone: 'America/New_York'
        },
        '571': {
          state: 'VA',
          timezone: 'America/New_York'
        },
        '573': {
          state: 'MO',
          timezone: 'America/Chicago'
        },
        '574': {
          state: 'IN',
          timezone: 'America/New_York'
        },
        '575': {
          state: 'NM',
          timezone: 'America/Denver'
        },
        '580': {
          state: 'OK',
          timezone: 'America/Chicago'
        },
        '585': {
          state: 'NY',
          timezone: 'America/New_York'
        },
        '586': {
          state: 'MI',
          timezone: 'America/New_York'
        },
        '601': {
          state: 'MS',
          timezone: 'America/Chicago'
        },
        '602': {
          state: 'AZ',
          timezone: 'America/Phoenix'
        },
        '603': {
          state: 'NH',
          timezone: 'America/New_York'
        },
        '605': {
          state: 'SD',
          timezone: 'America/Chicago'
        },
        '606': {
          state: 'KY',
          timezone: 'America/New_York'
        },
        '607': {
          state: 'NY',
          timezone: 'America/New_York'
        },
        '608': {
          state: 'WI',
          timezone: 'America/Chicago'
        },
        '609': {
          state: 'NJ',
          timezone: 'America/New_York'
        },
        '610': {
          state: 'PA',
          timezone: 'America/New_York'
        },
        '612': {
          state: 'MN',
          timezone: 'America/Chicago'
        },
        '614': {
          state: 'OH',
          timezone: 'America/New_York'
        },
        '615': {
          state: 'TN',
          timezone: 'America/Chicago'
        },
        '616': {
          state: 'MI',
          timezone: 'America/New_York'
        },
        '617': {
          state: 'MA',
          timezone: 'America/New_York'
        },
        '618': {
          state: 'IL',
          timezone: 'America/Chicago'
        },
        '619': {
          state: 'CA',
          timezone: 'America/Los_Angeles'
        },
        '620': {
          state: 'KS',
          timezone: 'America/Chicago'
        },
        '623': {
          state: 'AZ',
          timezone: 'America/Phoenix'
        },
        '626': {
          state: 'CA',
          timezone: 'America/Los_Angeles'
        },
        '630': {
          state: 'IL',
          timezone: 'America/Chicago'
        },
        '631': {
          state: 'NY',
          timezone: 'America/New_York'
        },
        '636': {
          state: 'MO',
          timezone: 'America/Chicago'
        },
        '641': {
          state: 'IA',
          timezone: 'America/Chicago'
        },
        '646': {
          state: 'NY',
          timezone: 'America/New_York'
        },
        '650': {
          state: 'CA',
          timezone: 'America/Los_Angeles'
        },
        '651': {
          state: 'MN',
          timezone: 'America/Chicago'
        },
        '660': {
          state: 'MO',
          timezone: 'America/Chicago'
        },
        '661': {
          state: 'CA',
          timezone: 'America/Los_Angeles'
        },
        '662': {
          state: 'MS',
          timezone: 'America/Chicago'
        },
        '678': {
          state: 'GA',
          timezone: 'America/New_York'
        },
        '682': {
          state: 'TX',
          timezone: 'America/Chicago'
        },
        '701': {
          state: 'ND',
          timezone: 'America/Chicago'
        },
        '702': {
          state: 'NV',
          timezone: 'America/Los_Angeles'
        },
        '703': {
          state: 'VA',
          timezone: 'America/New_York'
        },
        '704': {
          state: 'NC',
          timezone: 'America/New_York'
        },
        '706': {
          state: 'GA',
          timezone: 'America/New_York'
        },
        '707': {
          state: 'CA',
          timezone: 'America/Los_Angeles'
        },
        '708': {
          state: 'IL',
          timezone: 'America/Chicago'
        },
        '712': {
          state: 'IA',
          timezone: 'America/Chicago'
        },
        '713': {
          state: 'TX',
          timezone: 'America/Chicago'
        },
        '714': {
          state: 'CA',
          timezone: 'America/Los_Angeles'
        },
        '715': {
          state: 'WI',
          timezone: 'America/Chicago'
        },
        '716': {
          state: 'NY',
          timezone: 'America/New_York'
        },
        '717': {
          state: 'PA',
          timezone: 'America/New_York'
        },
        '718': {
          state: 'NY',
          timezone: 'America/New_York'
        },
        '719': {
          state: 'CO',
          timezone: 'America/Denver'
        },
        '720': {
          state: 'CO',
          timezone: 'America/Denver'
        },
        '724': {
          state: 'PA',
          timezone: 'America/New_York'
        },
        '727': {
          state: 'FL',
          timezone: 'America/New_York'
        },
        '731': {
          state: 'TN',
          timezone: 'America/Chicago'
        },
        '732': {
          state: 'NJ',
          timezone: 'America/New_York'
        },
        '734': {
          state: 'MI',
          timezone: 'America/New_York'
        },
        '737': {
          state: 'TX',
          timezone: 'America/Chicago'
        },
        '740': {
          state: 'OH',
          timezone: 'America/New_York'
        },
        '757': {
          state: 'VA',
          timezone: 'America/New_York'
        },
        '760': {
          state: 'CA',
          timezone: 'America/Los_Angeles'
        },
        '763': {
          state: 'MN',
          timezone: 'America/Chicago'
        },
        '765': {
          state: 'IN',
          timezone: 'America/New_York'
        },
        '770': {
          state: 'GA',
          timezone: 'America/New_York'
        },
        '772': {
          state: 'FL',
          timezone: 'America/New_York'
        },
        '773': {
          state: 'IL',
          timezone: 'America/Chicago'
        },
        '774': {
          state: 'MA',
          timezone: 'America/New_York'
        },
        '775': {
          state: 'NV',
          timezone: 'America/Los_Angeles'
        },
        '781': {
          state: 'MA',
          timezone: 'America/New_York'
        },
        '785': {
          state: 'KS',
          timezone: 'America/Chicago'
        },
        '786': {
          state: 'FL',
          timezone: 'America/New_York'
        },
        '801': {
          state: 'UT',
          timezone: 'America/Denver'
        },
        '802': {
          state: 'VT',
          timezone: 'America/New_York'
        },
        '803': {
          state: 'SC',
          timezone: 'America/New_York'
        },
        '804': {
          state: 'VA',
          timezone: 'America/New_York'
        },
        '805': {
          state: 'CA',
          timezone: 'America/Los_Angeles'
        },
        '806': {
          state: 'TX',
          timezone: 'America/Chicago'
        },
        '808': {
          state: 'HI',
          timezone: 'Pacific/Honolulu'
        },
        '810': {
          state: 'MI',
          timezone: 'America/New_York'
        },
        '812': {
          state: 'IN',
          timezone: 'America/New_York'
        },
        '813': {
          state: 'FL',
          timezone: 'America/New_York'
        },
        '814': {
          state: 'PA',
          timezone: 'America/New_York'
        },
        '815': {
          state: 'IL',
          timezone: 'America/Chicago'
        },
        '816': {
          state: 'MO',
          timezone: 'America/Chicago'
        },
        '817': {
          state: 'TX',
          timezone: 'America/Chicago'
        },
        '818': {
          state: 'CA',
          timezone: 'America/Los_Angeles'
        },
        '828': {
          state: 'NC',
          timezone: 'America/New_York'
        },
        '830': {
          state: 'TX',
          timezone: 'America/Chicago'
        },
        '831': {
          state: 'CA',
          timezone: 'America/Los_Angeles'
        },
        '832': {
          state: 'TX',
          timezone: 'America/Chicago'
        },
        '843': {
          state: 'SC',
          timezone: 'America/New_York'
        },
        '845': {
          state: 'NY',
          timezone: 'America/New_York'
        },
        '847': {
          state: 'IL',
          timezone: 'America/Chicago'
        },
        '850': {
          state: 'FL',
          timezone: 'America/Chicago'
        },
        '856': {
          state: 'NJ',
          timezone: 'America/New_York'
        },
        '857': {
          state: 'MA',
          timezone: 'America/New_York'
        },
        '858': {
          state: 'CA',
          timezone: 'America/Los_Angeles'
        },
        '859': {
          state: 'KY',
          timezone: 'America/New_York'
        },
        '860': {
          state: 'CT',
          timezone: 'America/New_York'
        },
        '862': {
          state: 'NJ',
          timezone: 'America/New_York'
        },
        '863': {
          state: 'FL',
          timezone: 'America/New_York'
        },
        '864': {
          state: 'SC',
          timezone: 'America/New_York'
        },
        '865': {
          state: 'TN',
          timezone: 'America/New_York'
        },
        '870': {
          state: 'AR',
          timezone: 'America/Chicago'
        },
        '872': {
          state: 'IL',
          timezone: 'America/Chicago'
        },
        '878': {
          state: 'PA',
          timezone: 'America/New_York'
        },
        '901': {
          state: 'TN',
          timezone: 'America/Chicago'
        },
        '903': {
          state: 'TX',
          timezone: 'America/Chicago'
        },
        '904': {
          state: 'FL',
          timezone: 'America/New_York'
        },
        '906': {
          state: 'MI',
          timezone: 'America/New_York'
        },
        '907': {
          state: 'AK',
          timezone: 'America/Anchorage'
        },
        '908': {
          state: 'NJ',
          timezone: 'America/New_York'
        },
        '909': {
          state: 'CA',
          timezone: 'America/Los_Angeles'
        },
        '910': {
          state: 'NC',
          timezone: 'America/New_York'
        },
        '912': {
          state: 'GA',
          timezone: 'America/New_York'
        },
        '913': {
          state: 'KS',
          timezone: 'America/Chicago'
        },
        '914': {
          state: 'NY',
          timezone: 'America/New_York'
        },
        '915': {
          state: 'TX',
          timezone: 'America/Denver'
        },
        '916': {
          state: 'CA',
          timezone: 'America/Los_Angeles'
        },
        '917': {
          state: 'NY',
          timezone: 'America/New_York'
        },
        '918': {
          state: 'OK',
          timezone: 'America/Chicago'
        },
        '919': {
          state: 'NC',
          timezone: 'America/New_York'
        },
        '920': {
          state: 'WI',
          timezone: 'America/Chicago'
        },
        '925': {
          state: 'CA',
          timezone: 'America/Los_Angeles'
        },
        '928': {
          state: 'AZ',
          timezone: 'America/Phoenix'
        },
        '929': {
          state: 'NY',
          timezone: 'America/New_York'
        },
        '931': {
          state: 'TN',
          timezone: 'America/Chicago'
        },
        '936': {
          state: 'TX',
          timezone: 'America/Chicago'
        },
        '937': {
          state: 'OH',
          timezone: 'America/New_York'
        },
        '940': {
          state: 'TX',
          timezone: 'America/Chicago'
        },
        '941': {
          state: 'FL',
          timezone: 'America/New_York'
        },
        '947': {
          state: 'MI',
          timezone: 'America/New_York'
        },
        '949': {
          state: 'CA',
          timezone: 'America/Los_Angeles'
        },
        '951': {
          state: 'CA',
          timezone: 'America/Los_Angeles'
        },
        '952': {
          state: 'MN',
          timezone: 'America/Chicago'
        },
        '954': {
          state: 'FL',
          timezone: 'America/New_York'
        },
        '956': {
          state: 'TX',
          timezone: 'America/Chicago'
        },
        '959': {
          state: 'CT',
          timezone: 'America/New_York'
        },
        '970': {
          state: 'CO',
          timezone: 'America/Denver'
        },
        '971': {
          state: 'OR',
          timezone: 'America/Los_Angeles'
        },
        '972': {
          state: 'TX',
          timezone: 'America/Chicago'
        },
        '973': {
          state: 'NJ',
          timezone: 'America/New_York'
        },
        '978': {
          state: 'MA',
          timezone: 'America/New_York'
        },
        '979': {
          state: 'TX',
          timezone: 'America/Chicago'
        },
        '980': {
          state: 'NC',
          timezone: 'America/New_York'
        },
        '984': {
          state: 'NC',
          timezone: 'America/New_York'
        },
        '985': {
          state: 'LA',
          timezone: 'America/Chicago'
        },
        '989': {
          state: 'MI',
          timezone: 'America/New_York'
        }
      };
      const info = stateMap[areaCode];
      if (info) {
        const now = new Date();
        const timeInZone = new Date(now.toLocaleString("en-US", {
          timeZone: info.timezone
        }));
        const timeString = timeInZone.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        return `${info.state} (${timeString})`;
      }
    }
    return '';
  };
  const getTimezoneGroup = (phone: string): 'EST' | 'CST' | 'OTHER' => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length >= 3) {
      const areaCode = digits.slice(0, 3);
      const stateMap: {
        [key: string]: {
          timezone: string;
        };
      } = {
        '201': {
          timezone: 'America/New_York'
        },
        '202': {
          timezone: 'America/New_York'
        },
        '203': {
          timezone: 'America/New_York'
        },
        '205': {
          timezone: 'America/Chicago'
        },
        '206': {
          timezone: 'America/Los_Angeles'
        },
        '207': {
          timezone: 'America/New_York'
        },
        '208': {
          timezone: 'America/Boise'
        },
        '209': {
          timezone: 'America/Los_Angeles'
        },
        '210': {
          timezone: 'America/Chicago'
        },
        '212': {
          timezone: 'America/New_York'
        },
        '213': {
          timezone: 'America/Los_Angeles'
        },
        '214': {
          timezone: 'America/Chicago'
        },
        '215': {
          timezone: 'America/New_York'
        },
        '216': {
          timezone: 'America/New_York'
        },
        '217': {
          timezone: 'America/Chicago'
        },
        '218': {
          timezone: 'America/Chicago'
        },
        '219': {
          timezone: 'America/New_York'
        },
        '224': {
          timezone: 'America/Chicago'
        },
        '225': {
          timezone: 'America/Chicago'
        },
        '228': {
          timezone: 'America/Chicago'
        },
        '229': {
          timezone: 'America/New_York'
        },
        '231': {
          timezone: 'America/New_York'
        },
        '234': {
          timezone: 'America/New_York'
        },
        '239': {
          timezone: 'America/New_York'
        },
        '240': {
          timezone: 'America/New_York'
        },
        '248': {
          timezone: 'America/New_York'
        },
        '251': {
          timezone: 'America/Chicago'
        },
        '252': {
          timezone: 'America/New_York'
        },
        '253': {
          timezone: 'America/Los_Angeles'
        },
        '254': {
          timezone: 'America/Chicago'
        },
        '256': {
          timezone: 'America/Chicago'
        },
        '260': {
          timezone: 'America/New_York'
        },
        '262': {
          timezone: 'America/Chicago'
        },
        '267': {
          timezone: 'America/New_York'
        },
        '269': {
          timezone: 'America/New_York'
        },
        '270': {
          timezone: 'America/Chicago'
        },
        '276': {
          timezone: 'America/New_York'
        },
        '281': {
          timezone: 'America/Chicago'
        },
        '301': {
          timezone: 'America/New_York'
        },
        '302': {
          timezone: 'America/New_York'
        },
        '303': {
          timezone: 'America/Denver'
        },
        '304': {
          timezone: 'America/New_York'
        },
        '305': {
          timezone: 'America/New_York'
        },
        '307': {
          timezone: 'America/Denver'
        },
        '308': {
          timezone: 'America/Chicago'
        },
        '309': {
          timezone: 'America/Chicago'
        },
        '310': {
          timezone: 'America/Los_Angeles'
        },
        '312': {
          timezone: 'America/Chicago'
        },
        '313': {
          timezone: 'America/New_York'
        },
        '314': {
          timezone: 'America/Chicago'
        },
        '315': {
          timezone: 'America/New_York'
        },
        '316': {
          timezone: 'America/Chicago'
        },
        '317': {
          timezone: 'America/New_York'
        },
        '318': {
          timezone: 'America/Chicago'
        },
        '319': {
          timezone: 'America/Chicago'
        },
        '320': {
          timezone: 'America/Chicago'
        },
        '321': {
          timezone: 'America/New_York'
        },
        '323': {
          timezone: 'America/Los_Angeles'
        },
        '330': {
          timezone: 'America/New_York'
        },
        '331': {
          timezone: 'America/Chicago'
        },
        '334': {
          timezone: 'America/Chicago'
        },
        '336': {
          timezone: 'America/New_York'
        },
        '337': {
          timezone: 'America/Chicago'
        },
        '339': {
          timezone: 'America/New_York'
        },
        '347': {
          timezone: 'America/New_York'
        },
        '351': {
          timezone: 'America/New_York'
        },
        '352': {
          timezone: 'America/New_York'
        },
        '360': {
          timezone: 'America/Los_Angeles'
        },
        '361': {
          timezone: 'America/Chicago'
        },
        '386': {
          timezone: 'America/New_York'
        },
        '401': {
          timezone: 'America/New_York'
        },
        '402': {
          timezone: 'America/Chicago'
        },
        '404': {
          timezone: 'America/New_York'
        },
        '405': {
          timezone: 'America/Chicago'
        },
        '406': {
          timezone: 'America/Denver'
        },
        '407': {
          timezone: 'America/New_York'
        },
        '408': {
          timezone: 'America/Los_Angeles'
        },
        '409': {
          timezone: 'America/Chicago'
        },
        '410': {
          timezone: 'America/New_York'
        },
        '412': {
          timezone: 'America/New_York'
        },
        '413': {
          timezone: 'America/New_York'
        },
        '414': {
          timezone: 'America/Chicago'
        },
        '415': {
          timezone: 'America/Los_Angeles'
        },
        '417': {
          timezone: 'America/Chicago'
        },
        '419': {
          timezone: 'America/New_York'
        },
        '423': {
          timezone: 'America/Chicago'
        },
        '424': {
          timezone: 'America/Los_Angeles'
        },
        '425': {
          timezone: 'America/Los_Angeles'
        },
        '430': {
          timezone: 'America/Chicago'
        },
        '432': {
          timezone: 'America/Chicago'
        },
        '434': {
          timezone: 'America/New_York'
        },
        '435': {
          timezone: 'America/Denver'
        },
        '440': {
          timezone: 'America/New_York'
        },
        '443': {
          timezone: 'America/New_York'
        },
        '458': {
          timezone: 'America/Los_Angeles'
        },
        '469': {
          timezone: 'America/Chicago'
        },
        '470': {
          timezone: 'America/New_York'
        },
        '475': {
          timezone: 'America/New_York'
        },
        '478': {
          timezone: 'America/New_York'
        },
        '479': {
          timezone: 'America/Chicago'
        },
        '480': {
          timezone: 'America/Phoenix'
        },
        '484': {
          timezone: 'America/New_York'
        },
        '501': {
          timezone: 'America/Chicago'
        },
        '502': {
          timezone: 'America/New_York'
        },
        '503': {
          timezone: 'America/Los_Angeles'
        },
        '504': {
          timezone: 'America/Chicago'
        },
        '505': {
          timezone: 'America/Denver'
        },
        '507': {
          timezone: 'America/Chicago'
        },
        '508': {
          timezone: 'America/New_York'
        },
        '509': {
          timezone: 'America/Los_Angeles'
        },
        '510': {
          timezone: 'America/Los_Angeles'
        },
        '512': {
          timezone: 'America/Chicago'
        },
        '513': {
          timezone: 'America/New_York'
        },
        '515': {
          timezone: 'America/Chicago'
        },
        '516': {
          timezone: 'America/New_York'
        },
        '517': {
          timezone: 'America/New_York'
        },
        '518': {
          timezone: 'America/New_York'
        },
        '520': {
          timezone: 'America/Phoenix'
        },
        '530': {
          timezone: 'America/Los_Angeles'
        },
        '540': {
          timezone: 'America/New_York'
        },
        '541': {
          timezone: 'America/Los_Angeles'
        },
        '551': {
          timezone: 'America/New_York'
        },
        '559': {
          timezone: 'America/Los_Angeles'
        },
        '561': {
          timezone: 'America/New_York'
        },
        '562': {
          timezone: 'America/Los_Angeles'
        },
        '563': {
          timezone: 'America/Chicago'
        },
        '567': {
          timezone: 'America/New_York'
        },
        '570': {
          timezone: 'America/New_York'
        },
        '571': {
          timezone: 'America/New_York'
        },
        '573': {
          timezone: 'America/Chicago'
        },
        '574': {
          timezone: 'America/New_York'
        },
        '575': {
          timezone: 'America/Denver'
        },
        '580': {
          timezone: 'America/Chicago'
        },
        '585': {
          timezone: 'America/New_York'
        },
        '586': {
          timezone: 'America/New_York'
        },
        '601': {
          timezone: 'America/Chicago'
        },
        '602': {
          timezone: 'America/Phoenix'
        },
        '603': {
          timezone: 'America/New_York'
        },
        '605': {
          timezone: 'America/Chicago'
        },
        '606': {
          timezone: 'America/New_York'
        },
        '607': {
          timezone: 'America/New_York'
        },
        '608': {
          timezone: 'America/Chicago'
        },
        '609': {
          timezone: 'America/New_York'
        },
        '610': {
          timezone: 'America/New_York'
        },
        '612': {
          timezone: 'America/Chicago'
        },
        '614': {
          timezone: 'America/New_York'
        },
        '615': {
          timezone: 'America/Chicago'
        },
        '616': {
          timezone: 'America/New_York'
        },
        '617': {
          timezone: 'America/New_York'
        },
        '618': {
          timezone: 'America/Chicago'
        },
        '619': {
          timezone: 'America/Los_Angeles'
        },
        '620': {
          timezone: 'America/Chicago'
        },
        '623': {
          timezone: 'America/Phoenix'
        },
        '626': {
          timezone: 'America/Los_Angeles'
        },
        '630': {
          timezone: 'America/Chicago'
        },
        '631': {
          timezone: 'America/New_York'
        },
        '636': {
          timezone: 'America/Chicago'
        },
        '641': {
          timezone: 'America/Chicago'
        },
        '646': {
          timezone: 'America/New_York'
        },
        '650': {
          timezone: 'America/Los_Angeles'
        },
        '651': {
          timezone: 'America/Chicago'
        },
        '660': {
          timezone: 'America/Chicago'
        },
        '661': {
          timezone: 'America/Los_Angeles'
        },
        '662': {
          timezone: 'America/Chicago'
        },
        '678': {
          timezone: 'America/New_York'
        },
        '682': {
          timezone: 'America/Chicago'
        },
        '701': {
          timezone: 'America/Chicago'
        },
        '702': {
          timezone: 'America/Los_Angeles'
        },
        '703': {
          timezone: 'America/New_York'
        },
        '704': {
          timezone: 'America/New_York'
        },
        '706': {
          timezone: 'America/New_York'
        },
        '707': {
          timezone: 'America/Los_Angeles'
        },
        '708': {
          timezone: 'America/Chicago'
        },
        '712': {
          timezone: 'America/Chicago'
        },
        '713': {
          timezone: 'America/Chicago'
        },
        '714': {
          timezone: 'America/Los_Angeles'
        },
        '715': {
          timezone: 'America/Chicago'
        },
        '716': {
          timezone: 'America/New_York'
        },
        '717': {
          timezone: 'America/New_York'
        },
        '718': {
          timezone: 'America/New_York'
        },
        '719': {
          timezone: 'America/Denver'
        },
        '720': {
          timezone: 'America/Denver'
        },
        '724': {
          timezone: 'America/New_York'
        },
        '727': {
          timezone: 'America/New_York'
        },
        '731': {
          timezone: 'America/Chicago'
        },
        '732': {
          timezone: 'America/New_York'
        },
        '734': {
          timezone: 'America/New_York'
        },
        '737': {
          timezone: 'America/Chicago'
        },
        '740': {
          timezone: 'America/New_York'
        },
        '757': {
          timezone: 'America/New_York'
        },
        '760': {
          timezone: 'America/Los_Angeles'
        },
        '763': {
          timezone: 'America/Chicago'
        },
        '765': {
          timezone: 'America/New_York'
        },
        '770': {
          timezone: 'America/New_York'
        },
        '772': {
          timezone: 'America/New_York'
        },
        '773': {
          timezone: 'America/Chicago'
        },
        '774': {
          timezone: 'America/New_York'
        },
        '775': {
          timezone: 'America/Los_Angeles'
        },
        '781': {
          timezone: 'America/New_York'
        },
        '785': {
          timezone: 'America/Chicago'
        },
        '786': {
          timezone: 'America/New_York'
        },
        '801': {
          timezone: 'America/Denver'
        },
        '802': {
          timezone: 'America/New_York'
        },
        '803': {
          timezone: 'America/New_York'
        },
        '804': {
          timezone: 'America/New_York'
        },
        '805': {
          timezone: 'America/Los_Angeles'
        },
        '806': {
          timezone: 'America/Chicago'
        },
        '808': {
          timezone: 'Pacific/Honolulu'
        },
        '810': {
          timezone: 'America/New_York'
        },
        '812': {
          timezone: 'America/New_York'
        },
        '813': {
          timezone: 'America/New_York'
        },
        '814': {
          timezone: 'America/New_York'
        },
        '815': {
          timezone: 'America/Chicago'
        },
        '816': {
          timezone: 'America/Chicago'
        },
        '817': {
          timezone: 'America/Chicago'
        },
        '818': {
          timezone: 'America/Los_Angeles'
        },
        '828': {
          timezone: 'America/New_York'
        },
        '830': {
          timezone: 'America/Chicago'
        },
        '831': {
          timezone: 'America/Los_Angeles'
        },
        '832': {
          timezone: 'America/Chicago'
        },
        '843': {
          timezone: 'America/New_York'
        },
        '845': {
          timezone: 'America/New_York'
        },
        '847': {
          timezone: 'America/Chicago'
        },
        '850': {
          timezone: 'America/Chicago'
        },
        '856': {
          timezone: 'America/New_York'
        },
        '857': {
          timezone: 'America/New_York'
        },
        '858': {
          timezone: 'America/Los_Angeles'
        },
        '859': {
          timezone: 'America/New_York'
        },
        '860': {
          timezone: 'America/New_York'
        },
        '862': {
          timezone: 'America/New_York'
        },
        '863': {
          timezone: 'America/New_York'
        },
        '864': {
          timezone: 'America/New_York'
        },
        '865': {
          timezone: 'America/New_York'
        },
        '870': {
          timezone: 'America/Chicago'
        },
        '872': {
          timezone: 'America/Chicago'
        },
        '878': {
          timezone: 'America/New_York'
        },
        '901': {
          timezone: 'America/Chicago'
        },
        '903': {
          timezone: 'America/Chicago'
        },
        '904': {
          timezone: 'America/New_York'
        },
        '906': {
          timezone: 'America/New_York'
        },
        '907': {
          timezone: 'America/Anchorage'
        },
        '908': {
          timezone: 'America/New_York'
        },
        '909': {
          timezone: 'America/Los_Angeles'
        },
        '910': {
          timezone: 'America/New_York'
        },
        '912': {
          timezone: 'America/New_York'
        },
        '913': {
          timezone: 'America/Chicago'
        },
        '914': {
          timezone: 'America/New_York'
        },
        '915': {
          timezone: 'America/Denver'
        },
        '916': {
          timezone: 'America/Los_Angeles'
        },
        '917': {
          timezone: 'America/New_York'
        },
        '918': {
          timezone: 'America/Chicago'
        },
        '919': {
          timezone: 'America/New_York'
        },
        '920': {
          timezone: 'America/Chicago'
        },
        '925': {
          timezone: 'America/Los_Angeles'
        },
        '928': {
          timezone: 'America/Phoenix'
        },
        '929': {
          timezone: 'America/New_York'
        },
        '931': {
          timezone: 'America/Chicago'
        },
        '936': {
          timezone: 'America/Chicago'
        },
        '937': {
          timezone: 'America/New_York'
        },
        '940': {
          timezone: 'America/Chicago'
        },
        '941': {
          timezone: 'America/New_York'
        },
        '947': {
          timezone: 'America/New_York'
        },
        '949': {
          timezone: 'America/Los_Angeles'
        },
        '951': {
          timezone: 'America/Los_Angeles'
        },
        '952': {
          timezone: 'America/Chicago'
        },
        '954': {
          timezone: 'America/New_York'
        },
        '956': {
          timezone: 'America/Chicago'
        },
        '959': {
          timezone: 'America/New_York'
        },
        '970': {
          timezone: 'America/Denver'
        },
        '971': {
          timezone: 'America/Los_Angeles'
        },
        '972': {
          timezone: 'America/Chicago'
        },
        '973': {
          timezone: 'America/New_York'
        },
        '978': {
          timezone: 'America/New_York'
        },
        '979': {
          timezone: 'America/Chicago'
        },
        '980': {
          timezone: 'America/New_York'
        },
        '984': {
          timezone: 'America/New_York'
        },
        '985': {
          timezone: 'America/Chicago'
        },
        '989': {
          timezone: 'America/New_York'
        }
      };
      const info = stateMap[areaCode];
      if (info) {
        if (info.timezone === 'America/New_York') return 'EST';
        if (info.timezone === 'America/Chicago') return 'CST';
      }
    }
    return 'OTHER';
  };
  const filterLeadsByTimezone = (leads: Lead[]): Lead[] => {
    if (timezoneFilter === 'ALL') return leads;
    return leads.filter(lead => {
      const timezoneGroup = getTimezoneGroup(lead.phone);
      return timezoneGroup === 'EST' || timezoneGroup === 'CST';
    });
  };
  const handleCall = () => {
    const baseLeads = getBaseLeads();
    const currentLead = baseLeads[currentIndex];
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
    const baseLeads = getBaseLeads();
    let nextIndex;
    if (shuffleMode) {
      do {
        nextIndex = Math.floor(Math.random() * baseLeads.length);
      } while (nextIndex === currentIndex && baseLeads.length > 1);
    } else {
      nextIndex = (currentIndex + 1) % baseLeads.length;
    }
    setCurrentIndex(nextIndex);
    setCardKey(prev => prev + 1);
    const newHistory = navigationHistory.slice(0, historyIndex + 1);
    newHistory.push(nextIndex);
    setNavigationHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    if (autoCall && baseLeads[nextIndex]) {
      const phoneNumber = baseLeads[nextIndex].phone.replace(/\D/g, '');
      window.location.href = `tel:${phoneNumber}`;
    }
  };
  const handlePrevious = () => {
    if (historyIndex > 0) {
      const newHistoryIndex = historyIndex - 1;
      const prevIndex = navigationHistory[newHistoryIndex];
      setCurrentIndex(prevIndex);
      setHistoryIndex(newHistoryIndex);
      setCardKey(prev => prev + 1);
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
    const baseLeads = getBaseLeads();
    const leadIndex = baseLeads.findIndex(l => l.name === lead.name && l.phone === lead.phone);
    if (leadIndex !== -1) {
      setCurrentIndex(leadIndex);
      setNavigationHistory([leadIndex]);
      setHistoryIndex(0);
      setSearchQuery('');
      setShowAutocomplete(false);
      setCardKey(prev => prev + 1);
    }
  };
  const toggleTimezoneFilter = () => {
    setTimezoneFilter(timezoneFilter === 'ALL' ? 'EST_CST' : 'ALL');
  };
  const toggleCallFilter = () => {
    setCallFilter(callFilter === 'ALL' ? 'UNCALLED' : 'ALL');
  };

  // Use base leads for main navigation, search results for autocomplete
  const baseLeads = getBaseLeads();
  const currentLead = baseLeads[currentIndex];
  if (leadsData.length === 0) {
    return <div className="h-screen h-[100vh] h-[100svh] bg-background overflow-hidden">
        <div className="bg-background border-b border-border p-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold">
                <span className="text-blue-500">Cold</span>
                <span className="text-foreground">Caller </span>
                <span className="text-blue-500">X</span>
              </h1>
            </div>
          </div>
        </div>

        <div className="p-6 text-center">
          <p className="text-lg text-muted-foreground">No leads imported</p>
        </div>
      </div>;
  }
  if (!currentLead) {
    return <div className="h-screen h-[100vh] h-[100svh] bg-background flex items-center justify-center p-4 overflow-hidden">
        <Card className="w-full max-w-md shadow-lg rounded-2xl">
          <CardContent className="p-8 text-center">
            <p className="text-lg">No leads found</p>
            <Button onClick={onBack} className="mt-4 rounded-xl">Back to Import</Button>
          </CardContent>
        </Card>
      </div>;
  }

  // Calculate the actual index in the original array
  const actualLeadIndex = leadsData.findIndex(lead => lead.name === currentLead.name && lead.phone === currentLead.phone) + 1;

  // Get the total count based on current filters
  const totalLeadCount = baseLeads.length;
  return <div className="h-screen h-[100vh] h-[100svh] bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-background border-b border-border p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <CSVImporter onLeadsImported={onLeadsImported} />
          
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold">
              <span className="text-blue-500">Cold</span>
              <span className="text-foreground">Caller </span>
              <span className="text-blue-500">X</span>
            </h1>
          </div>
          
          <ThemeToggle />
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} onSearchFocus={handleSearchFocus} onSearchBlur={handleSearchBlur} onClearSearch={clearSearch} fileName={fileName} />
          
          {/* Autocomplete Dropdown */}
          {showAutocomplete && <SearchAutocomplete leads={searchResults} onLeadSelect={handleLeadSelect} searchQuery={searchQuery} actualIndices={searchResults.map(lead => leadsData.findIndex(l => l.name === lead.name && l.phone === lead.phone) + 1)} totalLeads={leadsData.length} />}
        </div>
      </div>

      {/* Main Content - Better centering for mobile app */}
      <div className="flex-1 flex items-center justify-center p-4 min-h-0 px-6">
        <div className="w-full max-w-sm space-y-4">
          {/* Filter Buttons - Centered relative to Previous and Next buttons */}
          <div className="flex">
            <div className="flex-1 flex justify-center">
              <button onClick={toggleTimezoneFilter} className={`text-sm font-medium px-3 py-1 rounded transition-colors ${timezoneFilter === 'EST_CST' ? 'text-blue-600' : 'text-muted-foreground'}`} style={{
              WebkitTapHighlightColor: 'transparent'
            }}>
                {timezoneFilter === 'ALL' ? 'All States' : 'EST & CST'}
              </button>
            </div>
            <div className="flex-1 flex justify-center">
              <button onClick={toggleCallFilter} className={`text-sm font-medium px-3 py-1 rounded transition-colors ${callFilter === 'UNCALLED' ? 'text-blue-600' : 'text-muted-foreground'}`} style={{
              WebkitTapHighlightColor: 'transparent'
            }}>
                {callFilter === 'ALL' ? 'All Numbers' : 'Uncalled Numbers'}
              </button>
            </div>
          </div>

          {/* Current Lead Card */}
          <Card key={cardKey} className="shadow-2xl border-border/50 rounded-3xl bg-card h-[400px] flex flex-col animate-scale-in">
            <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
              {/* Top row with lead count and file name */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {currentIndex + 1}/{totalLeadCount}
                </p>
                <p className="text-sm text-muted-foreground opacity-40">
                  {fileName}
                </p>
              </div>

              {/* Lead info - Main content area */}
              <div className="text-center space-y-3 flex-1 flex flex-col justify-center">
                <h2 className="text-3xl font-bold text-foreground">{currentLead.name}</h2>
                
                <div className="relative flex justify-center">
                  <Phone className="h-4 w-4 text-muted-foreground absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-6 mx-[80px] py-0 px-0 my-[4px]" />
                  <p className="text-lg text-muted-foreground">{formatPhoneNumber(currentLead.phone)}</p>
                </div>
                
                {/* State and timezone */}
                <p className="text-sm text-muted-foreground">
                  {getStateFromAreaCode(currentLead.phone)}
                </p>
                
                <p className="text-sm text-muted-foreground">
                  Called: {currentLead.called || 0} times
                </p>
                {currentLead.lastCalled && <p className="text-sm text-muted-foreground">
                    Last called: {currentLead.lastCalled}
                  </p>}
              </div>

              {/* Main Call Button - ensure it's always green */}
              <Button onClick={handleCall} size="lg" className="w-full h-16 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white rounded-2xl shadow-lg">
                <Phone className="h-6 w-6 mr-2" />
                Call
              </Button>
            </CardContent>
          </Card>

          {/* Navigation Controls */}
          <div className="space-y-4">
            {/* Previous/Next Navigation */}
            <div className="flex gap-4">
              <Button variant="outline" onClick={handlePrevious} disabled={historyIndex <= 0} className="flex-1 h-12 rounded-2xl shadow-lg active:scale-95 transition-all duration-100 select-none outline-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0" style={{
              WebkitTapHighlightColor: 'transparent'
            }} onTouchStart={() => {}} onTouchEnd={() => {}}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <Button variant="outline" onClick={handleNext} disabled={baseLeads.length <= 1} className="flex-1 h-12 rounded-2xl shadow-lg active:scale-95 transition-all duration-100 select-none outline-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0" style={{
              WebkitTapHighlightColor: 'transparent'
            }} onTouchStart={() => {}} onTouchEnd={() => {}}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center space-y-1 flex-1">
                <button onClick={toggleShuffle} disabled={baseLeads.length <= 1} className={`text-sm font-medium px-3 py-1 rounded transition-colors disabled:opacity-50 ${shuffleMode ? 'text-orange-500' : 'text-muted-foreground'}`} style={{
                WebkitTapHighlightColor: 'transparent'
              }}>
                  Shuffle
                </button>
              </div>
              
              <div className="flex flex-col items-center space-y-1 flex-1">
                <button onClick={toggleAutoCall} className={`text-sm font-medium px-3 py-1 rounded transition-colors ${autoCall ? 'text-green-600' : 'text-muted-foreground'}`} style={{
                WebkitTapHighlightColor: 'transparent'
              }}>
                  Auto Call
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default CallingScreen;