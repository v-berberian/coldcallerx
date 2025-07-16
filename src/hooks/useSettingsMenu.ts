import { useState, useEffect, useCallback } from 'react';
import { StorageManager } from '@/utils/storageManager';

export const useSettingsMenu = () => {
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [textMessage, setTextMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedEmailSubject = StorageManager.getEmailSubject();
    const savedEmailBody = StorageManager.getEmailBody();
    const savedTextMessage = StorageManager.getTextMessage();

    setEmailSubject(savedEmailSubject);
    setEmailBody(savedEmailBody);
    setTextMessage(savedTextMessage);
  }, []);

  // Save email template
  const saveEmailTemplate = useCallback(() => {
    StorageManager.setEmailSubject(emailSubject);
    StorageManager.setEmailBody(emailBody);
  }, [emailSubject, emailBody]);

  // Save text template
  const saveTextTemplate = useCallback(() => {
    StorageManager.setTextMessage(textMessage);
  }, [textMessage]);

  // Handle email subject change
  const handleEmailSubjectChange = useCallback((value: string) => {
    setEmailSubject(value);
    // Auto-save when subject changes
    StorageManager.setEmailSubject(value);
  }, []);

  // Handle email body change
  const handleEmailBodyChange = useCallback((value: string) => {
    setEmailBody(value);
    // Auto-save when body changes
    StorageManager.setEmailBody(value);
  }, []);

  // Handle text message change
  const handleTextMessageChange = useCallback((value: string) => {
    setTextMessage(value);
    // Auto-save when text changes
    StorageManager.setTextMessage(value);
  }, []);

  // Toggle menu open/close
  const toggleMenu = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Close menu
  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    emailSubject,
    emailBody,
    textMessage,
    isOpen,
    saveEmailTemplate,
    saveTextTemplate,
    handleEmailSubjectChange,
    handleEmailBodyChange,
    handleTextMessageChange,
    toggleMenu,
    closeMenu
  };
}; 