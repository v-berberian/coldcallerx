
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { formatPhoneNumber } from '../utils/phoneUtils';
import { getStateFromAreaCode } from '../utils/timezoneUtils';

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
      className="shadow-2xl border border-white/20 rounded-3xl bg-white/10 backdrop-blur-xl h-[400px] flex flex-col animate-scale-in"
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}
    >
      <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
        {/* Top row with lead count and file name */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/60">
            {currentIndex + 1}/{totalCount}
          </p>
          <p className="text-sm text-white/60">
            {fileName}
          </p>
        </div>

        {/* Lead info - Main content area with animation */}
        <div key={`${lead.name}-${lead.phone}`} className="text-center space-y-3 flex-1 flex flex-col justify-center animate-content-change">
          {/* State and timezone - moved to top with same font size as "Called: times" */}
          <p className="text-sm text-white/70">
            {getStateFromAreaCode(lead.phone)}
          </p>
          
          <h2 className="text-3xl font-bold text-white drop-shadow-lg">{lead.name}</h2>
          
          <p className="text-lg text-white/80 text-center">{formatPhoneNumber(lead.phone)}</p>
          
          <div className="relative flex flex-col items-center space-y-3">
            <div className="flex items-center justify-center">
              <p className="text-sm text-white/70">
                Called: {lead.called || 0} times
              </p>
              {(lead.called || 0) > 0 && (
                <button
                  onClick={onResetCallCount}
                  className="ml-2 p-1 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 transition-all duration-200 hover:bg-white/20"
                  title="Reset call count"
                >
                  <X className="h-3 w-3 text-white/80" />
                </button>
              )}
            </div>
            {/* Reserve space for last called text to prevent layout shift */}
            <div className="h-5 flex items-center justify-center">
              {lead.lastCalled && (
                <p className="text-sm text-white/70 animate-fade-in whitespace-nowrap">
                  Last called: {lead.lastCalled}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Main Call Button - with glassmorphism styling */}
        <Button 
          onClick={onCall} 
          size="lg" 
          className="w-full h-16 text-lg font-semibold bg-gradient-to-r from-green-500/80 to-green-600/80 hover:from-green-400/90 hover:to-green-500/90 text-white rounded-2xl shadow-2xl backdrop-blur-sm border border-white/20 transition-all duration-300 transform hover:scale-[1.02]"
          style={{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.8), rgba(22, 163, 74, 0.8))',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)'
          }}
        >
          Call
        </Button>
      </CardContent>
    </Card>
  );
};

export default LeadCard;
