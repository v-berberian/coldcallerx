
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Phone } from 'lucide-react';
import { formatPhoneNumber } from '../utils/phoneUtils';
import { getStateFromAreaCode } from '../utils/timezoneUtils';

interface Lead {
  name: string;
  phone: string;
  company?: string;
  email?: string;
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
    <Card className="shadow-2xl border-border/50 rounded-3xl bg-card h-[480px] flex flex-col">
      <CardContent className="p-8 space-y-6 flex-1 flex flex-col">
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
        <div key={leadKey} className="text-center space-y-4 flex-1 flex flex-col justify-center animate-fade-in">
          {/* State and timezone - moved to top */}
          <p className="text-sm text-muted-foreground">
            {getStateFromAreaCode(lead.phone)}
          </p>
          
          {/* Contact name - removed truncation to show full name */}
          <div className="flex items-center justify-center px-2">
            <h2 className="text-3xl font-bold text-foreground text-center break-words leading-tight">
              {lead.name}
            </h2>
          </div>
          
          {/* Company name - show full name without dialog */}
          {lead.company && (
            <div className="flex items-center justify-center px-2">
              <p className="text-lg text-muted-foreground font-medium text-center break-words leading-relaxed">
                {lead.company}
              </p>
            </div>
          )}
          
          {/* Phone number with icon */}
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">{formatPhoneNumber(lead.phone)}</p>
            </div>
          </div>
          
          {/* Email - displayed underneath phone number */}
          {lead.email && (
            <p className="text-sm text-muted-foreground text-center break-words">
              {lead.email}
            </p>
          )}
          
          <div className="relative flex flex-col items-center space-y-4">
            {/* Reserve space for last called text to prevent layout shift */}
            <div className="h-5 flex items-center justify-center">
              {lead.lastCalled && (
                <div className="flex items-center">
                  <p className="text-sm text-muted-foreground transition-opacity duration-300 ease-in-out opacity-100 whitespace-nowrap">
                    Last called: {lead.lastCalled}
                  </p>
                  <button
                    onClick={onResetCallCount}
                    className="ml-2 p-1 bg-muted rounded transition-colors"
                    title="Clear last called"
                  >
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>
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
