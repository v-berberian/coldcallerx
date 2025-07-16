import { useState, useCallback } from 'react';
import { formatPhoneNumber } from '@/utils/phoneUtils';
import { Lead } from '@/types/lead';
import { EmailTemplate, TextTemplate } from './useLeadCardTemplates';

export const useLeadCardActions = (lead: Lead) => {
  const [selectedPhone, setSelectedPhone] = useState(formatPhoneNumber(lead.phone));

  // Reset selectedPhone to primary phone when lead changes
  const updateSelectedPhone = useCallback(() => {
    const primaryPhone = formatPhoneNumber(lead.phone);
    setSelectedPhone(primaryPhone);
  }, [lead.phone, lead.name]);

  // Handle phone selection
  const handlePhoneSelect = useCallback((phone: string) => {
    setSelectedPhone(phone);
  }, []);

  // Helper function to parse name into first and last name
  const parseName = useCallback((name: string) => {
    const nameParts = name.trim().split(' ');
    return {
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || ''
    };
  }, []);

  // Create mailto link with template
  const createMailtoLink = useCallback((template?: EmailTemplate) => {
    const emailValue = lead.email?.trim() ?? '';
    const hasValidEmail = emailValue && emailValue.includes('@');
    
    if (!hasValidEmail) return '';
    
    if (template) {
      // Parse name into first and last name
      const { firstName, lastName } = parseName(lead.name);
      
      // Replace placeholders in template
      const subject = template.subject
        .replace('{name}', lead.name)
        .replace('{company}', lead.company || '')
        .replace('{{first_name}}', firstName)
        .replace('{{last_name}}', lastName);
      const body = template.body
        .replace('{name}', lead.name)
        .replace('{company}', lead.company || '')
        .replace('{phone}', selectedPhone)
        .replace('{{first_name}}', firstName)
        .replace('{{last_name}}', lastName);
        
      return `mailto:${emailValue}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
    
    return `mailto:${emailValue}`;
  }, [lead, selectedPhone, parseName]);

  // Create SMS link with template
  const createSmsLink = useCallback((template?: TextTemplate) => {
    const cleanPhone = selectedPhone.replace(/\D/g, '');
    
    if (template) {
      // Parse name into first and last name
      const { firstName, lastName } = parseName(lead.name);
      
      const message = template.message
        .replace('{name}', lead.name)
        .replace('{company}', lead.company || '')
        .replace('{{first_name}}', firstName)
        .replace('{{last_name}}', lastName);
        
      return `sms:${cleanPhone}?body=${encodeURIComponent(message)}`;
    }
    
    return `sms:${cleanPhone}`;
  }, [lead, selectedPhone, parseName]);

  const handleEmailClick = useCallback((template?: EmailTemplate) => {
    const mailtoLink = createMailtoLink(template);
    if (mailtoLink) {
      window.location.href = mailtoLink;
    }
  }, [createMailtoLink]);

  const handleTextClick = useCallback((template?: TextTemplate) => {
    const smsLink = createSmsLink(template);
    window.location.href = smsLink;
  }, [createSmsLink]);

  return {
    selectedPhone,
    updateSelectedPhone,
    handlePhoneSelect,
    handleEmailClick,
    handleTextClick,
    createMailtoLink,
    createSmsLink
  };
}; 