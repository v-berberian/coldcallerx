
import React from 'react';
import { Mail } from 'lucide-react';
import { getStateFromAreaCode } from '../utils/timezoneUtils';
import { Lead } from '@/types/lead';

interface LeadInfoProps {
  lead: Lead;
}

const LeadInfo: React.FC<LeadInfoProps> = ({ lead }) => {
  const emailValue = lead.email?.trim() ?? '';
  const hasValidEmail = emailValue && emailValue.includes('@');

  return (
    <div className="text-center space-y-4 flex-1 flex flex-col justify-center animate-fade-in">
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
      
      {/* Email with icon positioned to the left - simplified string handling */}
      {hasValidEmail && (
        <div className="flex items-center justify-center">
          <div className="relative">
            <Mail className="absolute -left-6 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center break-words">
              {emailValue}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadInfo;
