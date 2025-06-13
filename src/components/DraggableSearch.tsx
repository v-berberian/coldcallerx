
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Lead } from '../types/lead';
import { formatPhoneNumber } from '../utils/phoneUtils';
import { getStateFromAreaCode } from '../utils/timezoneUtils';

interface DraggableSearchProps {
  searchQuery: string;
  searchResults: Lead[];
  leadsData: Lead[];
  fileName: string;
  onSearchChange: (query: string) => void;
  onLeadSelect: (lead: Lead) => void;
  onClose: () => void;
}

const DraggableSearch: React.FC<DraggableSearchProps> = ({
  searchQuery,
  searchResults,
  leadsData,
  fileName,
  onSearchChange,
  onLeadSelect,
  onClose
}) => {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const startDragY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    startY.current = e.touches[0].clientY;
    startDragY.current = dragY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY.current;
    const newDragY = Math.max(-window.innerHeight * 0.8, Math.min(0, startDragY.current + deltaY));
    setDragY(newDragY);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    // Snap to positions
    if (dragY < -window.innerHeight * 0.4) {
      setDragY(-window.innerHeight * 0.8);
      setIsExpanded(true);
    } else if (dragY > -50) {
      onClose();
    } else {
      setDragY(0);
      setIsExpanded(false);
    }
  };

  const containerHeight = isExpanded ? '80vh' : '60vh';
  const transform = `translateY(${dragY}px)`;

  return (
    <div className="fixed inset-0 z-50 bg-black/20" onClick={onClose}>
      <Card 
        ref={dragRef}
        className="absolute bottom-0 left-0 right-0 rounded-t-xl shadow-2xl bg-background"
        style={{ 
          height: containerHeight, 
          transform,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="p-4 border-b border-border">
          {/* Drag handle */}
          <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-4" />
          
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Search Leads</h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name or phone..."
              className="pl-10"
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {searchResults.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {searchQuery ? 'No leads found' : 'Start typing to search...'}
            </div>
          ) : (
            <div className="space-y-2">
              {searchResults.map((lead, index) => {
                const actualIndex = leadsData.findIndex(l => 
                  l.name === lead.name && l.phone === lead.phone
                ) + 1;
                
                return (
                  <button
                    key={`${lead.name}-${lead.phone}-${index}`}
                    onClick={() => onLeadSelect(lead)}
                    className="w-full p-4 text-left border border-border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{lead.name}</p>
                        {lead.company && (
                          <p className="text-sm text-muted-foreground truncate">{lead.company}</p>
                        )}
                        <p className="text-sm text-muted-foreground">{formatPhoneNumber(lead.phone)}</p>
                        {lead.position && (
                          <p className="text-xs text-muted-foreground truncate">{lead.position}</p>
                        )}
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-muted-foreground">
                            {getStateFromAreaCode(lead.phone)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Called: {lead.called || 0} times
                          </span>
                        </div>
                      </div>
                      <div className="ml-2 text-xs text-muted-foreground">
                        {actualIndex}/{leadsData.length}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default DraggableSearch;
