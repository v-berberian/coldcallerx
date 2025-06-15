
import React from 'react';
import { Mail } from 'lucide-react';
import { createMailtoLink, validateEmail } from '../../utils/emailUtils';

interface EmailContactProps {
  email?: string;
  leadName: string;
  company?: string;
}

const EmailContact: React.FC<EmailContactProps> = ({ email, leadName, company }) => {
  const emailValue = email?.trim() ?? '';
  const hasValidEmail = validateEmail(emailValue);

  const handleEmailClick = () => {
    console.log('Email clicked for:', emailValue);
  };

  if (!hasValidEmail) return null;

  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <Mail className="absolute -left-6 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <a
          href={createMailtoLink(emailValue, leadName, company)}
          onClick={handleEmailClick}
          className="text-sm text-muted-foreground text-center break-words hover:text-muted-foreground/80 hover:underline transition-colors duration-200 cursor-pointer"
          title="Click to send email"
        >
          {emailValue}
        </a>
      </div>
    </div>
  );
};

export default EmailContact;
