import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { X, Phone, Mail, ChevronDown, Check, MessageSquare, Upload, Settings } from 'lucide-react';
import { formatPhoneNumber } from '../utils/phoneUtils';
import { getStateFromAreaCode } from '../utils/timezoneUtils';
import { Lead } from '@/types/lead';

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

interface LeadCardProps {
  lead: Lead;
  currentIndex: number;
  totalCount: number;
  fileName: string;
  onCall: (phone: string) => void;
  onResetCallCount: () => void;
  onDeleteLead?: (lead: Lead) => void;
  noLeadsMessage?: string;
  onImportNew?: () => void;
}

const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  currentIndex,
  totalCount,
  fileName,
  onCall,
  onResetCallCount,
  onDeleteLead,
  noLeadsMessage,
  onImportNew
}) => {
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [textTemplates, setTextTemplates] = useState<TextTemplate[]>([]);
  const [selectedEmailTemplateId, setSelectedEmailTemplateId] = useState<string>('');
  const [selectedTextTemplateId, setSelectedTextTemplateId] = useState<string>('');
  const [selectedPhone, setSelectedPhone] = useState(formatPhoneNumber(lead.phone));

  // Animation state management
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'visible' | 'fading-out' | 'hidden' | 'fading-in'>('visible');
  const [displayLead, setDisplayLead] = useState(lead);

  // Handle lead changes with smooth animations
  useEffect(() => {
    if (displayLead.name !== lead.name || displayLead.phone !== lead.phone) {
      // Start fade out animation
      setIsAnimating(true);
      setAnimationPhase('fading-out');
      
      // After fade out, update content and fade in
      const fadeOutTimer = setTimeout(() => {
        setDisplayLead(lead);
        setAnimationPhase('hidden');
        
        // Force a reflow to ensure the hidden state is applied
        requestAnimationFrame(() => {
          setAnimationPhase('fading-in');
          
          // After fade in, complete the animation
          const fadeInTimer = setTimeout(() => {
            setAnimationPhase('visible');
            setIsAnimating(false);
          }, 112); // Match the CSS animation duration (25% faster)
          
          return () => clearTimeout(fadeInTimer);
        });
      }, 112); // Match the CSS animation duration (25% faster)
      
      return () => clearTimeout(fadeOutTimer);
    }
  }, [lead, displayLead]);

  // Reset selectedPhone to primary phone when lead changes
  useEffect(() => {
    const primaryPhone = formatPhoneNumber(lead.phone);
    setSelectedPhone(primaryPhone);
  }, [lead.phone, lead.name]);

  // Load templates and selections from localStorage
  useEffect(() => {
    // Load templates from SettingsMenu format
    const emailSubject = localStorage.getItem('emailTemplateSubject') || '';
    const emailBody = localStorage.getItem('emailTemplateBody') || '';
    const textMessage = localStorage.getItem('textTemplateMessage') || '';

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
      const emailSubject = localStorage.getItem('emailTemplateSubject') || '';
      const emailBody = localStorage.getItem('emailTemplateBody') || '';
      const textMessage = localStorage.getItem('textTemplateMessage') || '';

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
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // If we have a noLeadsMessage, show the empty state
  if (noLeadsMessage) {
    return (
      <Card className="shadow-2xl border-border/50 rounded-3xl bg-card min-h-[400px] max-h-[500px] sm:min-h-[420px] sm:max-h-[550px] flex flex-col mb-8">
        <CardContent className="p-6 space-y-6 flex-1 flex flex-col justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">{noLeadsMessage}</h2>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Use stable key based on lead data instead of changing cardKey
  const leadKey = `${displayLead.name}-${displayLead.phone}`;

  // Email is now guaranteed to be a string or undefined from the importer
  const emailValue = displayLead.email?.trim() ?? '';
  const hasValidEmail = emailValue && emailValue.includes('@');

  // Completely rewrite phone parsing - handle format: \"773) 643-4644 (773) 643-9346\"
  const additionalPhones = displayLead.additionalPhones ? (() => {
    const rawString = displayLead.additionalPhones.trim();

    // First, normalize the string by replacing various separators with spaces
    const normalizedString = rawString
      .replace(/\n/g, ' ')  // Replace newlines with spaces
      .replace(/\r/g, ' ')  // Replace carriage returns with spaces
      .replace(/\t/g, ' ')  // Replace tabs with spaces
      .replace(/,/g, ' ')   // Replace commas with spaces
      .replace(/;/g, ' ')   // Replace semicolons with spaces
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();

    // Use a more comprehensive regex to find all phone patterns
    // This handles: (123) 456-7890, 123) 456-7890, 123-456-7890, 123.456.7890, 123 456 7890
    const phonePattern = /\(?(\d{3})\)?[\s\-.]?(\d{3})[\s\-.]?(\d{4})/g;
    const foundPhones = [];
    let match;
    
    while ((match = phonePattern.exec(normalizedString)) !== null) {
      const formattedPhone = `(${match[1]}) ${match[2]}-${match[3]}`;
      foundPhones.push(formattedPhone);
    }
    
    return foundPhones;
  })() : [];

  const hasAdditionalPhones = additionalPhones.length > 0;
  
  // Create array of all phones with primary phone first
  const allPhones = [
    { phone: formatPhoneNumber(displayLead.phone), isPrimary: true },
    ...additionalPhones.map(phone => ({ phone, isPrimary: false }))
  ];

  // Get state from area code for display
  const leadState = getStateFromAreaCode(displayLead.phone);

  // Handle phone selection
  const handlePhoneSelect = (phone: string) => {
    setSelectedPhone(phone);
  };

  // Modified onCall to use selected phone
  const handleCall = () => {
    onCall(selectedPhone);
  };

  // Get the selected templates
  const selectedEmailTemplate = emailTemplates.find(t => t.id === selectedEmailTemplateId);
  const selectedTextTemplate = textTemplates.find(t => t.id === selectedTextTemplateId);

  // Create mailto link with template
  const createMailtoLink = (template?: EmailTemplate) => {
    if (!hasValidEmail) return '';
    
    // Use selected template if no specific template provided and we have a default selected
    const templateToUse = template || selectedEmailTemplate;
    
    if (templateToUse) {
      // Parse name into first and last name
      const nameParts = displayLead.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Replace placeholders in template
      const subject = templateToUse.subject
        .replace('{name}', displayLead.name)
        .replace('{company}', displayLead.company || '')
        .replace('{{first_name}}', firstName)
        .replace('{{last_name}}', lastName);
      const body = templateToUse.body
        .replace('{name}', displayLead.name)
        .replace('{company}', displayLead.company || '')
        .replace('{phone}', selectedPhone)
        .replace('{{first_name}}', firstName)
        .replace('{{last_name}}', lastName);
        
      return `mailto:${emailValue}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
    
    return `mailto:${emailValue}`;
  };

  // Create SMS link with template
  const createSmsLink = (template?: TextTemplate) => {
    const cleanPhone = selectedPhone.replace(/\D/g, '');
    
    // Use selected template if no specific template provided and we have a default selected
    const templateToUse = template || selectedTextTemplate;
    
    if (templateToUse) {
      // Parse name into first and last name
      const nameParts = displayLead.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const message = templateToUse.message
        .replace('{name}', displayLead.name)
        .replace('{company}', displayLead.company || '')
        .replace('{{first_name}}', firstName)
        .replace('{{last_name}}', lastName);
        
      return `sms:${cleanPhone}?body=${encodeURIComponent(message)}`;
    }
    
    return `sms:${cleanPhone}`;
  };

  const handleEmailClick = (template?: EmailTemplate) => {
    const templateToUse = template || selectedEmailTemplate;
    window.location.href = createMailtoLink(template);
  };

  const handleTextClick = (template?: TextTemplate) => {
    const templateToUse = template || selectedTextTemplate;
    window.location.href = createSmsLink(template);
  };

  return (
    <Card className="shadow-2xl border-border/30 rounded-3xl bg-background/60 backdrop-blur-xl min-h-[400px] max-h-[500px] sm:min-h-[420px] sm:max-h-[550px] flex flex-col mb-4" style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
      <CardContent className="p-3 sm:p-5 space-y-4 sm:space-y-5 flex-1 flex flex-col">
        {/* Top row with lead count and file name */}
        <div className="flex items-center justify-center">
          <p className="text-sm text-muted-foreground opacity-40">
            {currentIndex + 1}/{totalCount}
          </p>
        </div>

        {/* Lead info - Main content area with animation */}
        <div 
          key={`${displayLead.name}-${displayLead.phone}`} 
          className={`text-center space-y-4 sm:space-y-5 flex-1 flex flex-col justify-center ${
            animationPhase === 'fading-out' ? 'animate-lead-content-fade-out' :
            animationPhase === 'fading-in' ? 'animate-lead-content-fade-in' :
            animationPhase === 'hidden' ? 'lead-content-hidden' :
            'lead-content-visible'
          }`}
        >
          {/* State and timezone - always show, with fallback */}
          <p className="text-sm text-muted-foreground">
            {leadState || 'Unknown State'}
          </p>
          
          {/* Group 1: Name and Company */}
          <div className="space-y-1">
            <div className="flex items-center justify-center px-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-center break-words leading-tight bg-gradient-to-r from-foreground to-foreground/95 bg-clip-text text-transparent dark:bg-none dark:text-foreground">
                {displayLead.name}
              </h2>
            </div>
            
            {displayLead.company && (
              <div className="flex items-center justify-center px-2">
                <p className="text-base sm:text-lg font-medium text-center break-words leading-relaxed bg-gradient-to-r from-muted-foreground to-muted-foreground/90 bg-clip-text text-transparent dark:bg-none dark:text-muted-foreground">
                  {displayLead.company}
                </p>
              </div>
            )}
          </div>
          
          {/* Group 2: Phone and Email */}
          <div className="space-y-2">
            {/* Phone number with icon positioned to the left */}
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2">
                <Phone 
                  className={`h-4 w-4 text-muted-foreground flex-shrink-0 ${
                    animationPhase === 'fading-out' ? 'animate-lead-icon-fade-out' :
                    animationPhase === 'fading-in' ? 'animate-lead-icon-fade-in' :
                    animationPhase === 'hidden' ? 'lead-icon-hidden' :
                    'lead-icon-visible'
                  }`}
                />
                {hasAdditionalPhones ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors">
                      <p className="text-base sm:text-lg bg-gradient-to-r from-muted-foreground to-muted-foreground/95 bg-clip-text text-transparent dark:bg-none dark:text-muted-foreground">{selectedPhone}</p>
                      <ChevronDown 
                        className={`h-4 w-4 text-muted-foreground ${
                          animationPhase === 'fading-out' ? 'animate-lead-arrow-fade-out' :
                          animationPhase === 'fading-in' ? 'animate-lead-arrow-fade-in' :
                          animationPhase === 'hidden' ? 'lead-arrow-hidden' :
                          'lead-arrow-visible'
                        }`}
                      />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      side="bottom" 
                      align="center" 
                      sideOffset={5}
                      className="z-50 w-auto max-w-[280px] min-w-[180px] rounded-xl shadow-lg overflow-hidden animate-fade-in data-[state=closed]:animate-fade-out bg-background/60 backdrop-blur-sm border border-border/15"
                    >
                      <div className="max-h-60 overflow-y-auto">
                        {allPhones.map((phoneData, index) => (
                          <DropdownMenuItem 
                            key={index} 
                            onClick={() => handlePhoneSelect(phoneData.phone)}
                            className="w-full px-4 py-3 text-left border-b border-border/10 last:border-b-0 transition-colors duration-75 cursor-pointer hover:bg-muted/50 relative"
                          >
                            <div className="flex justify-between items-center w-full">
                              <span className={`text-foreground ${phoneData.isPrimary ? 'font-bold' : 'font-medium'}`}>
                                {phoneData.phone}
                              </span>
                              {selectedPhone === phoneData.phone && !phoneData.isPrimary && (
                                <div className="w-2 h-2 bg-foreground rounded-full ml-2 flex-shrink-0 self-center"></div>
                              )}
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <p className="text-base sm:text-lg bg-gradient-to-r from-muted-foreground to-muted-foreground/95 bg-clip-text text-transparent dark:bg-none dark:text-muted-foreground">{selectedPhone}</p>
                )}
              </div>
            </div>
            
            {/* Email with icon positioned to the left */}
            {hasValidEmail && (
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <Mail 
                    className={`h-4 w-4 text-muted-foreground flex-shrink-0 ${
                      animationPhase === 'fading-out' ? 'animate-lead-icon-fade-out' :
                      animationPhase === 'fading-in' ? 'animate-lead-icon-fade-in' :
                      animationPhase === 'hidden' ? 'lead-icon-hidden' :
                      'lead-icon-visible'
                    }`}
                  />
                  <button
                    onClick={() => handleEmailClick()}
                    className="text-sm text-muted-foreground text-center break-words hover:text-muted-foreground/80 hover:underline transition-colors duration-200 cursor-pointer"
                    title="Click to send email"
                  >
                    {emailValue}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Group 3: Last Called and Action Buttons */}
        <div className="space-y-3">
          {/* Last called section above buttons */}
          {displayLead.lastCalled && (
            <div className="flex items-center justify-center">
              <div className="flex items-center">
                <p className="text-sm text-muted-foreground transition-opacity duration-300 ease-in-out opacity-100 whitespace-nowrap my-0 py-0">
                  Last called: {displayLead.lastCalled}
                </p>
                <button
                  onClick={onResetCallCount}
                  className="ml-2 p-1 bg-muted rounded transition-colors"
                  title="Clear last called"
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                </button>
              </div>
            </div>
          )}
          
          {/* Action Buttons - Call and Text */}
          <div className="flex justify-center items-center space-x-16 sm:space-x-20">
            <Button 
              onClick={() => handleTextClick()} 
              size="lg" 
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 active:from-blue-600 active:to-blue-800 text-white transition-all duration-300 flex items-center justify-center p-0 relative overflow-hidden neomorphic-button focus:outline-none"
              style={{
                boxShadow: `
                  8px 8px 16px rgba(0, 0, 0, 0.2),
                  -8px -8px 16px rgba(255, 255, 255, 0.1),
                  inset 2px 2px 4px rgba(255, 255, 255, 0.2),
                  inset -2px -2px 4px rgba(0, 0, 0, 0.1)
                `,
                WebkitTapHighlightColor: 'transparent',
                transform: 'translateY(0)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translateY(2px)';
                e.currentTarget.style.boxShadow = `
                  4px 4px 8px rgba(0, 0, 0, 0.3),
                  -4px -4px 8px rgba(255, 255, 255, 0.05),
                  inset 4px 4px 8px rgba(0, 0, 0, 0.1),
                  inset -4px -4px 8px rgba(255, 255, 255, 0.1)
                `;
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `
                  8px 8px 16px rgba(0, 0, 0, 0.2),
                  -8px -8px 16px rgba(255, 255, 255, 0.1),
                  inset 2px 2px 4px rgba(255, 255, 255, 0.2),
                  inset -2px -2px 4px rgba(0, 0, 0, 0.1)
                `;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `
                  8px 8px 16px rgba(0, 0, 0, 0.2),
                  -8px -8px 16px rgba(255, 255, 255, 0.1),
                  inset 2px 2px 4px rgba(255, 255, 255, 0.2),
                  inset -2px -2px 4px rgba(0, 0, 0, 0.1)
                `;
              }}
              onTouchStart={(e) => {
                e.currentTarget.style.transform = 'translateY(2px)';
                e.currentTarget.style.boxShadow = `
                  4px 4px 8px rgba(0, 0, 0, 0.3),
                  -4px -4px 8px rgba(255, 255, 255, 0.05),
                  inset 4px 4px 8px rgba(0, 0, 0, 0.1),
                  inset -4px -4px 8px rgba(255, 255, 255, 0.1)
                `;
              }}
              onTouchEnd={(e) => {
                // Ensure minimum animation duration for visual feedback
                setTimeout(() => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `
                    8px 8px 16px rgba(0, 0, 0, 0.2),
                    -8px -8px 16px rgba(255, 255, 255, 0.1),
                    inset 2px 2px 4px rgba(255, 255, 255, 0.2),
                    inset -2px -2px 4px rgba(0, 0, 0, 0.1)
                  `;
                }, 150); // Minimum 150ms press animation
              }}
              onFocus={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `
                  8px 8px 16px rgba(0, 0, 0, 0.2),
                  -8px -8px 16px rgba(255, 255, 255, 0.1),
                  inset 2px 2px 4px rgba(255, 255, 255, 0.2),
                  inset -2px -2px 4px rgba(0, 0, 0, 0.1)
                `;
              }}
              onBlur={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `
                  8px 8px 16px rgba(0, 0, 0, 0.2),
                  -8px -8px 16px rgba(255, 255, 255, 0.1),
                  inset 2px 2px 4px rgba(255, 255, 255, 0.2),
                  inset -2px -2px 4px rgba(0, 0, 0, 0.1)
                `;
              }}
            >
              <MessageSquare className="h-[32px] w-[32px] sm:h-[40px] sm:w-[40px] drop-shadow-md" style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15))' }} />
            </Button>
            <Button 
              onClick={handleCall} 
              size="lg" 
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-green-400 to-green-600 active:from-green-600 active:to-green-800 text-white transition-all duration-300 flex items-center justify-center p-0 relative overflow-hidden neomorphic-button focus:outline-none"
              style={{
                boxShadow: `
                  8px 8px 16px rgba(0, 0, 0, 0.2),
                  -8px -8px 16px rgba(255, 255, 255, 0.1),
                  inset 2px 2px 4px rgba(255, 255, 255, 0.2),
                  inset -2px -2px 4px rgba(0, 0, 0, 0.1)
                `,
                WebkitTapHighlightColor: 'transparent',
                transform: 'translateY(0)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translateY(2px)';
                e.currentTarget.style.boxShadow = `
                  4px 4px 8px rgba(0, 0, 0, 0.3),
                  -4px -4px 8px rgba(255, 255, 255, 0.05),
                  inset 4px 4px 8px rgba(0, 0, 0, 0.1),
                  inset -4px -4px 8px rgba(255, 255, 255, 0.1)
                `;
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `
                  8px 8px 16px rgba(0, 0, 0, 0.2),
                  -8px -8px 16px rgba(255, 255, 255, 0.1),
                  inset 2px 2px 4px rgba(255, 255, 255, 0.2),
                  inset -2px -2px 4px rgba(0, 0, 0, 0.1)
                `;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `
                  8px 8px 16px rgba(0, 0, 0, 0.2),
                  -8px -8px 16px rgba(255, 255, 255, 0.1),
                  inset 2px 2px 4px rgba(255, 255, 255, 0.2),
                  inset -2px -2px 4px rgba(0, 0, 0, 0.1)
                `;
              }}
              onTouchStart={(e) => {
                e.currentTarget.style.transform = 'translateY(2px)';
                e.currentTarget.style.boxShadow = `
                  4px 4px 8px rgba(0, 0, 0, 0.3),
                  -4px -4px 8px rgba(255, 255, 255, 0.05),
                  inset 4px 4px 8px rgba(0, 0, 0, 0.1),
                  inset -4px -4px 8px rgba(255, 255, 255, 0.1)
                `;
              }}
              onTouchEnd={(e) => {
                // Ensure minimum animation duration for visual feedback
                setTimeout(() => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `
                    8px 8px 16px rgba(0, 0, 0, 0.2),
                    -8px -8px 16px rgba(255, 255, 255, 0.1),
                    inset 2px 2px 4px rgba(255, 255, 255, 0.2),
                    inset -2px -2px 4px rgba(0, 0, 0, 0.1)
                  `;
                }, 150); // Minimum 150ms press animation
              }}
              onFocus={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `
                  8px 8px 16px rgba(0, 0, 0, 0.2),
                  -8px -8px 16px rgba(255, 255, 255, 0.1),
                  inset 2px 2px 4px rgba(255, 255, 255, 0.2),
                  inset -2px -2px 4px rgba(0, 0, 0, 0.1)
                `;
              }}
              onBlur={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `
                  8px 8px 16px rgba(0, 0, 0, 0.2),
                  -8px -8px 16px rgba(255, 255, 255, 0.1),
                  inset 2px 2px 4px rgba(255, 255, 255, 0.2),
                  inset -2px -2px 4px rgba(0, 0, 0, 0.1)
                `;
              }}
            >
              <Phone className="h-[32px] w-[32px] sm:h-[40px] sm:w-[40px] drop-shadow-md" style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15))' }} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeadCard;
