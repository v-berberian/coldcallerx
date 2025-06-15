
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatPhoneNumber } from '../utils/phoneUtils';
import { Lead } from '@/types/lead';
import LeadInfo from './LeadInfo';
import PhoneSelector from './PhoneSelector';
import LeadActions from './LeadActions';

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
  
  // State to track selected phone number - defaults to primary phone
  const [selectedPhone, setSelectedPhone] = useState(formatPhoneNumber(lead.phone));

  // Handle phone selection
  const handlePhoneSelect = (phone: string) => {
    console.log('Phone selected:', phone);
    setSelectedPhone(phone);
  };

  // Modified onCall to use selected phone
  const handleCall = () => {
    console.log('Making call to selected phone:', selectedPhone);
    onCall(); // The original onCall function will handle the actual calling logic
  };

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
        <div key={leadKey} className="flex-1 flex flex-col justify-center space-y-4">
          <LeadInfo lead={lead} />
          
          {/* Phone number selector */}
          <PhoneSelector lead={lead} onPhoneSelect={handlePhoneSelect} />
        </div>

        {/* Action Buttons */}
        <LeadActions 
          lead={lead} 
          onCall={handleCall} 
          onResetCallCount={onResetCallCount} 
        />
      </CardContent>
    </Card>
  );
};

export default LeadCard;
