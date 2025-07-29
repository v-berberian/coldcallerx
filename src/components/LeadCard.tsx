import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { X, Phone, Mail, ChevronDown, Check, MessageSquare, Upload, Settings } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { formatPhoneNumber } from '../utils/phoneUtils';
import { getStateFromAreaCode } from '../utils/timezoneUtils';
import { Lead } from '@/types/lead';
import { AnimatePresence, motion } from 'framer-motion';
import { useLeadCardTemplates, EmailTemplate, TextTemplate } from '@/hooks/useLeadCardTemplates';
import { useLeadCardSwipe } from '@/hooks/useLeadCardSwipe';
import { useLeadCardActions } from '@/hooks/useLeadCardActions';

interface LeadCardProps {
  lead: Lead;
  currentIndex: number;
  totalCount: number;
  fileName: string;
  currentCSVId?: string | null;
  onCall: (phone: string) => void;
  onResetCallCount: () => void;
  onDeleteLead?: (lead: Lead) => void;
  onCSVSelect?: (csvId: string, leads: Lead[], fileName: string) => void;
  noLeadsMessage?: string;
  refreshTrigger?: number;
  onImportNew?: () => void;
  navigationDirection?: 'forward' | 'backward';
  onSwipeReset?: (resetSwipe: () => void) => void;
}

