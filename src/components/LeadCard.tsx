import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { X, Phone, Mail, ChevronDown, Check, MessageSquare, MessagesSquare, Upload, Settings, Trash, Send, Text, Ellipsis, Snowflake, Sun, Flame, MessageCircle } from 'lucide-react';
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
import { formatPhoneNumber, getPhoneDigits } from '../utils/phoneUtils';
import { getStateFromAreaCode } from '../utils/timezoneUtils';
import { Lead } from '@/types/lead';
import { appStorage } from '@/utils/storage';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { useLeadCardTemplates, EmailTemplate, TextTemplate } from '@/hooks/useLeadCardTemplates';
import { useLeadCardSwipe } from '@/hooks/useLeadCardSwipe';
import { useLeadCardActions } from '@/hooks/useLeadCardActions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

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
  onCommentModalOpenChange?: (open: boolean) => void;
  onCommentingChange?: (commenting: boolean) => void;
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
  onSwipeReset,
  onCommentModalOpenChange
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
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const [fadingOutIds, setFadingOutIds] = useState<Set<string>>(new Set());
  const [fadingInIds, setFadingInIds] = useState<Set<string>>(new Set());
  const [leadTag, setLeadTagState] = useState<'cold' | 'warm' | 'hot' | null>(null);
  
  // Modal state for adding comments
  const [isAddCommentModalOpen, setIsAddCommentModalOpen] = useState(false);
  const [modalDraft, setModalDraft] = useState('');
  const modalInputRef = useRef<HTMLTextAreaElement | null>(null);
  // Track keyboard (visual viewport) inset to lift modal above iOS keyboard
  const [keyboardInset, setKeyboardInset] = useState(0);
  const [isModalInputFocused, setIsModalInputFocused] = useState(false);

  useEffect(() => {
    if (!isAddCommentModalOpen) {
      setKeyboardInset(0);
      return;
    }
    const vv = (window as Window & { visualViewport?: VisualViewport }).visualViewport;
    if (!vv) return;

    const update = () => {
      try {
        const layoutViewportHeight = window.innerHeight;
        const vvHeight = vv.height;
        const vvOffsetTop = (vv as unknown as { offsetTop?: number }).offsetTop ?? 0;
        const bottomOverlay = Math.max(0, layoutViewportHeight - (vvHeight + vvOffsetTop));
        setKeyboardInset(bottomOverlay);
      } catch {
        // no-op
      }
    };

    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    update();
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, [isAddCommentModalOpen]);
  
  // Subtle neon backlight color based on lead tag
  const glowColor = useMemo(() => {
    switch (leadTag) {
      case 'cold':
        return 'rgba(59, 130, 246, 0.38)'; // blue-500, slightly stronger
      case 'warm':
        return 'rgba(245, 158, 11, 0.38)'; // amber-500, slightly stronger
      case 'hot':
        return 'rgba(244, 63, 94, 0.38)'; // rose-500, slightly stronger
      default:
        return 'rgba(0,0,0,0)';
    }
  }, [leadTag]);

  const glowActive = useMemo(() => Boolean(leadTag) && !isCardFlipped, [leadTag, isCardFlipped]);

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

  const loadLeadTag = useCallback(async () => {
    try {
      const current = await appStorage.getCurrentCSVId();
      setCsvId(current);
      if (!current) {
        // legacy fallback
        const legacy = localStorage.getItem(`tag:${leadKey}`);
        setLeadTagState(legacy ? (legacy as 'cold' | 'warm' | 'hot') : null);
        return;
      }
      const map = await appStorage.getCSVLeadTags(current);
      setLeadTagState(map[leadKey] ?? null);
    } catch {
      setLeadTagState(null);
    }
  }, [leadKey]);

  const saveLeadTag = useCallback(async (next: 'cold' | 'warm' | 'hot' | null) => {
    setLeadTagState(next);
    try {
      const current = csvId || (await appStorage.getCurrentCSVId());
      if (current) {
        const map = await appStorage.getCSVLeadTags(current);
        map[leadKey] = next;
        await appStorage.saveCSVLeadTags(current, map);
      } else {
        // legacy: store empty string for null
        localStorage.setItem(`tag:${leadKey}`, next ?? '');
      }
    } catch {
      // ignore storage errors
    }
  }, [leadKey, csvId]);

  const toggleLeadTag = useCallback(async (tag: 'cold' | 'warm' | 'hot') => {
    if (leadTag === tag) {
      await saveLeadTag(null);
    } else {
      await saveLeadTag(tag);
    }
  }, [leadTag, saveLeadTag]);

  useEffect(() => {
    loadComments();
    loadLeadTag();
  }, [loadComments, loadLeadTag, leadKey]);

  // Modal comment functions
  const openAddCommentModal = useCallback(() => {
    setIsAddCommentModalOpen(true);
    onCommentModalOpenChange?.(true);
    setModalDraft('');
    // Multiple attempts to ensure keyboard appears on all devices
    setTimeout(() => {
      modalInputRef.current?.focus();
      modalInputRef.current?.click();
    }, 100);
    setTimeout(() => {
      modalInputRef.current?.focus();
      modalInputRef.current?.click();
    }, 200);
    setTimeout(() => {
      modalInputRef.current?.focus();
    }, 300);
  }, [onCommentModalOpenChange]);

  const closeAddCommentModal = useCallback(() => {
    setIsAddCommentModalOpen(false);
    onCommentModalOpenChange?.(false);
    setModalDraft('');
    setIsModalInputFocused(false);
    setKeyboardInset(0);
  }, [onCommentModalOpenChange]);

  const addComment = useCallback((text: string) => {
    if (!text.trim()) return;
    const newComment: LeadComment = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    const next = [...comments, newComment];
    
    saveComments(next);
    
    // Start fade in animation after DOM update
    setTimeout(() => {
      setFadingInIds(prev => new Set(prev).add(newComment.id));
      
      // Remove from fading in after animation completes
      setTimeout(() => {
        setFadingInIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(newComment.id);
          return newSet;
        });
      }, 150);
    }, 10);
  }, [comments, saveComments]);

  const addCommentFromModal = useCallback(() => {
    if (modalDraft.trim()) {
      addComment(modalDraft.trim());
      closeAddCommentModal();
    }
  }, [modalDraft, addComment, closeAddCommentModal]);

  const deleteComment = useCallback((id: string) => {
    // Start fade out animation
    setFadingOutIds(prev => new Set(prev).add(id));
    
    // Remove comment after animation completes
    setTimeout(() => {
      const next = comments.filter(c => c.id !== id);
      saveComments(next);
      setFadingOutIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }, 150);
  }, [comments, saveComments]);


  const handleCommentSelect = useCallback((commentId: string) => {
    setSelectedCommentId(prev => prev === commentId ? null : commentId);
  }, []);

  const {
    selectedPhone,
    updateSelectedPhone,
    handlePhoneSelect,
    handleEmailClick,
    handleTextClick,
    handleCallClick,
    communicationMode,
    setCommunicationMode
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

  // Reset card to front on navigation (previous/next)
  useEffect(() => {
    setIsCardFlipped(false);
  }, [currentIndex]);

  // Pass resetSwipe function up to parent
  useEffect(() => {
    if (onSwipeReset) {
      onSwipeReset(resetSwipe);
    }
  }, [onSwipeReset, resetSwipe]);

  // If we have a noLeadsMessage, show the empty state
  if (noLeadsMessage) {
    return (
      <Card className="shadow-2xl border border-border/60 dark:border-border/70 ring-1 ring-border/40 dark:ring-border/60 rounded-3xl bg-card min-h-[400px] max-h-[500px] sm:min-h-[420px] sm:max-h-[550px] flex flex-col mb-8">
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
    const foundPhones = [] as string[];
    let match;
    
    while ((match = phonePattern.exec(normalizedString)) !== null) {
      // Use the same formatPhoneNumber function for consistency
      const digits = match[1] + match[2] + match[3];
      const formattedPhone = formatPhoneNumber(digits);
      foundPhones.push(formattedPhone);
    }

    // Deduplicate by normalized digits and exclude the primary phone
    const primaryDigits = getPhoneDigits(lead.phone);
    const seen = new Set<string>();
    const uniquePhones: string[] = [];
    for (const phone of foundPhones) {
      const d = getPhoneDigits(phone);
      if (d === primaryDigits) continue; // exclude primary
      if (seen.has(d)) continue; // skip duplicates
      seen.add(d);
      uniquePhones.push(formatPhoneNumber(d));
    }

    return uniquePhones;
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
          // Allow vertical scrolling and horizontal gestures when flipped
          touchAction: isCardFlipped ? 'pan-y pinch-zoom' : undefined
        }}
      >
        {/* Subtler neon backlight with gentle breathing animation when active */}
        <motion.div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          initial={false}
          animate={glowActive 
            ? { opacity: [0.4, 0.65, 0.4], scale: [1.0, 1.004, 1.0] } 
            : { opacity: 0, scale: 1 }}
          transition={glowActive 
            ? { duration: 3.0, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' } 
            : { duration: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
          style={{
            // Slightly stronger outer glow
            boxShadow: `0 0 0 2px ${glowColor}, 0 0 14px ${glowColor}, 0 0 30px ${glowColor}`,
            zIndex: 1
          }}
        />
        {/* Gradient border keyed to temperature tag (static, no spin) */}
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            background: `conic-gradient(from 0deg, transparent 0%, ${glowColor} 12%, transparent 24%, transparent 56%, ${glowColor} 68%, transparent 80%)`,
            mixBlendMode: 'overlay',
            opacity: glowActive ? 0.2 : 0,
            zIndex: 2
          }}
        />
        {/* Subtle glass overlay */}
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
            zIndex: 0
          }}
        />
        <Card 
          className="shadow-2xl border border-border/50 dark:border-border/60 ring-1 ring-border/40 dark:ring-border/60 rounded-3xl bg-card min-h-[420px] max-h-[520px] sm:min-h-[440px] sm:max-h-[580px] flex flex-col mb-4 overflow-hidden relative" 
          style={{
            pointerEvents: 'auto',
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden"
          }}
        >
      <CardContent className="flex-1 flex flex-col overflow-hidden pt-2">
        {/* Top row with left cluster, centered count, right menu */}
        <div className="flex items-center justify-between px-0 sm:px-1 py-2 sm:py-3 pb-1">
          <div className="flex items-center gap-1">
            <button
              onClick={handleFlip}
              className="p-0.5 rounded-full"
              title="Comments"
              style={{ pointerEvents: (isDeleteMode || isSwiping) ? 'none' : 'auto' }}
            >
              <Text className="h-4 w-4 text-muted-foreground/60" />
            </button>
            {comments.length > 0 && (
              <button
                onClick={handleFlip}
                className="text-xs bg-muted-foreground/20 text-muted-foreground/80 w-5 h-5 rounded-full flex items-center justify-center hover:bg-muted-foreground/30 transition-colors"
                style={{ pointerEvents: (isDeleteMode || isSwiping) ? 'none' : 'auto' }}
              >
                {comments.length}
              </button>
            )}
          </div>
          <p className="text-sm text-muted-foreground opacity-40 text-center flex-1">
            {currentIndex + 1}/{totalCount}
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1 rounded-full"
                title="More"
                style={{ pointerEvents: (isDeleteMode || isSwiping) ? 'none' : 'auto' }}
                aria-label="More options"
              >
                <Ellipsis className="h-4 w-4 text-muted-foreground/60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              side="bottom" 
              align="end" 
              sideOffset={6} 
              className="z-50 w-auto min-w-[180px] rounded-xl shadow-lg overflow-hidden bg-background/60 backdrop-blur-sm border border-border/15 p-0 [&>*]:focus:bg-transparent [&>*]:focus:outline-none"
            >
              <DropdownMenuItem 
                onClick={async () => {
                  if (setCommunicationMode) setCommunicationMode('native');
                  try {
                    const settings = await appStorage.getAppSettings();
                    await appStorage.saveAppSettings({ ...settings, communicationMode: 'native' });
                  } catch (err) { console.warn('Failed to persist communication mode (native)', err); }
                }} 
                className="w-full px-4 py-3 text-left transition-colors duration-75 cursor-pointer flex items-center justify-between"
              >
                <span className="text-sm">Native</span>
                {communicationMode === 'native' && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={async () => {
                  if (setCommunicationMode) setCommunicationMode('whatsapp');
                  try {
                    const settings = await appStorage.getAppSettings();
                    await appStorage.saveAppSettings({ ...settings, communicationMode: 'whatsapp' });
                  } catch (err) { console.warn('Failed to persist communication mode (whatsapp)', err); }
                }} 
                className="w-full px-4 py-3 text-left transition-colors duration-75 cursor-pointer flex items-center justify-between"
              >
                <span className="text-sm">WhatsApp</span>
                {communicationMode === 'whatsapp' && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
            {/* Lead priority segmented control */}
            <div className="flex items-center justify-center mt-1">
              <div className="inline-flex items-center rounded-full border border-border/30 bg-background/60 backdrop-blur px-1.5 py-1.5"
                   style={{ WebkitTapHighlightColor: 'transparent' }}>
                <motion.button
                  type="button"
                  onClick={() => toggleLeadTag('cold')}
                  className={`px-3 py-1.5 rounded-full flex items-center gap-1 text-xs relative overflow-hidden ${leadTag === 'cold' ? 'text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/30' : 'text-muted-foreground'}`}
                  whileTap={{ scale: 0.96 }}
                  animate={leadTag === 'cold' ? { backgroundColor: 'rgba(59,130,246,0.14)' } : { backgroundColor: 'rgba(0,0,0,0)' }}
                  transition={{ duration: 0.18 }}
                >
                  <motion.span
                    initial={false}
                    animate={{ rotate: leadTag === 'cold' ? 0 : 0, scale: leadTag === 'cold' ? 1.08 : 1 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                  >
                    <Snowflake className="h-3.5 w-3.5" />
                  </motion.span>
                  <span>Cold</span>
                  {/* Glow ripple */}
                  {leadTag === 'cold' && (
                    <motion.span
                      key="cold-ripple"
                      className="absolute inset-0 rounded-full"
                      initial={{ opacity: 0.35, scale: 0.9 }}
                      animate={{ opacity: 0, scale: 1.25 }}
                      transition={{ duration: 0.35, ease: [0.4, 0.2, 0.2, 1] }}
                      style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.25) 0%, rgba(59,130,246,0) 60%)' }}
                    />
                  )}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => toggleLeadTag('warm')}
                  className={`px-3 py-1.5 rounded-full flex items-center gap-1 text-xs relative overflow-hidden ${leadTag === 'warm' ? 'text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/30' : 'text-muted-foreground'}`}
                  whileTap={{ scale: 0.96 }}
                  animate={leadTag === 'warm' ? { backgroundColor: 'rgba(245,158,11,0.14)' } : { backgroundColor: 'rgba(0,0,0,0)' }}
                  transition={{ duration: 0.18 }}
                >
                  <motion.span
                    initial={false}
                    animate={{ rotate: leadTag === 'warm' ? 0 : 0, scale: leadTag === 'warm' ? 1.08 : 1 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                  >
                    <Sun className="h-3.5 w-3.5" />
                  </motion.span>
                  <span>Warm</span>
                  {leadTag === 'warm' && (
                    <motion.span
                      key="warm-ripple"
                      className="absolute inset-0 rounded-full"
                      initial={{ opacity: 0.35, scale: 0.9 }}
                      animate={{ opacity: 0, scale: 1.25 }}
                      transition={{ duration: 0.35, ease: [0.4, 0.2, 0.2, 1] }}
                      style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.22) 0%, rgba(245,158,11,0) 60%)' }}
                    />
                  )}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => toggleLeadTag('hot')}
                  className={`px-3 py-1.5 rounded-full flex items-center gap-1 text-xs relative overflow-hidden ${leadTag === 'hot' ? 'text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/30' : 'text-muted-foreground'}`}
                  whileTap={{ scale: 0.96 }}
                  animate={leadTag === 'hot' ? { backgroundColor: 'rgba(244,63,94,0.14)' } : { backgroundColor: 'rgba(0,0,0,0)' }}
                  transition={{ duration: 0.18 }}
                >
                  <motion.span
                    initial={false}
                    animate={{ rotate: leadTag === 'hot' ? 0 : 0, scale: leadTag === 'hot' ? 1.08 : 1 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                  >
                    <Flame className="h-3.5 w-3.5" />
                  </motion.span>
                  <span>Hot</span>
                  {leadTag === 'hot' && (
                    <motion.span
                      key="hot-ripple"
                      className="absolute inset-0 rounded-full"
                      initial={{ opacity: 0.35, scale: 0.9 }}
                      animate={{ opacity: 0, scale: 1.25 }}
                      transition={{ duration: 0.35, ease: [0.4, 0.2, 0.2, 1] }}
                      style={{ background: 'radial-gradient(circle, rgba(244,63,94,0.22) 0%, rgba(244,63,94,0) 60%)' }}
                    />
                  )}
                </motion.button>
              </div>
            </div>
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
                              {selectedPhone === phoneData.phone && (
                                <Check className="h-4 w-4 text-foreground ml-2 flex-shrink-0 self-center" />
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
        <div className="space-y-3 px-0 sm:px-0 pb-3 sm:pb-5 pt-0">
          {/* Last called section above buttons */}
          {lead.lastCalled && (
            <div className="flex items-center justify-center w-full px-3 sm:px-5 mt-1">
              <div className="flex items-center justify-center gap-2 mx-auto">
                <p className="text-sm text-muted-foreground transition-opacity duration-300 ease-in-out opacity-100 whitespace-nowrap my-0 py-0 text-center">
                  Last called: {lead.lastCalled}
                </p>
                <button
                  onClick={onResetCallCount}
                  className="p-1 bg-muted rounded transition-colors"
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
          <div className="flex w-full gap-6 sm:gap-10">
            <div className="flex-1 flex justify-center">
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
                {communicationMode === 'whatsapp' ? (
                  <FontAwesomeIcon icon={faWhatsapp} className="h-[32px] w-[32px] sm:h-[40px] sm:w-[40px] mx-auto" style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15))' }} />
                ) : (
                  <MessagesSquare className="h-[32px] w-[32px] sm:h-[40px] sm:w-[40px] drop-shadow-md mx-auto" style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15))' }} />
                )}
              </Button>
              ) : (
                <div 
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-blue-400/50 to-blue-600/50 text-white/50 flex items-center justify-center"
                  style={{
                    pointerEvents: 'none',
                    touchAction: 'none'
                  }}
                >
                  {communicationMode === 'whatsapp' ? (
                    <FontAwesomeIcon icon={faWhatsapp} className="h-[32px] w-[32px] sm:h-[40px] sm:w-[40px] mx-auto" style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15))' }} />
                  ) : (
                    <MessagesSquare className="h-[32px] w-[32px] sm:h-[40px] sm:w-[40px] drop-shadow-md mx-auto" style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15))' }} />
                  )}
                </div>
              )}
            </div>
            <div className="flex-1 flex justify-center">
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
      className="shadow-2xl border border-border/50 dark:border-border/60 ring-1 ring-border/40 dark:ring-border/60 rounded-3xl bg-card min-h-[420px] max-h-[520px] sm:min-h-[440px] sm:max-h-[580px] flex flex-col mb-4 overflow-hidden absolute inset-0" 
      style={{
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden",
        transform: "rotateY(180deg)"
      }}
    >
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <div className="flex items-center justify-center px-0 sm:px-1 py-2 sm:py-3 pb-1">
          <button
            onClick={handleFlip}
            className="text-sm text-muted-foreground opacity-60 cursor-pointer"
          >
            Comments
          </button>
        </div>

        <div 
          className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 scrollbar-thin scrollbar-thumb-border/20 scrollbar-track-transparent" 
          data-comments-scroll="true"
          tabIndex={0}
          style={{
            touchAction: 'pan-y',
            WebkitOverflowScrolling: 'touch',
            outline: 'none'
          }}
        >
          {comments.length === 0 && (
            <p className="text-sm text-muted-foreground/60 mt-2">No comments yet.</p>
          )}
          {comments.map(c => {
            const isFadingIn = fadingInIds.has(c.id);
            const isFadingOut = fadingOutIds.has(c.id);
            
            return (
              <div
                key={c.id}
                className={`border border-border/20 rounded-lg p-3 cursor-pointer mb-3 transition-all duration-150 ease-out ${
                  selectedCommentId === c.id ? 'bg-muted/20' : ''
                } ${
                  isFadingIn ? 'opacity-0' : isFadingOut ? 'opacity-0' : 'opacity-100'
                }`}
                style={{ 
                  touchAction: 'manipulation'
                }}
                onClick={() => handleCommentSelect(c.id)}
              >
            
                  <div className="flex items-start justify-between gap-4">
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-sm whitespace-pre-wrap text-left break-words">{c.text}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {new Date(c.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {selectedCommentId === c.id && (
                      <div className="flex items-center gap-2 self-start flex-shrink-0">
                        <button
                          aria-label="Delete comment"
                          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-red-50 active:bg-red-200 dark:bg-red-900/20 dark:active:bg-red-900/40 transition-colors touch-manipulation"
                          style={{ WebkitTapHighlightColor: 'transparent' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteComment(c.id);
                          }}
                        >
                          <Trash className="h-5 w-5 text-red-600" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Comment Section Footer */}
        <div className="p-4 border-t border-border/20 bg-background/80 backdrop-blur">
          <div className="flex items-center justify-between">
            {/* Comment Count */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              <span>{comments.length} comment{comments.length !== 1 ? 's' : ''}</span>
            </div>
            
            {/* Add Comment Button */}
            <button
              onClick={openAddCommentModal}
              className="text-sm text-foreground/70 hover:text-foreground transition-colors cursor-pointer"
            >
              + Add comment
            </button>
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

      {/* Add Comment Modal */}
      <AnimatePresence>
        {isAddCommentModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-4"
            onClick={closeAddCommentModal}
            style={{
              touchAction: 'none',
              // Position modal in upper-middle area for better visual balance
              paddingTop: 'max(env(safe-area-inset-top) + 80px, 80px)',
            }}
          >
            <motion.div
              initial={{ 
                scale: 0.1, 
                opacity: 0, 
                x: 0,
                y: 0,
                width: '100%',
                height: 'auto'
              }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                x: 0,
                y: 0,
                width: '100%',
                height: 'auto'
              }}
              exit={{ 
                scale: 0.1, 
                opacity: 0, 
                x: 0,
                y: 0,
                width: '100%',
                height: 'auto'
              }}
              transition={{ 
                type: "spring", 
                duration: 0.4,
                bounce: 0.2,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              className="w-full max-w-lg bg-card rounded-3xl border border-border/50 shadow-2xl max-h-[65vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              style={{
                touchAction: 'auto',
                // Reduce max height further when keyboard is visible
                maxHeight: keyboardInset > 0 ? `calc(65vh - ${keyboardInset}px)` : undefined,
              }}
            >
              {/* Modal Content */}
              <div className="flex-1 p-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Comment for {lead.name}
                    </label>
                    <textarea
                      value={modalDraft}
                      onChange={(e) => setModalDraft(e.target.value)}
                      ref={modalInputRef}
                      onFocus={() => {
                        setIsModalInputFocused(true);
                        // Try to eagerly compute inset right after focus
                        const vv = (window as Window & { visualViewport?: VisualViewport }).visualViewport;
                        if (vv) {
                          const compute = () => {
                            try {
                              const layoutViewportHeight = window.innerHeight;
                              const vvHeight = vv.height;
                              const vvOffsetTop = (vv as unknown as { offsetTop?: number }).offsetTop ?? 0;
                              const bottomOverlay = Math.max(0, layoutViewportHeight - (vvHeight + vvOffsetTop));
                              setKeyboardInset(bottomOverlay);
                            } catch {
                              // ignore errors
                            }
                          };
                          compute();
                          setTimeout(compute, 60);
                          setTimeout(compute, 140);
                        }
                      }}
                      onBlur={() => {
                        setIsModalInputFocused(false);
                        // Close modal when keyboard disappears (Done button pressed)
                        setTimeout(() => {
                          if (modalDraft.trim()) {
                            addComment(modalDraft.trim());
                          }
                          closeAddCommentModal();
                        }, 100);
                      }}
                      onKeyDown={(e) => {
                        // Handle Enter key press (Done button on mobile keyboards)
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (modalDraft.trim()) {
                            addComment(modalDraft.trim());
                          }
                          closeAddCommentModal();
                        }
                      }}
                      className="w-full rounded-lg border border-border/30 bg-background px-4 py-3 text-base focus:outline-none min-h-[100px] resize-none"
                      rows={4}
                      placeholder="Type your comment here..."
                      autoFocus
                      autoComplete="off"
                      style={{
                        fontSize: '16px', // Prevent iOS zoom
                        // Help keep the caret zone clear above the keyboard
                        scrollMarginBottom: `calc(${keyboardInset}px + env(safe-area-inset-bottom) + 16px)`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-background/95 backdrop-blur-sm border-t border-border/20">
                <div className="flex items-center gap-3">
                  <button
                    onClick={closeAddCommentModal}
                    className="flex-1 h-12 text-base font-medium text-foreground bg-muted rounded-xl hover:bg-muted/80 active:bg-muted/60 active:scale-[0.98] transition-all duration-150 touch-manipulation"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addCommentFromModal}
                    disabled={!modalDraft.trim()}
                    className="flex-1 h-12 text-base font-medium text-white bg-blue-500 rounded-xl hover:bg-blue-600 active:bg-blue-700 active:scale-[0.98] disabled:bg-muted/50 disabled:text-muted-foreground disabled:active:scale-100 transition-all duration-150 touch-manipulation"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    Add
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default LeadCard;
