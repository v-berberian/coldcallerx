
import React from 'react';
import { getStateFromAreaCode } from '../../utils/timezoneUtils';
import PhoneSelector from './PhoneSelector';
import EmailContact from './EmailContact';

interface LeadInfoProps {
  lead: {
    name: string;
    phone: string;
    company?: string;
    email?: string;
    additionalPhones?: string;
  };
  selectedPhone: string;
  hasAdditionalPhones: boolean;
  allPhones: Array<{ phone: string; isPrimary: boolean }>;
  onPhoneSelect: (phone: string) => void;
  leadKey: string;
}

const LeadInfo: React.FC<LeadInfoProps> = ({
  lead,
  selectedPhone,
  hasAdditionalPhones,
  allPhones,
  onPhoneSelect,
  leadKey
}) => {
  return (
    <div key={leadKey} className="text-center space-y-6 flex-1 flex flex-col justify-center animate-fade-in">
      {/* State and timezone */}
      <p className="text-sm text-muted-foreground">
        {getStateFromAreaCode(lead.phone)}
      </p>
      
      {/* Group 1: Name and Company */}
      <div className="space-y-1">
        <div className="flex items-center justify-center px-2">
          <h2 className="text-3xl font-bold text-foreground text-center break-words leading-tight">
            {lead.name}
          </h2>
        </div>
        
        {lead.company && (
          <div className="flex items-center justify-center px-2">
            <p className="text-lg text-muted-foreground font-medium text-center break-words leading-relaxed">
              {lead.company}
            </p>
          </div>
        )}
      </div>
      
      {/* Group 2: Phone and Email */}
      <div className="space-y-2">
        <PhoneSelector
          selectedPhone={selectedPhone}
          hasAdditionalPhones={hasAdditionalPhones}
          allPhones={allPhones}
          onPhoneSelect={onPhoneSelect}
        />
        
        <EmailContact
          email={lead.email}
          leadName={lead.name}
          company={lead.company}
        />
      </div>
    </div>
  );
};

export default LeadInfo;
