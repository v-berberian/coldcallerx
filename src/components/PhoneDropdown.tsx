
import React, { useState } from 'react';
import { ChevronDown, Phone } from 'lucide-react';
import { formatPhoneNumber, getPhoneDigits } from '../utils/phoneUtils';

interface PhoneDropdownProps {
  mainPhone: string;
  additionalPhones?: string[];
  onPhoneSelect?: (phone: string) => void;
}

const PhoneDropdown: React.FC<PhoneDropdownProps> = ({
  mainPhone,
  additionalPhones = [],
  onPhoneSelect
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const hasAdditionalPhones = additionalPhones.length > 0;
  
  const handlePhoneClick = (phone: string) => {
    const phoneNumber = getPhoneDigits(phone);
    window.location.href = `tel:${phoneNumber}`;
    if (onPhoneSelect) {
      onPhoneSelect(phone);
    }
    setIsOpen(false);
  };

  if (!hasAdditionalPhones) {
    return (
      <p className="text-lg text-muted-foreground text-center">
        {formatPhoneNumber(mainPhone)}
      </p>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center space-x-2 text-lg text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>{formatPhoneNumber(mainPhone)}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-background border border-border rounded-lg shadow-lg z-20 min-w-[200px]">
            <div className="p-2">
              <div className="text-xs text-muted-foreground px-2 py-1 border-b border-border">
                Phone Numbers
              </div>
              
              <button
                onClick={() => handlePhoneClick(mainPhone)}
                className="w-full flex items-center space-x-2 px-2 py-2 text-left hover:bg-accent rounded text-sm"
              >
                <Phone className="h-3 w-3 text-green-600" />
                <span>{formatPhoneNumber(mainPhone)} (Main)</span>
              </button>
              
              {additionalPhones.map((phone, index) => (
                <button
                  key={index}
                  onClick={() => handlePhoneClick(phone)}
                  className="w-full flex items-center space-x-2 px-2 py-2 text-left hover:bg-accent rounded text-sm"
                >
                  <Phone className="h-3 w-3 text-blue-600" />
                  <span>{formatPhoneNumber(phone)}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PhoneDropdown;
