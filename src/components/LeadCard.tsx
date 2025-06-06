
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
  timezoneFilter: 'ALL' | 'EST_CST';
  actualLeadIndex: number;
  totalLeadCount: number;
  onToggleTimezoneFilter: () => void;
  onCall: () => void;
  getTimezone: (phone: string) => string;
  formatLastCalled: (dateString: string) => string;
}

const LeadCard: React.FC<LeadCardProps> = ({
  currentLead,
  fileName,
  timezoneFilter,
  actualLeadIndex,
  totalLeadCount,
  onToggleTimezoneFilter,
  onCall,
  getTimezone,
  formatLastCalled
}) => {
  return (
    <Card className="shadow-2xl border-border/50 rounded-3xl bg-card h-[400px] flex flex-col">
      <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
        {/* Top row with timezone filter and file name - improved alignment */}
        <div className="flex items-center justify-between">
          <button
            onClick={onToggleTimezoneFilter}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
          >
            {timezoneFilter === 'ALL' ? 'All States' : 'EST & CST'}
          </button>
          <p className="text-sm text-muted-foreground opacity-40">
            {fileName}
          </p>
        </div>

        {/* Lead info - Main content area */}
        <div className="text-center space-y-3 flex-1 flex flex-col justify-center">
          {/* Lead counter above name - use filtered count */}
          <p className="text-sm text-muted-foreground opacity-60">
            {actualLeadIndex}/{totalLeadCount}
          </p>
          
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
