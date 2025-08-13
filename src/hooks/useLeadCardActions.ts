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

  // Create SMS link with template
  const createSmsLink = useCallback((template?: TextTemplate) => {
    const cleanPhone = selectedPhone.replace(/\D/g, '');
    if (communicationMode === 'whatsapp') {
      const base = `https://wa.me/${cleanPhone}`;
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
  }, [lead, selectedPhone, communicationMode]);

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
      // WhatsApp voice call deep link (may depend on platform support)
      // Fallback: open chat; user taps call inside WhatsApp
      window.location.href = `https://wa.me/${cleanPhone}`;
    } else {
      window.location.href = `tel:${cleanPhone}`;
    }
  }, [selectedPhone, communicationMode]);

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