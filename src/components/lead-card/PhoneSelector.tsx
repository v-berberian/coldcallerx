
import React from 'react';
import { Phone, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

interface PhoneData {
  phone: string;
  isPrimary: boolean;
}

interface PhoneSelectorProps {
  selectedPhone: string;
  hasAdditionalPhones: boolean;
  allPhones: PhoneData[];
  onPhoneSelect: (phone: string) => void;
}

const PhoneSelector: React.FC<PhoneSelectorProps> = ({
  selectedPhone,
  hasAdditionalPhones,
  allPhones,
  onPhoneSelect
}) => {
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
            <DropdownMenuContent side="bottom" align="center" className="max-h-60 overflow-y-auto">
              {allPhones.map((phoneData, index) => (
                <DropdownMenuItem key={index} onClick={() => onPhoneSelect(phoneData.phone)}>
                  <div className="flex justify-between items-center w-full">
                    <span className={`text-foreground ${phoneData.isPrimary ? 'font-bold' : 'font-medium'}`}>
                      {phoneData.phone}
                    </span>
                    {selectedPhone === phoneData.phone && !phoneData.isPrimary && (
                      <div className="w-2 h-2 bg-black rounded-full ml-2"></div>
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
  );
};

export default PhoneSelector;
