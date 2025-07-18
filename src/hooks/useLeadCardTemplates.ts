import { useState, useEffect } from 'react';
import { StorageManager } from '@/utils/storageManager';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

interface TextTemplate {
  id: string;
  name: string;
  message: string;
}

export const useLeadCardTemplates = () => {
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [textTemplates, setTextTemplates] = useState<TextTemplate[]>([]);
  const [selectedEmailTemplateId, setSelectedEmailTemplateId] = useState<string>('');
  const [selectedTextTemplateId, setSelectedTextTemplateId] = useState<string>('');

  // Load templates and selections from localStorage
  useEffect(() => {
    // Load templates from SettingsMenu format
    const emailSubject = StorageManager.getEmailSubject();
    const emailBody = StorageManager.getEmailBody();
    const textMessage = StorageManager.getTextMessage();

    // Create template objects from SettingsMenu data
    if (emailSubject || emailBody) {
      const emailTemplate: EmailTemplate = {
        id: 'settings-email',
        name: 'Settings Email Template',
        subject: emailSubject,
        body: emailBody
      };
      setEmailTemplates([emailTemplate]);
      setSelectedEmailTemplateId('settings-email');
    }

    if (textMessage) {
      const textTemplate: TextTemplate = {
        id: 'settings-text',
        name: 'Settings Text Template',
        message: textMessage
      };
      setTextTemplates([textTemplate]);
      setSelectedTextTemplateId('settings-text');
    }

    // Also load legacy templates if they exist
    const savedEmailTemplates = localStorage.getItem('emailTemplates');
    if (savedEmailTemplates) {
      const legacyTemplates = JSON.parse(savedEmailTemplates);
      setEmailTemplates(prev => [...prev, ...legacyTemplates]);
    }

    const savedTextTemplates = localStorage.getItem('textTemplates');
    if (savedTextTemplates) {
      const legacyTemplates = JSON.parse(savedTextTemplates);
      setTextTemplates(prev => [...prev, ...legacyTemplates]);
    }

    const savedSelectedEmailTemplate = localStorage.getItem('selectedEmailTemplate');
    if (savedSelectedEmailTemplate) {
      setSelectedEmailTemplateId(savedSelectedEmailTemplate);
    }

    const savedSelectedTextTemplate = localStorage.getItem('selectedTextTemplate');
    if (savedSelectedTextTemplate) {
      setSelectedTextTemplateId(savedSelectedTextTemplate);
    }
  }, []);

  // Listen for template changes from SettingsMenu
  useEffect(() => {
    const handleStorageChange = () => {
      const emailSubject = StorageManager.getEmailSubject();
      const emailBody = StorageManager.getEmailBody();
      const textMessage = StorageManager.getTextMessage();

      // Update email template
      if (emailSubject || emailBody) {
        const emailTemplate: EmailTemplate = {
          id: 'settings-email',
          name: 'Settings Email Template',
          subject: emailSubject,
          body: emailBody
        };
        setEmailTemplates(prev => {
          const filtered = prev.filter(t => t.id !== 'settings-email');
          return [emailTemplate, ...filtered];
        });
        setSelectedEmailTemplateId('settings-email');
      }

      // Update text template
      if (textMessage) {
        const textTemplate: TextTemplate = {
          id: 'settings-text',
          name: 'Settings Text Template',
          message: textMessage
        };
        setTextTemplates(prev => {
          const filtered = prev.filter(t => t.id !== 'settings-text');
          return [textTemplate, ...filtered];
        });
        setSelectedTextTemplateId('settings-text');
      }
    };

    // Listen for storage events (when localStorage changes in other tabs/windows)
    window.addEventListener('storage', handleStorageChange);
    
    // Also check for changes periodically (for same-tab updates)
    const interval = setInterval(handleStorageChange, 100);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return {
    emailTemplates,
    textTemplates,
    selectedEmailTemplateId,
    selectedTextTemplateId,
    setSelectedEmailTemplateId,
    setSelectedTextTemplateId
  };
};

export type { EmailTemplate, TextTemplate }; 