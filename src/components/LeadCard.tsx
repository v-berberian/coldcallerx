import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { formatPhoneNumber } from '../utils/phoneUtils';
import { getStateFromAreaCode } from '../utils/timezoneUtils';
import { Browser } from '@capacitor/browser';

interface Lead {
  name: string;
  phone: string;
  called?: number;
  lastCalled?: string;
}

interface LeadCardProps {
  lead: Lead;
  currentIndex: number;
  totalCount: number;
  fileName: string;
  cardKey: number;
  onCall: () => void;
  onResetCallCount: () => void;
  onSwipeRight?: () => void;
}

const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  currentIndex,
  totalCount,
  fileName,
  cardKey,
  onCall,
  onResetCallCount,
  onSwipeRight
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startY = useRef(0);

  const handleEmailSend = async () => {
    const subject = `Contact: ${lead.name} - ${formatPhoneNumber(lead.phone)}`;
    const body = `Name: ${lead.name}\nPhone: ${formatPhoneNumber(lead.phone)}`;
    const mailtoUrl = `mailto:inbox@app.trello.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    try {
      await Browser.open({ url: mailtoUrl });
    } catch (error) {
      // Fallback for web
      window.location.href = mailtoUrl;
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isAnimating) return;
    setIsDragging(true);
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isAnimating) return;
    setIsDragging(true);
    startX.current = e.clientX;
    startY.current = e.clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || isAnimating) return;
    e.preventDefault();
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - startX.current;
    const deltaY = currentY - startY.current;
    
    // Only allow right swipes
    if (deltaX > 0) {
      setDragX(deltaX);
      setDragY(deltaY * 0.1); // Slight vertical movement
      setRotation(deltaX * 0.1); // Rotation based on horizontal movement
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isAnimating) return;
    
    const deltaX = e.clientX - startX.current;
    const deltaY = e.clientY - startY.current;
    
    // Only allow right swipes
    if (deltaX > 0) {
      setDragX(deltaX);
      setDragY(deltaY * 0.1);
      setRotation(deltaX * 0.1);
    }
  };

  const handleEnd = () => {
    if (!isDragging || isAnimating) return;
    setIsDragging(false);
    
    const swipeThreshold = 120;
    
    if (dragX > swipeThreshold) {
      // Swipe right - animate out and send email
      setIsAnimating(true);
      setDragX(window.innerWidth);
      setRotation(30);
      
      setTimeout(async () => {
        await handleEmailSend();
        onSwipeRight?.();
        
        // Reset card position
        setDragX(0);
        setDragY(0);
        setRotation(0);
        setIsAnimating(false);
      }, 300);
    } else {
      // Snap back
      setDragX(0);
      setDragY(0);
      setRotation(0);
    }
  };

  const handleTouchEnd = () => handleEnd();
  const handleMouseUp = () => handleEnd();

  // Add mouse leave handler to reset if mouse leaves the card
  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragX(0);
      setDragY(0);
      setRotation(0);
    }
  };

  useEffect(() => {
    const handleMouseMoveGlobal = (e: MouseEvent) => {
      if (!isDragging || isAnimating) return;
      
      const deltaX = e.clientX - startX.current;
      const deltaY = e.clientY - startY.current;
      
      if (deltaX > 0) {
        setDragX(deltaX);
        setDragY(deltaY * 0.1);
        setRotation(deltaX * 0.1);
      }
    };

    const handleMouseUpGlobal = () => {
      if (isDragging) {
        handleEnd();
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMoveGlobal);
      document.addEventListener('mouseup', handleMouseUpGlobal);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMoveGlobal);
      document.removeEventListener('mouseup', handleMouseUpGlobal);
    };
  }, [isDragging, isAnimating]);

  const opacity = Math.max(0.7, 1 - (dragX / 300));
  const scale = Math.max(0.95, 1 - (dragX / 1000));

  return (
    <div className="relative">
      {/* Swipe hint overlay */}
      {dragX > 50 && (
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 rounded-[28px]"
          style={{
            background: 'rgba(34, 197, 94, 0.2)',
            opacity: Math.min(1, dragX / 120)
          }}
        >
          <div className="text-green-600 font-bold text-xl">
            📧 Send Email
          </div>
        </div>
      )}
      
      <Card 
        ref={cardRef}
        key={cardKey} 
        className="shadow-2xl border-border/50 rounded-3xl bg-card h-[400px] flex flex-col animate-scale-in cursor-grab active:cursor-grabbing select-none"
        style={{
          transform: `translateX(${dragX}px) translateY(${dragY}px) rotate(${rotation}deg) scale(${scale})`,
          opacity: opacity,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out, opacity 0.3s ease-out',
          transformOrigin: 'center bottom'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
      >
        <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
          {/* Top row with lead count and file name */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground opacity-40">
              {currentIndex + 1}/{totalCount}
            </p>
            <p className="text-sm text-muted-foreground opacity-40">
              {fileName}
            </p>
          </div>

          {/* Lead info - Main content area with animation */}
          <div key={`${lead.name}-${lead.phone}`} className="text-center space-y-3 flex-1 flex flex-col justify-center animate-content-change">
            {/* State and timezone - moved to top with same font size as "Called: times" */}
            <p className="text-sm text-muted-foreground">
              {getStateFromAreaCode(lead.phone)}
            </p>
            
            <h2 className="text-3xl font-bold text-foreground">{lead.name}</h2>
            
            <p className="text-lg text-muted-foreground text-center">{formatPhoneNumber(lead.phone)}</p>
            
            <div className="relative flex flex-col items-center space-y-3">
              <div className="flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Called: {lead.called || 0} times
                </p>
                {(lead.called || 0) > 0 && (
                  <button
                    onClick={onResetCallCount}
                    className="ml-2 p-1 bg-muted rounded transition-colors"
                    title="Reset call count"
                  >
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                )}
              </div>
              {/* Reserve space for last called text to prevent layout shift */}
              <div className="h-5 flex items-center justify-center">
                {lead.lastCalled && (
                  <p className="text-sm text-muted-foreground animate-fade-in whitespace-nowrap">
                    Last called: {lead.lastCalled}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Main Call Button - with fixed hover styles */}
          <Button 
            onClick={onCall} 
            size="lg" 
            className="w-full h-16 text-lg font-semibold bg-green-600 hover:bg-green-600 text-white rounded-2xl shadow-lg"
          >
            Call
          </Button>
          
          {/* Swipe instruction */}
          <p className="text-xs text-muted-foreground text-center opacity-60">
            Swipe right to send contact via email →
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadCard;
