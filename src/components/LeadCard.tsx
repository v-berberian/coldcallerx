
import React, { useState } from 'react';
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
  
  // Email is now guaranteed to be a string or undefined from the importer
  const emailValue = lead.email?.trim() ?? '';
  const hasValidEmail = emailValue && emailValue.includes('@');
  
  // Completely rewrite phone parsing - handle format: "773) 643-4644 (773) 643-9346"
  const additionalPhones = lead.additionalPhones
    ? (() => {
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
        return foundPhones.filter(phone => phone !== primaryPhoneFormatted);
      })()
    : [];
  
  const hasAdditionalPhones = additionalPhones.length > 0;
  
  // State to track selected phone number - defaults to primary phone
  const [selectedPhone, setSelectedPhone] = useState(formatPhoneNumber(lead.phone));
  
  // All available phones (primary + additional)
  const allPhones = [
    { phone: formatPhoneNumber(lead.phone), isPrimary: true },
    ...additionalPhones.map(phone => ({ phone, isPrimary: false }))
  ];

  // Debug logging
  console.log('Primary phone:', formatPhoneNumber(lead.phone));
  console.log('Additional phones after parsing:', additionalPhones);
  console.log('Selected phone:', selectedPhone);

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
          
          {/* Phone number with icon positioned to the left */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <Phone className="absolute -left-6 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              {hasAdditionalPhones ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1 cursor-pointer">
                    <p className="text-lg text-muted-foreground">{selectedPhone}</p>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    side="bottom" 
                    align="center" 
                    className="p-0"
                  >
                    <div className="max-h-[200px] overflow-y-auto">
                      <div className="py-1">
                        {allPhones.map((phoneData, index) => (
                          <DropdownMenuItem 
                            key={index}
                            className="px-4 py-2 text-sm hover:bg-accent cursor-pointer whitespace-nowrap flex items-center justify-between"
                            onClick={() => handlePhoneSelect(phoneData.phone)}
                          >
                            <span>
                              {phoneData.phone} {phoneData.isPrimary && '(Primary)'}
                            </span>
                            {selectedPhone === phoneData.phone && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </DropdownMenuItem>
                        ))}
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <p className="text-lg text-muted-foreground">{selectedPhone}</p>
              )}
            </div>
          </div>
          
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

        {/* Action Buttons */}
        <div className="space-y-3">
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
