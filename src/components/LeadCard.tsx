import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { X, Phone, Mail, ChevronDown, Check, MessageSquare, Upload, Settings, Edit3, Trash, MessageCircle } from 'lucide-react';
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
import { appStorage } from '@/utils/storage';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
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

  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const handleFlip = useCallback(() => setIsCardFlipped((prev) => !prev), []);
  const [isPhoneMenuOpen, setIsPhoneMenuOpen] = useState(false);
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
    resetSwipe,
    gestureType
  } = useLeadCardSwipe(onDeleteLead, handleFlip, isCardFlipped);

  // Clear any delete state when flipping to avoid lingering clickable areas
  useEffect(() => {
    resetSwipe();
    // Close any open menus (e.g., additional numbers) when flipping
    if (isCardFlipped) {
      setIsPhoneMenuOpen(false);
    }
  }, [isCardFlipped, resetSwipe]);

  // --- Simple local comments (per lead), Trello-style ---
  type LeadComment = { id: string; text: string; createdAt: string };
  const leadKey = useMemo(() => `${lead.name}__${lead.phone}`, [lead.name, lead.phone]);
  const [csvId, setCsvId] = useState<string | null>(null);
  const [comments, setComments] = useState<LeadComment[]>([]);
  const [draft, setDraft] = useState('');
  const commentInputRef = useRef<HTMLTextAreaElement | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [addFxVisible, setAddFxVisible] = useState(false);

  const loadComments = useCallback(async () => {
    try {
      const current = await appStorage.getCurrentCSVId();
      setCsvId(current);
      if (!current) {
        // fallback to legacy localStorage per-lead
        const legacy = localStorage.getItem(`comments:${leadKey}`);
        setComments(legacy ? JSON.parse(legacy) : []);
        return;
      }
      const map = await appStorage.getCSVComments(current);
      setComments(map[leadKey] || []);
    } catch {
      setComments([]);
    }
  }, [leadKey]);

  const saveComments = useCallback(async (next: LeadComment[]) => {
    setComments(next);
    try {
      const current = csvId || (await appStorage.getCurrentCSVId());
      if (current) {
        const map = await appStorage.getCSVComments(current);
        map[leadKey] = next;
        await appStorage.saveCSVComments(current, map);
      } else {
        // legacy fallback
        localStorage.setItem(`comments:${leadKey}`, JSON.stringify(next));
      }
    } catch {
      // ignore storage errors
    }
  }, [leadKey, csvId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const addComment = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    const newComment: LeadComment = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      text,
      createdAt: new Date().toISOString(),
    };
    const next = [...comments, newComment];
    saveComments(next);
    setDraft('');
    // Trigger a brief success animation on the Add button
    setAddFxVisible(true);
    setTimeout(() => setAddFxVisible(false), 450);
    // Keep keyboard open by restoring focus to the textarea
    setTimeout(() => {
      const el = commentInputRef.current;
      if (el) {
        el.focus();
        const len = el.value.length;
        try {
          el.setSelectionRange(len, len);
        } catch {
          // ignore selection errors
        }
      }
    }, 0);
  }, [draft, comments, saveComments]);

  const deleteComment = useCallback((id: string) => {
    const next = comments.filter(c => c.id !== id);
    saveComments(next);
  }, [comments, saveComments]);

  const startEdit = useCallback((id: string) => {
    const c = comments.find(c => c.id === id);
    if (!c) return;
    setEditingId(id);
    setEditingText(c.text);
  }, [comments]);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditingText('');
  }, []);

  const saveEdit = useCallback(() => {
    if (!editingId) return;
    const text = editingText.trim();
    if (!text) { cancelEdit(); return; }
    const next = comments.map(c => c.id === editingId ? { ...c, text } : c);
    saveComments(next);
    cancelEdit();
  }, [editingId, editingText, comments, saveComments, cancelEdit]);

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
        className="absolute bg-red-500 rounded-3xl flex items-center justify-center"
        onClick={() => { if (!isCardFlipped && isDeleteMode) setDeleteDialogOpen(true); }}
        style={{ 
          opacity: !isCardFlipped && isDeleteMode ? 1 : 0,
          pointerEvents: !isCardFlipped && isDeleteMode ? 'auto' : 'none',
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
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        animate={{ 
          // Keep rotation strictly tied to flip state to avoid overlap during swipe
          rotateY: isCardFlipped ? 180 : 0,
          // Only translate during delete gestures; otherwise, keep centered
          translateX: gestureType === 'delete' ? swipeOffset : 0
        }}
        transition={{ 
          duration: 0.6, 
          ease: [0.25, 0.46, 0.45, 0.94],
          type: "spring",
          stiffness: 200,
          damping: 20
        }}
        style={{
          transformStyle: "preserve-3d",
          perspective: "1000px",
          // Prefer vertical scrolling when the card is flipped
          touchAction: isCardFlipped ? 'pan-y' : undefined
        }}
      >
        <Card 
          className="shadow-2xl border-border/30 rounded-3xl bg-background min-h-[400px] max-h-[500px] sm:min-h-[420px] sm:max-h-[550px] flex flex-col mb-4 overflow-hidden relative" 
          onClick={(e) => handleCardClick(e)}
          onTouchStart={(e) => handleCardClick(e)}
          style={{
            pointerEvents: 'auto',
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden"
          }}
        >
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        {/* Top row with comment icon, lead count and file name */}
        <div className="flex items-center justify-between p-3 sm:p-5 pb-0">
          <div className="flex items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsCardFlipped(true);
              }}
              className="p-1.5 rounded-full hover:bg-muted/50 transition-colors"
              disabled={isDeleteMode || isSwiping}
            >
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground opacity-40">
            {currentIndex + 1}/{totalCount}
          </p>
          <div className="w-7" /> {/* Spacer to center the count */}
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
                  <DropdownMenu open={isPhoneMenuOpen} onOpenChange={setIsPhoneMenuOpen}>
                    <DropdownMenuTrigger 
                      className="flex items-center gap-1 cursor-pointer transition-colors"
                      style={{
                        pointerEvents: (isDeleteMode || isCardFlipped || isSwiping) ? 'none' : 'auto'
                      }}
                      disabled={isDeleteMode || isCardFlipped || isSwiping}
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

    {/* Back side of the card - Trello-style comments */}
    <Card 
      className="shadow-2xl border-border/30 rounded-3xl bg-background min-h-[400px] max-h-[500px] sm:min-h-[420px] sm:max-h-[550px] flex flex-col mb-4 overflow-hidden absolute inset-0" 
      style={{
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden",
        transform: "rotateY(180deg)"
      }}
    >
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <div className="flex items-center justify-between p-3 sm:p-5 pb-2">
          <div className="flex items-center gap-1">
            <button
              onClick={handleFlip}
              className="p-1 rounded-full"
            >
              <MessageSquare className="h-4 w-4 text-muted-foreground/60" />
            </button>
            <span className="text-sm text-muted-foreground opacity-60">Comments</span>
          </div>
          <div className="w-5 h-5" />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 space-y-3" data-comments-scroll="true">
          {comments.length === 0 && (
            <p className="text-sm text-muted-foreground/60 mt-2">No comments yet.</p>
          )}
          <LayoutGroup id={`lead-comments-${leadKey}`}>
            <AnimatePresence initial={false}>
              {comments.map(c => (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 520, damping: 30, mass: 0.45, layout: { type: 'spring', stiffness: 520, damping: 30, mass: 0.45 } }}
                  className="border border-border/20 rounded-lg p-3"
                  style={{ willChange: 'transform' }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {editingId === c.id ? (
                      <motion.div
                        key="edit"
                        layout
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ type: 'spring', stiffness: 520, damping: 28, mass: 0.45, layout: { type: 'spring', stiffness: 520, damping: 28, mass: 0.45 } }}
                        className="flex items-center gap-3"
                      >
                        <textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="flex-1 rounded-md border border-border/30 bg-background px-3 text-sm focus:outline-none min-h-[44px] py-2"
                          rows={2}
                        />
                        <div className="flex items-center gap-2 self-center">
                          <Button size="sm" onClick={saveEdit}>Save</Button>
                          <Button size="sm" variant="secondary" onClick={cancelEdit}>Cancel</Button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="view"
                        layout
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ type: 'spring', stiffness: 520, damping: 28, mass: 0.45, layout: { type: 'spring', stiffness: 520, damping: 28, mass: 0.45 } }}
                        className="flex items-center justify-between gap-4"
                      >
                        <div className="text-left w-full">
                          <p className="text-sm whitespace-pre-wrap text-left">{c.text}</p>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            {new Date(c.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 self-center">
                        <motion.button
                          whileTap={{ scale: 0.92 }}
                            aria-label="Edit comment"
                            className="rounded-md p-2 active:bg-muted/80"
                            onClick={() => startEdit(c.id)}
                          >
                            <Edit3 className="h-4 w-4 text-muted-foreground" />
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.92 }}
                            aria-label="Delete comment"
                            className="rounded-md p-2 active:bg-muted/80"
                            onClick={() => deleteComment(c.id)}
                          >
                          <Trash className="h-4 w-4 text-red-600" />
                        </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </LayoutGroup>
        </div>

        <div className="p-4 border-t border-border/20 bg-background/80 backdrop-blur">
          <div className="flex items-center gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              ref={commentInputRef}
              className="flex-1 rounded-md border border-border/30 bg-background px-3 text-sm focus:outline-none h-11 resize-none py-2 text-left placeholder:text-left"
              rows={1}
              placeholder="Add a comment..."
            />
            <div className="relative shrink-0">
              <motion.div
                whileTap={{ scale: 0.92 }}
                animate={addFxVisible ? { scale: [1, 1.12, 1] } : {}}
                transition={{ duration: 0.2, ease: [0.2, 0.7, 0.4, 1] }}
              >
                <Button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const el = commentInputRef.current;
                    if (el) el.focus();
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    const el = commentInputRef.current;
                    if (el) el.focus();
                  }}
                  onClick={addComment}
                  className="h-11 px-4"
                  tabIndex={-1}
                >
                  Add
                </Button>
              </motion.div>
              <AnimatePresence>
                {addFxVisible && (
                  <motion.span
                    key="add-ripple"
                    className="absolute inset-0 rounded-md bg-green-500/15 pointer-events-none"
                    initial={{ opacity: 0.35, scale: 0.92 }}
                    animate={{ opacity: 0, scale: 1.22 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.2, 0.7, 0.4, 1] }}
                  />
                )}
              </AnimatePresence>
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
