
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import { formatPhoneNumber, getStateFromAreaCode } from '@/utils/timezoneUtils';

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
  onCall: () => void;
}

const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  currentIndex,
  totalCount,
  fileName,
  onCall
}) => {
  return (
    <Card className="shadow-2xl border-border/50 rounded-3xl bg-card h-[400px] flex flex-col relative">
      <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
        {/* Lead counter in top left corner */}
        <div className="absolute top-4 left-4">
          <p className="text-sm text-muted-foreground opacity-60">
            {currentIndex + 1}/{totalCount}
          </p>
        </div>

        {/* File name in top right */}
        <div className="flex justify-end">
          <p className="text-sm text-muted-foreground opacity-40">
            {fileName}
          </p>
        </div>

        {/* Lead info - Main content area */}
        <div className="text-center space-y-3 flex-1 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-foreground">{lead.name}</h2>
          
          <div className="flex items-center justify-center space-x-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">{formatPhoneNumber(lead.phone)}</p>
          </div>
          
          {/* State and timezone */}
          <p className="text-sm text-muted-foreground">
            {getStateFromAreaCode(lead.phone)}
          </p>
          
          <p className="text-sm text-muted-foreground">
            Called: {lead.called || 0} times
          </p>
          {lead.lastCalled && (
            <p className="text-sm text-muted-foreground">
              Last called: {lead.lastCalled}
            </p>
          )}
        </div>

        {/* Main Call Button */}
        <Button 
          onClick={onCall} 
          size="lg" 
          className="w-full h-16 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white rounded-2xl shadow-lg"
        >
          <Phone className="h-6 w-6 mr-2" />
          Call
        </Button>
      </CardContent>
    </Card>
  );
};

export default LeadCard;
