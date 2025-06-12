
import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { Lead } from '../types/lead';
import SearchAutocomplete from './SearchAutocomplete';
import SearchBar from './SearchBar';
import SettingsModal from './SettingsModal';
import ListSelector from './ListSelector';
import { useAuth } from '@/hooks/useAuth';

interface LeadList {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface CallingHeaderProps {
  searchQuery: string;
  showAutocomplete: boolean;
  searchResults: Lead[];
  leadsData: Lead[];
  leadLists: LeadList[];
  currentListId: string | null;
  onSearchChange: (query: string) => void;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  onClearSearch: () => void;
  onLeadSelect: (lead: Lead) => void;
  onLeadsImported: (leads: Lead[], fileName: string) => void;
  onSelectList: (listId: string) => void;
  onCreateList: (name: string, leads: Lead[]) => void;
  onDeleteList: (listId: string) => void;
}

const CallingHeader: React.FC<CallingHeaderProps> = ({
  searchQuery,
  showAutocomplete,
  searchResults,
  leadsData,
  leadLists,
  currentListId,
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
  onClearSearch,
  onLeadSelect,
  onLeadsImported,
  onSelectList,
  onCreateList,
  onDeleteList
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showListSelector, setShowListSelector] = useState(false);
  const { user } = useAuth();

  return (
    <div className="bg-background border-b border-border p-4 pt-safe flex-shrink-0" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="w-12" /> {/* Spacer for alignment */}
        
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold">
            <span className="text-blue-500">Cold</span>
            <span className="text-foreground">Caller </span>
            <span className="text-blue-500">X</span>
          </h1>
        </div>
        
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 rounded-lg transition-none text-muted-foreground hover:text-foreground"
          title="Settings"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
      
      {/* Search Bar */}
      <div className="relative">
        <SearchBar 
          searchQuery={searchQuery} 
          onSearchChange={onSearchChange} 
          onSearchFocus={onSearchFocus} 
          onSearchBlur={onSearchBlur} 
          onClearSearch={onClearSearch} 
        />
        
        {/* Autocomplete Dropdown */}
        {showAutocomplete && (
          <SearchAutocomplete 
            leads={searchResults} 
            onLeadSelect={onLeadSelect} 
            searchQuery={searchQuery} 
            actualIndices={searchResults.map(lead => 
              leadsData.findIndex(l => l.name === lead.name && l.phone === lead.phone) + 1
            )} 
            totalLeads={leadsData.length} 
          />
        )}
      </div>

      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        userEmail={user?.email}
        onManageLeadLists={() => setShowListSelector(true)}
      />

      <ListSelector
        isOpen={showListSelector}
        onClose={() => setShowListSelector(false)}
        leadLists={leadLists}
        currentListId={currentListId}
        onSelectList={onSelectList}
        onCreateList={onCreateList}
        onDeleteList={onDeleteList}
      />
    </div>
  );
};

export default CallingHeader;
