import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { X, Phone, Mail, ChevronDown, Check } from 'lucide-react';
import { formatPhoneNumber } from '../utils/phoneUtils';
import { getStateFromAreaCode } from '../utils/timezoneUtils';
import { Lead } from '@/types/lead';

interface LeadCardProps {
  lead: Lead;
  currentIndex: number;
  totalCount: number;
  fileName: string;
  onCall: () => void;
  onResetCallCount: () => void;
  noLeadsMessage?: string;
}

const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  currentIndex,
  totalCount,
  fileName,
  onCall,
  onResetCallCount,
  noLeadsMessage
}) => {
  // If we have a noLeadsMessage, show the empty state
  if (noLeadsMessage) {
    return (
      <Card className="shadow-2xl border-border/50 rounded-3xl bg-card h-[480px] flex flex-col">
        <CardContent className="p-6 space-y-6 flex-1 flex flex-col justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">{noLeadsMessage}</h2>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Use stable key based on lead data instead of changing cardKey
  const leadKey = `${lead.name}-${lead.phone}`;

  // Email is now guaranteed to be a string or undefined from the importer
  const emailValue = lead.email?.trim() ?? '';
  const hasValidEmail = emailValue && emailValue.includes('@');

  // Completely rewrite phone parsing - handle format: "773) 643-4644 (773) 643-9346"
  const additionalPhones = lead.additionalPhones ? (() => {
    const rawString = lead.additionalPhones.trim();
    console.log('Raw additional phones string:', rawString);

    // Use regex to find all phone patterns like "(123) 456-7890" or "123) 456-7890"
    const phonePattern = /\(?(\d{3})\)?\s*(\d{3})-?(\d{4})/g;
    const foundPhones = [];
    let match;
    while ((match = phonePattern.exec(rawString)) !== null) {
      const formattedPhone = `(${match[1]}) ${match[2]}-${match[3]}`;
      foundPhones.push(formattedPhone);
    }
    console.log('Found phones:', foundPhones);

    // Remove the primary phone if it appears in the additional phones
    const primaryPhoneFormatted = formatPhoneNumber(lead.phone);
    const filteredPhones = foundPhones.filter(phone => phone !== primaryPhoneFormatted);

    // Limit to only 3 additional numbers
    return filteredPhones.slice(0, 3);
  })() : [];
  const hasAdditionalPhones = additionalPhones.length > 0;

  // State to track selected phone number - defaults to primary phone
  const [selectedPhone, setSelectedPhone] = useState(formatPhoneNumber(lead.phone));

  // Reset selectedPhone to primary phone when lead changes
  useEffect(() => {
    const primaryPhone = formatPhoneNumber(lead.phone);
    console.log('Lead changed, resetting selectedPhone to primary:', primaryPhone);
    setSelectedPhone(primaryPhone);
  }, [lead.phone, lead.name]); // Reset when lead changes (using phone and name as dependencies)

  // All available phones (primary + up to 3 additional)
  const allPhones = [{
    phone: formatPhoneNumber(lead.phone),
    isPrimary: true
  }, ...additionalPhones.map(phone => ({
    phone,
    isPrimary: false
  }))];

  // Calculate state from currently selected phone number
  const cleanSelectedPhone = selectedPhone.replace(/\D/g, '');
  const leadState = getStateFromAreaCode(cleanSelectedPhone);

  // Debug logging
  console.log('Primary phone:', formatPhoneNumber(lead.phone));
  console.log('Selected phone:', selectedPhone);
  console.log('Clean selected phone for state:', cleanSelectedPhone);
  console.log('Lead state from selected phone:', leadState);
  console.log('Additional phones after parsing (limited to 3):', additionalPhones);

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

  // Create mailto link with pre-populated content
  const createMailtoLink = () => {
    if (!hasValidEmail) return '';
    const subject = encodeURIComponent(`Following up - ${lead.name}${lead.company ? ` from ${lead.company}` : ''}`);
    const body = encodeURIComponent(`Hi ${lead.name},\n\nI hope this email finds you well. I wanted to follow up regarding our recent conversation.\n\n${lead.company ? `I understand you work at ${lead.company} and ` : ''}I believe we could discuss some opportunities that might be of interest to you.\n\nWould you be available for a brief call to explore this further?\n\nBest regards,\n[Your Name]\n[Your Contact Information]`);
    return `mailto:${emailValue}?subject=${subject}&body=${body}`;
  };

  const handleEmailClick = () => {
    console.log('Email clicked for:', emailValue);
    // The mailto link will handle opening the email client
  };

  return (
    <Card className="shadow-2xl border-border/50 rounded-3xl bg-card h-[480px] flex flex-col">
      <CardContent className="p-6 space-y-6 flex-1 flex flex-col">
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
        <div key={leadKey} className="text-center space-y-6 flex-1 flex flex-col justify-center animate-fade-in">
          {/* State and timezone - always show, with fallback */}
          <p className="text-sm text-muted-foreground">
            {leadState || 'Unknown State'}
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
            {/* Phone number with icon positioned to the left - restored glassmorphism dropdown styling */}
            <div className="flex items-center justify-center">
              <div className="relative">
                <Phone className="absolute -left-6 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                {hasAdditionalPhones ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors">
                      <p className="text-lg text-muted-foreground">{selectedPhone}</p>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      side="bottom" 
                      align="center" 
                      className="z-50 min-w-[200px] bg-background/25 backdrop-blur-sm border border-border/20 shadow-lg rounded-xl p-1"
                    >
                      {allPhones.map((phoneData, index) => (
                        <DropdownMenuItem 
                          key={index} 
                          onClick={() => handlePhoneSelect(phoneData.phone)}
                          className="w-full px-4 py-3 text-left border-b border-border/10 last:border-b-0 transition-colors duration-150 cursor-pointer hover:bg-muted/50 relative"
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className={`text-foreground ${phoneData.isPrimary ? 'font-bold' : 'font-medium'}`}>
                              {phoneData.phone}
                            </span>
                            {selectedPhone === phoneData.phone && !phoneData.isPrimary && (
                              <div className="w-2 h-2 bg-foreground rounded-full ml-2"></div>
                            )}
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <p className="text-lg text-muted-foreground">{selectedPhone}</p>
                )}
              </div>
            </div>
            
            {/* Email with icon positioned to the left - now clickable without blue highlighting */}
            {hasValidEmail && (
              <div className="flex items-center justify-center">
                <div className="relative">
                  <Mail className="absolute -left-6 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <a
                    href={createMailtoLink()}
                    onClick={handleEmailClick}
                    className="text-sm text-muted-foreground text-center break-words hover:text-muted-foreground/80 hover:underline transition-colors duration-200 cursor-pointer"
                    title="Click to send email"
                  >
                    {emailValue}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Group 3: Last Called and Call Button */}
        <div className="space-y-3">
          {/* Last called section above button */}
          {lead.lastCalled && (
            <div className="flex items-center justify-center">
              <div className="flex items-center">
                <p className="text-sm text-muted-foreground transition-opacity duration-300 ease-in-out opacity-100 whitespace-nowrap my-0 py-0">
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
            </div>
          )}
          
          {/* Main Call Button */}
          <Button 
            onClick={handleCall} 
            size="lg" 
            className="w-full h-16 text-lg font-semibold bg-green-600 hover:bg-green-600 text-white rounded-2xl shadow-lg"
          >
            Call
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeadCard;
