import { useState, useCallback, useEffect } from 'react';
import { formatPhoneNumber } from '@/utils/phoneUtils';
import { Lead } from '@/types/lead';
import { EmailTemplate, TextTemplate } from './useLeadCardTemplates';
import { interpolateTemplate } from '@/utils/templateUtils';
import { appStorage } from '@/utils/storage';

export const useLeadCardActions = (lead: Lead) => {
  const [selectedPhone, setSelectedPhone] = useState(formatPhoneNumber(lead.phone));
  const [communicationMode, setCommunicationMode] = useState<'native' | 'whatsapp'>('native');

  useEffect(() => {
    (async () => {
      try {
        const settings = await appStorage.getAppSettings();
        setCommunicationMode(settings.communicationMode || 'native');
      } catch {
        setCommunicationMode('native');
      }
    })();
  }, []);

  // If no country code is present, assume +1 (US/Canada)
  const toWhatsAppE164 = useCallback((digits: string) => {
    if (!digits) return digits;
    // Already has country code 1 (11 digits) or other non-US codes (>11)
    if (digits.length >= 11) return digits;
    // 10-digit NANP number → prefix 1
    if (digits.length === 10) return `1${digits}`;
    return digits;
  }, []);

  // Reset selectedPhone to primary phone when lead changes
  const updateSelectedPhone = useCallback(() => {
    const primaryPhone = formatPhoneNumber(lead.phone);
    setSelectedPhone(primaryPhone);
  }, [lead.phone]);

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

  // Create SMS/WhatsApp link with template
  const createSmsLink = useCallback((template?: TextTemplate) => {
    const cleanPhone = selectedPhone.replace(/\D/g, '');
    if (communicationMode === 'whatsapp') {
      const waDigits = toWhatsAppE164(cleanPhone);
      const base = `https://wa.me/${waDigits}`;
      if (template) {
        const message = interpolateTemplate(template.message, {
          name: lead.name,
          company: lead.company || '',
          selectedPhone,
        });
        return `${base}?text=${encodeURIComponent(message)}`;
      }
      return base;
    } else {
      if (template) {
        const message = interpolateTemplate(template.message, {
          name: lead.name,
          company: lead.company || '',
          selectedPhone,
        });
        return `sms:${cleanPhone}?body=${encodeURIComponent(message)}`;
      }
      return `sms:${cleanPhone}`;
    }
  }, [lead, selectedPhone, communicationMode, toWhatsAppE164]);

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

  const handleCallClick = useCallback(() => {
    const cleanPhone = selectedPhone.replace(/\D/g, '');
    if (communicationMode === 'whatsapp') {
      const waDigits = toWhatsAppE164(cleanPhone);
      // Open WhatsApp chat; user can initiate call from there
      window.location.href = `https://wa.me/${waDigits}`;
    } else {
      window.location.href = `tel:${cleanPhone}`;
    }
  }, [selectedPhone, communicationMode, toWhatsAppE164]);

  return {
    selectedPhone,
    updateSelectedPhone,
    handlePhoneSelect,
    handleEmailClick,
    handleTextClick,
    handleCallClick,
    communicationMode,
    setCommunicationMode,
    createMailtoLink,
    createSmsLink
  };
}; 