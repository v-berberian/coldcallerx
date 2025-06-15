
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
  isClosing?: boolean;
}

const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({ 
  leads, 
  onLeadSelect, 
  searchQuery, 
  actualIndices,
  totalLeads,
  isClosing = false
}) => {
  const animationClass = isClosing ? 'animate-fade-out' : 'animate-fade-in';

  if (leads.length === 0) {
    return (
      <div className={`absolute top-full left-0 right-0 z-50 mt-1 p-4 text-center text-muted-foreground rounded-xl shadow-lg ${animationClass} bg-background/1 backdrop-blur-md border border-border/1`}>
        No leads found
      </div>
    );
  }

  return (
    <div className={`absolute top-full left-0 right-0 z-50 mt-1 rounded-xl shadow-lg overflow-hidden ${animationClass} bg-background/1 backdrop-blur-md border border-border/1`}>
      <div className="max-h-60 overflow-y-auto">
        {leads.map((lead, index) => (
          <button
            key={`${lead.name}-${lead.phone}-${index}`}
            onClick={() => onLeadSelect(lead)}
            className="w-full px-4 py-3 text-left border-b border-border/1 last:border-b-0 hover:bg-background/2 transition-colors duration-150"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{lead.name}</p>
                <p className="text-sm text-muted-foreground">{lead.phone}</p>
              </div>
              <div className="ml-2 text-xs text-muted-foreground">
                {actualIndices[index]}/{totalLeads}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchAutocomplete;
