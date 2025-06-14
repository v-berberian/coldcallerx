
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { formatPhoneNumber } from '../utils/phoneUtils';
import { getStateFromAreaCode } from '../utils/timezoneUtils';

interface Lead {
  name: string;
  phone: string;
  company?: string;
  called?: number;
  lastCalled?: string;
}

interface LeadCardProps {
  lead: Lead;
  currentIndex: number;
  totalCount: number;
  fileName: string;
  onCall: () => void;
  onResetCallCount: () => void;
}

const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  currentIndex,
  totalCount,
  fileName,
  onCall,
  onResetCallCount
}) => {
  // Use stable key based on lead data instead of changing cardKey
  const leadKey = `${lead.name}-${lead.phone}`;
  
  return (
    <Card key={leadKey} className="shadow-2xl border-border/50 rounded-3xl bg-card h-[400px] flex flex-col animate-scale-in">
      <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
        {/* Top row with lead count and file name */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground opacity-40">
            {currentIndex + 1}/{totalCount}
          </p>
          <p className="text-sm text-muted-foreground opacity-40">
            {fileName}
          </p>
        </div>

        {/* Lead info - Main content area with animation */}
        <div key={leadKey} className="text-center space-y-3 flex-1 flex flex-col justify-center animate-content-change">
          {/* State and timezone - moved to top with same font size as "Called: times" */}
          <p className="text-sm text-muted-foreground">
            {getStateFromAreaCode(lead.phone)}
          </p>
          
          <h2 className="text-3xl font-bold text-foreground">{lead.name}</h2>
          
          {/* Company name - displayed between name and phone */}
          {lead.company && (
            <p className="text-lg text-muted-foreground font-medium">{lead.company}</p>
          )}
          
          <p className="text-lg text-muted-foreground text-center">{formatPhoneNumber(lead.phone)}</p>
          
          <div className="relative flex flex-col items-center space-y-3">
            <div className="flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Called: {lead.called || 0} times
              </p>
              {(lead.called || 0) > 0 && (
                <button
                  onClick={onResetCallCount}
                  className="ml-2 p-1 bg-muted rounded transition-colors"
                  title="Reset call count"
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                </button>
              )}
            </div>
            {/* Reserve space for last called text to prevent layout shift */}
            <div className="h-5 flex items-center justify-center">
              {lead.lastCalled && (
                <p className="text-sm text-muted-foreground transition-opacity duration-300 ease-in-out opacity-100 whitespace-nowrap">
                  Last called: {lead.lastCalled}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Main Call Button - with fixed hover styles */}
        <Button 
          onClick={onCall} 
          size="lg" 
          className="w-full h-16 text-lg font-semibold bg-green-600 hover:bg-green-600 text-white rounded-2xl shadow-lg"
        >
          Call
        </Button>
      </CardContent>
    </Card>
  );
};

export default LeadCard;
