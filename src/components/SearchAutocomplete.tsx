
import React, { useEffect, useState } from 'react';
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
  isVisible: boolean;
  onAnimationComplete?: () => void;
}

const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({ 
  leads, 
  onLeadSelect, 
  searchQuery, 
  actualIndices,
  totalLeads,
  isVisible,
  onAnimationComplete
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setIsAnimating(true);
    } else if (shouldRender) {
      setIsAnimating(false);
      // Even faster close animation - reduced from 50ms to 30ms
      const timer = setTimeout(() => {
        setShouldRender(false);
        onAnimationComplete?.();
      }, 30); // Match even faster animation duration
      return () => clearTimeout(timer);
    }
  }, [isVisible, shouldRender, onAnimationComplete]);

  if (!shouldRender) {
    return null;
  }

  const animationClass = isAnimating ? 'animate-slide-down-fast' : 'animate-slide-up-fastest';

  if (leads.length === 0) {
    return (
      <div className={`absolute top-full left-0 right-0 z-50 mt-1 p-4 text-center text-muted-foreground rounded-xl shadow-lg ${animationClass} bg-background/15 backdrop-blur-sm border border-border/15`}>
        No leads found
      </div>
    );
  }

  return (
    <div className={`absolute top-full left-0 right-0 z-50 mt-1 rounded-xl shadow-lg overflow-hidden ${animationClass} bg-background/15 backdrop-blur-sm border border-border/15`}>
      <div className="max-h-60 overflow-y-auto">
        {leads.map((lead, index) => (
          <button
            key={`${lead.name}-${lead.phone}-${index}`}
            onClick={() => onLeadSelect(lead)}
            className="w-full px-4 py-3 text-left border-b border-border/10 last:border-b-0 transition-colors duration-75 cursor-default hover:bg-muted/50"
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
