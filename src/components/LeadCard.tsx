
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, MapPin, Clock } from 'lucide-react';

interface Lead {
  name: string;
  phone: string;
  called?: number;
  lastCalled?: string;
}

interface LeadCardProps {
  currentLead: Lead;
  fileName: string;
  actualLeadIndex: number;
  totalLeadCount: number;
  onCall: () => void;
  getTimezone: (phone: string) => string;
  formatLastCalled: (dateString: string) => string;
}

const LeadCard: React.FC<LeadCardProps> = ({
  currentLead,
  fileName,
  actualLeadIndex,
  totalLeadCount,
  onCall,
  getTimezone,
  formatLastCalled
}) => {
  return (
    <Card className="shadow-2xl border-border/50 rounded-3xl bg-card h-[400px] flex flex-col">
      <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
        {/* Top row with lead count top left and file name top right */}
        <div className="flex items-start justify-between">
          <p className="text-sm text-muted-foreground">
            {actualLeadIndex}/{totalLeadCount}
          </p>
          <p className="text-sm text-muted-foreground">
            {fileName}
          </p>
        </div>

        {/* Lead info - Main content area */}
        <div className="text-center space-y-3 flex-1 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-foreground">{currentLead.name}</h2>
          <p className="text-xl text-muted-foreground font-mono tracking-wider">{currentLead.phone}</p>
          
          <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>{getTimezone(currentLead.phone)}</span>
            </div>
            {currentLead.called && currentLead.called > 0 && (
              <div className="flex items-center space-x-1">
                <span className="text-orange-500">Called {currentLead.called}x</span>
              </div>
            )}
          </div>

          {currentLead.lastCalled && (
            <div className="flex items-center justify-center space-x-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Last: {formatLastCalled(currentLead.lastCalled)}</span>
            </div>
          )}
        </div>

        {/* Main Call Button - ensure it's always green */}
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
