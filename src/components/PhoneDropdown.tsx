
import React, { useState } from 'react';
import { ChevronDown, Phone } from 'lucide-react';
import { formatPhoneNumber, getPhoneDigits } from '../utils/phoneUtils';

interface PhoneDropdownProps {
  mainPhone: string;
  additionalPhones?: string[];
  onPhoneSelect: (phone: string) => void;
}

const PhoneDropdown: React.FC<PhoneDropdownProps> = ({
  mainPhone,
  additionalPhones,
  onPhoneSelect
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Don't show dropdown if no additional phones
  if (!additionalPhones || additionalPhones.length === 0) {
    return (
      <button
        onClick={() => onPhoneSelect(mainPhone)}
        className="text-lg text-muted-foreground text-center hover:text-foreground transition-colors touch-manipulation"
      >
        {formatPhoneNumber(mainPhone)}
      </button>
    );
  }

  const handlePhoneClick = (phone: string) => {
    onPhoneSelect(phone);
    setIsOpen(false);
  };

  const toggleDropdown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        onTouchStart={toggleDropdown}
        className="flex items-center space-x-1 text-lg text-muted-foreground text-center hover:text-foreground transition-colors touch-manipulation"
      >
        <span>{formatPhoneNumber(mainPhone)}</span>
        <ChevronDown className="h-4 w-4" />
      </button>
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
            onTouchStart={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50 bg-card border border-border rounded-lg shadow-lg min-w-48">
            <div className="py-2">
              <button
                onClick={() => handlePhoneClick(mainPhone)}
                onTouchStart={() => handlePhoneClick(mainPhone)}
                className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center space-x-2 touch-manipulation"
              >
                <Phone className="h-4 w-4" />
                <span>Main: {formatPhoneNumber(mainPhone)}</span>
              </button>
              
              {additionalPhones.map((phone, index) => (
                <button
                  key={index}
                  onClick={() => handlePhoneClick(phone)}
                  onTouchStart={() => handlePhoneClick(phone)}
                  className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center space-x-2 touch-manipulation"
                >
                  <Phone className="h-4 w-4" />
                  <span>Alt {index + 1}: {formatPhoneNumber(phone)}</span>
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
