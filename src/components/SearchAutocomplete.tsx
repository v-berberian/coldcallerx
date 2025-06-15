
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Lead } from '../types/lead';

interface SearchAutocompleteProps {
  results: Lead[];
  onLeadSelect: (lead: Lead) => void;
  leadsData: Lead[];
}

const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({ 
  results, 
  onLeadSelect, 
  leadsData
}) => {
  if (results.length === 0) {
    return (
      <div className="absolute top-full left-0 right-0 z-50 mt-1 p-4 text-center text-muted-foreground rounded-xl shadow-lg bg-background/15 backdrop-blur-sm border border-border/15">
        No leads found
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl shadow-lg overflow-hidden bg-background/15 backdrop-blur-sm border border-border/15">
      <div className="max-h-60 overflow-y-auto">
        {results.map((lead, index) => (
          <button
            key={`${lead.name}-${lead.phone}-${index}`}
            onClick={() => onLeadSelect(lead)}
            className="w-full px-4 py-3 text-left border-b border-border/10 last:border-b-0 transition-colors duration-150 cursor-default hover:bg-muted/50"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{lead.name}</p>
                <p className="text-sm text-muted-foreground">{lead.phone}</p>
              </div>
              <div className="ml-2 text-xs text-muted-foreground">
                {index + 1}/{results.length}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchAutocomplete;
