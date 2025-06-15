
import { useState, useEffect } from 'react';
import { formatPhoneNumber } from '../utils/phoneUtils';

export const usePhoneSelection = (primaryPhone: string, additionalPhonesString?: string, leadName?: string) => {
  const [selectedPhone, setSelectedPhone] = useState('');

  // Parse additional phones from string format
  const additionalPhones = additionalPhonesString ? (() => {
    const rawString = additionalPhonesString.trim();
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
    const primaryPhoneFormatted = formatPhoneNumber(primaryPhone);
    const filteredPhones = foundPhones.filter(phone => phone !== primaryPhoneFormatted);

    // Limit to only 3 additional numbers
    return filteredPhones.slice(0, 3);
  })() : [];

  const hasAdditionalPhones = additionalPhones.length > 0;

  // All available phones (primary + up to 3 additional)
  const allPhones = [{
    phone: formatPhoneNumber(primaryPhone),
    isPrimary: true
  }, ...additionalPhones.map(phone => ({
    phone,
    isPrimary: false
  }))];

  // Reset selectedPhone to primary phone when lead changes
  useEffect(() => {
    const primaryPhoneFormatted = formatPhoneNumber(primaryPhone);
    console.log('Lead changed, resetting selectedPhone to primary:', primaryPhoneFormatted);
    setSelectedPhone(primaryPhoneFormatted);
  }, [primaryPhone, leadName]);

  const handlePhoneSelect = (phone: string) => {
    console.log('Phone selected:', phone);
    setSelectedPhone(phone);
  };

  return {
    selectedPhone,
    hasAdditionalPhones,
    allPhones,
    handlePhoneSelect
  };
};
