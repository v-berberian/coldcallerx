
import React from 'react';
import { Card } from '@/components/ui/card';

interface Lead {
  name: string;
  phone: string;
  called?: number;
}

interface SearchAutocompleteProps {
  leads: Lead[];
  onLeadSelect: (lead: Lead) => void;
  searchQuery: string;
  actualIndices: number[];
  totalLeads: number;
}

const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({ 
  leads, 
  onLeadSelect, 
  searchQuery, 
  actualIndices,
  totalLeads
}) => {
  if (leads.length === 0) {
    return (
      <Card 
        className="absolute top-full left-0 right-0 z-50 mt-1 p-4 text-center rounded-xl shadow-2xl overflow-hidden animate-fade-in bg-white/10 backdrop-blur-xl border border-white/20"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)'
        }}
      >
        <span className="text-white/70">No leads found</span>
      </Card>
    );
  }

  return (
    <Card 
      className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl shadow-2xl overflow-hidden animate-fade-in bg-white/10 backdrop-blur-xl border border-white/20"
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)'
      }}
    >
      <div className="max-h-60 overflow-y-auto">
        {leads.map((lead, index) => (
          <button
            key={`${lead.name}-${lead.phone}-${index}`}
            onClick={() => onLeadSelect(lead)}
            className="w-full px-4 py-3 text-left border-b border-white/10 last:border-b-0 hover:bg-white/10 transition-all duration-200"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{lead.name}</p>
                <p className="text-sm text-white/70">{lead.phone}</p>
              </div>
              <div className="ml-2 text-xs text-white/60">
                {actualIndices[index]}/{totalLeads}
              </div>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
};

export default SearchAutocomplete;
