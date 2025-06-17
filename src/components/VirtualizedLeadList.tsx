
import React, { useMemo, useState, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Lead } from '../types/lead';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Mail } from 'lucide-react';
import { formatPhoneNumber } from '../utils/phoneUtils';
import { getStateFromAreaCode } from '../utils/timezoneUtils';

interface VirtualizedLeadListProps {
  leads: Lead[];
  onLeadSelect: (index: number) => void;
  currentIndex: number;
  searchQuery?: string;
}

interface LeadRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    leads: Lead[];
    onLeadSelect: (index: number) => void;
    currentIndex: number;
  };
}

const LeadRow: React.FC<LeadRowProps> = ({ index, style, data }) => {
  const { leads, onLeadSelect, currentIndex } = data;
  const lead = leads[index];
  
  if (!lead) return <div style={style} />;

  const isSelected = index === currentIndex;
  const cleanPhone = lead.phone.replace(/\D/g, '');
  const leadState = getStateFromAreaCode(cleanPhone);

  return (
    <div style={style} className="px-2 py-1">
      <Card 
        className={`cursor-pointer transition-colors hover:bg-muted/50 ${
          isSelected ? 'bg-muted border-primary' : ''
        }`}
        onClick={() => onLeadSelect(index)}
      >
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm truncate">{lead.name}</h3>
                {leadState && (
                  <span className="text-xs text-muted-foreground">{leadState}</span>
                )}
              </div>
              {lead.company && (
                <p className="text-xs text-muted-foreground truncate">{lead.company}</p>
              )}
              <div className="flex items-center gap-2 mt-1">
                <Phone className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs">{formatPhoneNumber(lead.phone)}</span>
                {lead.email && (
                  <>
                    <Mail className="h-3 w-3 text-muted-foreground ml-2" />
                    <span className="text-xs truncate">{lead.email}</span>
                  </>
                )}
              </div>
              {lead.lastCalled && (
                <p className="text-xs text-green-600 mt-1">Called: {lead.lastCalled}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const VirtualizedLeadList: React.FC<VirtualizedLeadListProps> = ({
  leads,
  onLeadSelect,
  currentIndex,
  searchQuery
}) => {
  const filteredLeads = useMemo(() => {
    if (!searchQuery || searchQuery.trim() === '') {
      return leads;
    }
    
    const query = searchQuery.toLowerCase();
    return leads.filter(lead => 
      lead.name.toLowerCase().includes(query) ||
      lead.phone.includes(query) ||
      (lead.company && lead.company.toLowerCase().includes(query)) ||
      (lead.email && lead.email.toLowerCase().includes(query))
    );
  }, [leads, searchQuery]);

  const itemData = useMemo(() => ({
    leads: filteredLeads,
    onLeadSelect,
    currentIndex
  }), [filteredLeads, onLeadSelect, currentIndex]);

  return (
    <div className="h-full">
      <List
        height={600}
        itemCount={filteredLeads.length}
        itemSize={120}
        itemData={itemData}
      >
        {LeadRow}
      </List>
    </div>
  );
};

export default VirtualizedLeadList;
