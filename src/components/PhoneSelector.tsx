
import React, { useState } from 'react';
import { Phone, ChevronDown, Check } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { formatPhoneNumber } from '../utils/phoneUtils';
import { Lead } from '@/types/lead';

interface PhoneSelectorProps {
  lead: Lead;
  onPhoneSelect: (phone: string) => void;
}

const PhoneSelector: React.FC<PhoneSelectorProps> = ({ lead, onPhoneSelect }) => {
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
    onPhoneSelect(phone);
  };

  return (
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
              className="p-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-white/20 shadow-xl"
            >
              <div className="max-h-[200px] overflow-y-auto">
                <div className="py-1">
                  {allPhones.map((phoneData, index) => (
                    <DropdownMenuItem 
                      key={index}
                      className="px-4 py-2 text-sm hover:bg-white/30 dark:hover:bg-white/10 cursor-pointer whitespace-nowrap flex items-center justify-between backdrop-blur-sm transition-all duration-200"
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
  );
};

export default PhoneSelector;
