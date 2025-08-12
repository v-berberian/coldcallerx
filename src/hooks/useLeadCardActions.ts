import { useState, useCallback } from 'react';
import { formatPhoneNumber } from '@/utils/phoneUtils';
import { Lead } from '@/types/lead';
import { EmailTemplate, TextTemplate } from './useLeadCardTemplates';
import { interpolateTemplate, parseLeadName } from '@/utils/templateUtils';

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

  // Create mailto link with template
  const createMailtoLink = useCallback((template?: EmailTemplate) => {
    const emailValue = lead.email?.trim() ?? '';
    const hasValidEmail = emailValue && emailValue.includes('@');
    if (!hasValidEmail) return '';

    if (template) {
      const subject = interpolateTemplate(template.subject, {
        name: lead.name,
        company: lead.company || '',
        selectedPhone,
      });
      const body = interpolateTemplate(template.body, {
        name: lead.name,
        company: lead.company || '',
        selectedPhone,
      });
      return `mailto:${emailValue}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    return `mailto:${emailValue}`;
  }, [lead, selectedPhone]);

  // Create SMS link with template
  const createSmsLink = useCallback((template?: TextTemplate) => {
    const cleanPhone = selectedPhone.replace(/\D/g, '');

    if (template) {
      const message = interpolateTemplate(template.message, {
        name: lead.name,
        company: lead.company || '',
        selectedPhone,
      });
      return `sms:${cleanPhone}?body=${encodeURIComponent(message)}`;
    }

    return `sms:${cleanPhone}`;
  }, [lead, selectedPhone]);

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