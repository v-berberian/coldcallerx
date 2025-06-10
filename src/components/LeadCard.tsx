
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, RotateCcw } from 'lucide-react';
import { formatPhoneNumber } from '../utils/phoneUtils';

interface Lead {
  name: string;
  phone: string;
  called?: number;
  lastCalled?: string;
}

interface LeadCardProps {
  lead: Lead;
  currentIndex: number;
  totalCount: number;
  fileName: string;
  cardKey: number;
  onCall: () => void;
  onResetCallCount: () => void;
}

const LeadCard: React.FC<LeadCardProps> = ({ 
  lead, 
  currentIndex, 
  totalCount, 
  fileName, 
  cardKey, 
  onCall, 
  onResetCallCount
}) => {
  return (
    <Card 
      key={cardKey} 
      className="w-full shadow-lg rounded-2xl animate-content-change border-2"
    >
      <CardContent className="p-6 text-center">
        <div className="text-xs text-muted-foreground mb-2 font-medium">
          {currentIndex + 1} of {totalCount} • {fileName}
        </div>
        <div className="text-2xl font-bold mb-1">{lead.name}</div>
        <div className="text-lg text-muted-foreground mb-4">
          {formatPhoneNumber(lead.phone)}
        </div>
        
        <div className="flex items-center justify-center gap-2 mb-4 text-sm text-muted-foreground">
          <span>Called: {lead.called || 0} time{(lead.called || 0) !== 1 ? 's' : ''}</span>
          {(lead.called || 0) > 0 && (
            <button
              onClick={onResetCallCount}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              title="Reset call count"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>

        {lead.lastCalled && (
          <div className="text-xs text-muted-foreground mb-4">
            Last called: {lead.lastCalled}
          </div>
        )}
        
        <Button 
          onClick={onCall} 
          className="w-full text-lg py-6 rounded-xl font-semibold bg-green-600 hover:bg-green-700"
        >
          <Phone className="mr-2 h-5 w-5" />
          Call
        </Button>
      </CardContent>
    </Card>
  );
};

export default LeadCard;
