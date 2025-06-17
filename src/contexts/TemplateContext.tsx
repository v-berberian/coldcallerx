
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TemplateContextType {
  emailSubject: string;
  emailBody: string;
  textMessage: string;
  setEmailSubject: (subject: string) => void;
  setEmailBody: (body: string) => void;
  setTextMessage: (message: string) => void;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

interface TemplateProviderProps {
  children: ReactNode;
}

export const TemplateProvider: React.FC<TemplateProviderProps> = ({ children }) => {
  const [emailSubject, setEmailSubject] = useState('Follow-up on our conversation');
  const [emailBody, setEmailBody] = useState('Hi [Name],\n\nI wanted to follow up on our conversation. Please let me know if you have any questions.\n\nBest regards');
  const [textMessage, setTextMessage] = useState('Hi [Name], following up on our conversation. Let me know if you have any questions!');

  return (
    <TemplateContext.Provider value={{
      emailSubject,
      emailBody,
      textMessage,
      setEmailSubject,
      setEmailBody,
      setTextMessage
    }}>
      {children}
    </TemplateContext.Provider>
  );
};

export const useTemplate = () => {
  const context = useContext(TemplateContext);
  if (context === undefined) {
    throw new Error('useTemplate must be used within a TemplateProvider');
  }
  return context;
};