const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  currentIndex,
  totalCount,
  fileName,
  currentCSVId,
  onCall,
  onResetCallCount,
  onDeleteLead,
  onCSVSelect,
  noLeadsMessage,
  refreshTrigger,
  onImportNew,
  navigationDirection = 'forward',
  onSwipeReset
}) => {
  // Use the extracted hooks
  const {
    emailTemplates,
    textTemplates,
    selectedEmailTemplateId,
    selectedTextTemplateId,
    setSelectedEmailTemplateId,
    setSelectedTextTemplateId
  } = useLeadCardTemplates();

  const {
    isSwiping,
    swipeOffset,
    isDeleteMode,
    cardHeight,
    cardRef,
    measureCardHeight,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleDeleteClick,
    handleCardClick,
    resetSwipe
  } = useLeadCardSwipe(onDeleteLead);

  const {
    selectedPhone,
    updateSelectedPhone,
    handlePhoneSelect,
    handleEmailClick,
    handleTextClick
  } = useLeadCardActions(lead);

  // Delete confirmation dialog state and handler (always execute)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const confirmDelete = useCallback(() => {
    // First close the modal
    setDeleteDialogOpen(false);
    
    // Reset the swipe position immediately for better UX
    resetSwipe();
    
    // Add a small delay before deletion to allow animations to complete
    setTimeout(() => {
      if (onDeleteLead) {
        onDeleteLead(lead);
      }
    }, 150); // Small delay to let modal close animation complete
  }, [onDeleteLead, lead, resetSwipe]);

  // Reset selectedPhone to primary phone when lead changes
  useEffect(() => {
    updateSelectedPhone();
  }, [lead.phone, lead.name, updateSelectedPhone]);

  // Measure card height for delete background
  useEffect(() => {
    measureCardHeight();
  }, [lead, currentIndex, totalCount, measureCardHeight]);

  // Pass resetSwipe function up to parent
  useEffect(() => {
    if (onSwipeReset) {
      onSwipeReset(resetSwipe);
    }
  }, [onSwipeReset, resetSwipe]);

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

  // Email is now guaranteed to be a string or undefined from the importer
  const emailValue = lead.email?.trim() ?? '';
  const hasValidEmail = emailValue && emailValue.includes('@');

  // Completely rewrite phone parsing - handle format: \"773) 643-4644 (773) 643-9346\"
  const additionalPhones = lead.additionalPhones ? (() => {
    const rawString = lead.additionalPhones.trim();

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
      // Use the same formatPhoneNumber function for consistency
      const digits = match[1] + match[2] + match[3];
      const formattedPhone = formatPhoneNumber(digits);
      foundPhones.push(formattedPhone);
    }

    return foundPhones;
  })() : [];

  const hasAdditionalPhones = additionalPhones.length > 0;

  // Create array of all phones with primary phone first
  const allPhones = [
    { phone: formatPhoneNumber(lead.phone), isPrimary: true },
    ...additionalPhones.map(phone => ({ phone, isPrimary: false }))
  ];

  // Get state from area code for display
  const leadState = getStateFromAreaCode(lead.phone);

  // Modified onCall to use selected phone
  const handleCall = () => {
    onCall(selectedPhone);
  };

  // Get the selected templates
  const selectedEmailTemplate = emailTemplates.find(t => t.id === selectedEmailTemplateId);
  const selectedTextTemplate = textTemplates.find(t => t.id === selectedTextTemplateId);

  
  return (
    <div className="relative">
      {/* Delete background indicator */}
      <div 
        className="absolute bg-red-500 rounded-3xl flex items-center justify-center pointer-events-auto"
        onClick={() => setDeleteDialogOpen(true)}
        style={{ 
          opacity: isDeleteMode ? 1 : 0,
          height: cardHeight > 0 ? `${cardHeight}px` : 'auto',
          width: '50%',
          top: 0,
          right: 0,
          bottom: 0,
          transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <X className="h-8 w-8 text-white" style={{ transform: 'translateX(150%)' }} />
      </div>
      
      <motion.div
        ref={cardRef}
        className="relative"
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: isSwiping 
            ? 'none' 
            : 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Card 
          className="shadow-2xl border-border/30 rounded-3xl bg-background min-h-[400px] max-h-[500px] sm:min-h-[420px] sm:max-h-[550px] flex flex-col mb-4 overflow-hidden relative" 
          onClick={handleCardClick}
          onTouchStart={handleCardClick}
          style={{
            pointerEvents: 'auto'
          }}
        >
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        {/* Top row with lead count and file name */}
        <div className="flex items-center justify-center p-3 sm:p-5 pb-0">
          <p className="text-sm text-muted-foreground opacity-40">
            {currentIndex + 1}/{totalCount}
          </p>
        </div>

        {/* Lead info - Main content area */}
        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={`${lead.phone}-${currentIndex}`}
              initial={{ 
                opacity: 0, 
                scale: 0.8, 
                filter: 'blur(20px)', 
                x: navigationDirection === 'forward' ? 120 : -120 
              }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', x: 0 }}
              exit={{ 
                opacity: 0, 
                scale: 0.8, 
                filter: 'blur(20px)', 
                x: navigationDirection === 'forward' ? -120 : 120 
              }}
              transition={{ duration: 0.25, ease: [0.4, 0.2, 0.2, 1] }}
              className="text-center space-y-4 sm:space-y-5 p-3 sm:p-5"
            >
          {/* State and timezone - always show, with fallback */}
          <p className="text-sm text-muted-foreground">
            {leadState || 'Unknown State'}
          </p>
          {/* Group 1: Name and Company */}
            <div className="space-y-1">
            <div className="flex items-center justify-center px-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-center break-words leading-tight bg-gradient-to-r from-foreground to-foreground/95 bg-clip-text text-transparent dark:bg-none dark:text-foreground">
                {lead.name}
              </h2>
            </div>
            {lead.company && (
              <div className="flex items-center justify-center px-2">
                <p className="text-base sm:text-lg font-medium text-center break-words leading-relaxed bg-gradient-to-r from-muted-foreground to-muted-foreground/90 bg-clip-text text-transparent dark:bg-none dark:text-muted-foreground">
                  {lead.company}
                </p>
              </div>
            )}
          </div>
          {/* Group 2: Phone and Email */}
            <div className="space-y-2">
            {/* Phone number with icon positioned to the left */}
            <div className="flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                {hasAdditionalPhones ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger 
                      className="flex items-center gap-1 cursor-pointer transition-colors"
                      style={{
                        pointerEvents: isDeleteMode ? 'none' : 'auto'
                      }}
                      disabled={isDeleteMode}
                    >
                      <p className="text-base sm:text-lg font-mono tracking-wider bg-gradient-to-r from-muted-foreground to-muted-foreground/95 bg-clip-text text-transparent dark:bg-none dark:text-muted-foreground">{selectedPhone}</p>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
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
                            className="w-full px-4 py-3 text-left border-b border-border/10 last:border-b-0 transition-colors duration-75 cursor-pointer relative"
                          >
                            <div className="flex justify-between items-center w-full">
                              <span className={`text-foreground font-mono tracking-wider ${phoneData.isPrimary ? 'font-bold' : 'font-medium'}`}> 
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
                  <p className="text-base sm:text-lg font-mono tracking-wider bg-gradient-to-r from-muted-foreground to-muted-foreground/95 bg-clip-text text-transparent dark:bg-none dark:text-muted-foreground">{selectedPhone}</p>
                )}
              </div>
            </div>
            {/* Email with icon positioned to the left */}
            {hasValidEmail && (
              <div className="flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <button
                    onClick={() => handleEmailClick(selectedEmailTemplate)}
                    className="text-sm text-muted-foreground text-center break-words transition-colors duration-200 cursor-pointer"
                    title="Click to send email"
                    style={{
                      pointerEvents: isDeleteMode ? 'none' : 'auto'
                    }}
                  >
                    {emailValue}
                  </button>
                </div>
              </div>
            )}
          </div>
          </motion.div>
        </AnimatePresence>
        </div>

        {/* Group 3: Last Called and Action Buttons */}
        <div className="space-y-3 p-3 sm:p-5 pt-0">
          {/* Last called section above buttons */}
          {lead.lastCalled && (
            <div className="flex items-center justify-center w-full">
              <div className="flex items-center justify-center">
                <p className="text-sm text-muted-foreground transition-opacity duration-300 ease-in-out opacity-100 whitespace-nowrap my-0 py-0">
                  Last called: {lead.lastCalled}
                </p>
                <button
                  onClick={onResetCallCount}
                  className="ml-2 p-1 bg-muted rounded transition-colors"
                  title="Clear last called"
                  style={{
                    pointerEvents: isDeleteMode ? 'none' : 'auto'
                  }}
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                </button>
              </div>
            </div>
          )}
          
          {/* Action Buttons - Call and Text */}
          <div className="flex w-full gap-3">
            <div className="flex-1 flex justify-center" style={{ marginLeft: '-1.5rem' }}>
              {!isDeleteMode ? (
              <Button 
                  onClick={e => {
                    handleTextClick(selectedTextTemplate);
                  }}
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
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    pointerEvents: 'auto',
                    touchAction: 'manipulation'
                }}
                  onMouseDown={e => {
                  e.currentTarget.style.transform = 'translateY(2px)';
                  e.currentTarget.style.boxShadow = `
                    4px 4px 8px rgba(0, 0, 0, 0.3),
                    -4px -4px 8px rgba(255, 255, 255, 0.05),
                    inset 4px 4px 8px rgba(0, 0, 0, 0.1),
                    inset -4px -4px 8px rgba(255, 255, 255, 0.1)
                  `;
                }}
                  onMouseUp={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `
                    8px 8px 16px rgba(0, 0, 0, 0.2),
                    -8px -8px 16px rgba(255, 255, 255, 0.1),
                    inset 2px 2px 4px rgba(255, 255, 255, 0.2),
                    inset -2px -2px 4px rgba(0, 0, 0, 0.1)
                  `;
                }}
                  onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `
                    8px 8px 16px rgba(0, 0, 0, 0.2),
                    -8px -8px 16px rgba(255, 255, 255, 0.1),
                    inset 2px 2px 4px rgba(255, 255, 255, 0.2),
                    inset -2px -2px 4px rgba(0, 0, 0, 0.1)
                  `;
                }}
                  onTouchStart={e => {
                  e.currentTarget.style.transform = 'translateY(2px)';
                  e.currentTarget.style.boxShadow = `
                    4px 4px 8px rgba(0, 0, 0, 0.3),
                    -4px -4px 8px rgba(255, 255, 255, 0.05),
                    inset 4px 4px 8px rgba(0, 0, 0, 0.1),
                    inset -4px -4px 8px rgba(255, 255, 255, 0.1)
                  `;
                }}
                  onTouchEnd={e => {
                  setTimeout(() => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = `
                      8px 8px 16px rgba(0, 0, 0, 0.2),
                      -8px -8px 16px rgba(255, 255, 255, 0.1),
                      inset 2px 2px 4px rgba(255, 255, 255, 0.2),
                      inset -2px -2px 4px rgba(0, 0, 0, 0.1)
                    `;
                  }, 150);
                }}
                  onFocus={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `
                    8px 8px 16px rgba(0, 0, 0, 0.2),
                    -8px -8px 16px rgba(255, 255, 255, 0.1),
                    inset 2px 2px 4px rgba(255, 255, 255, 0.2),
                    inset -2px -2px 4px rgba(0, 0, 0, 0.1)
                  `;
                }}
                  onBlur={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `
                    8px 8px 16px rgba(0, 0, 0, 0.2),
                    -8px -8px 16px rgba(255, 255, 255, 0.1),
                    inset 2px 2px 4px rgba(255, 255, 255, 0.2),
                    inset -2px -2px 4px rgba(0, 0, 0, 0.1)
                  `;
                }}
              >
                <MessageSquare className="h-[32px] w-[32px] sm:h-[40px] sm:w-[40px] drop-shadow-md mx-auto" style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15))' }} />
              </Button>
              ) : (
                <div 
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-blue-400/50 to-blue-600/50 text-white/50 flex items-center justify-center"
                  style={{
                    pointerEvents: 'none',
                    touchAction: 'none'
                  }}
                >
                  <MessageSquare className="h-[32px] w-[32px] sm:h-[40px] sm:w-[40px] drop-shadow-md mx-auto" style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15))' }} />
                </div>
              )}
            </div>
            <div className="flex-1 flex justify-center" style={{ marginRight: '-1.5rem' }}>
              {!isDeleteMode ? (
              <Button 
                  onClick={e => {
                    handleCall();
                  }}
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
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    pointerEvents: 'auto',
                    touchAction: 'manipulation'
                }}
                  onMouseDown={e => {
                  e.currentTarget.style.transform = 'translateY(2px)';
                  e.currentTarget.style.boxShadow = `
                    4px 4px 8px rgba(0, 0, 0, 0.3),
                    -4px -4px 8px rgba(255, 255, 255, 0.05),
                    inset 4px 4px 8px rgba(0, 0, 0, 0.1),
                    inset -4px -4px 8px rgba(255, 255, 255, 0.1)
                  `;
                }}
                  onMouseUp={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `
                    8px 8px 16px rgba(0, 0, 0, 0.2),
                    -8px -8px 16px rgba(255, 255, 255, 0.1),
                    inset 2px 2px 4px rgba(255, 255, 255, 0.2),
                    inset -2px -2px 4px rgba(0, 0, 0, 0.1)
                  `;
                }}
                  onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `
                    8px 8px 16px rgba(0, 0, 0, 0.2),
                    -8px -8px 16px rgba(255, 255, 255, 0.1),
                    inset 2px 2px 4px rgba(255, 255, 255, 0.2),
                    inset -2px -2px 4px rgba(0, 0, 0, 0.1)
                  `;
                }}
                  onTouchStart={e => {
                  e.currentTarget.style.transform = 'translateY(2px)';
                  e.currentTarget.style.boxShadow = `
                    4px 4px 8px rgba(0, 0, 0, 0.3),
                    -4px -4px 8px rgba(255, 255, 255, 0.05),
                    inset 4px 4px 8px rgba(0, 0, 0, 0.1),
                    inset -4px -4px 8px rgba(255, 255, 255, 0.1)
                  `;
                }}
                  onTouchEnd={e => {
                  setTimeout(() => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = `
                      8px 8px 16px rgba(0, 0, 0, 0.2),
                      -8px -8px 16px rgba(255, 255, 255, 0.1),
                      inset 2px 2px 4px rgba(255, 255, 255, 0.2),
                      inset -2px -2px 4px rgba(0, 0, 0, 0.1)
                    `;
                  }, 150);
                }}
                  onFocus={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `
                    8px 8px 16px rgba(0, 0, 0, 0.2),
                    -8px -8px 16px rgba(255, 255, 255, 0.1),
                    inset 2px 2px 4px rgba(255, 255, 255, 0.2),
                    inset -2px -2px 4px rgba(0, 0, 0, 0.1)
                  `;
                }}
                  onBlur={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `
                    8px 8px 16px rgba(0, 0, 0, 0.2),
                    -8px -8px 16px rgba(255, 255, 255, 0.1),
                    inset 2px 2px 4px rgba(255, 255, 255, 0.2),
                    inset -2px -2px 4px rgba(0, 0, 0, 0.1)
                  `;
                }}
              >
                <Phone className="h-[32px] w-[32px] sm:h-[40px] sm:w-[40px] drop-shadow-md mx-auto" style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15))' }} />
              </Button>
              ) : (
                <div 
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-green-400/50 to-green-600/50 text-white/50 flex items-center justify-center"
                  style={{
                    pointerEvents: 'none',
                    touchAction: 'none'
                  }}
                >
                  <Phone className="h-[32px] w-[32px] sm:h-[40px] sm:w-[40px] drop-shadow-md mx-auto" style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15))' }} />
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
      </motion.div>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lead</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this lead? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg h-12 min-h-12">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white rounded-lg h-12 min-h-12">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default LeadCard;
