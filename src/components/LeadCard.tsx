
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { formatPhoneNumber } from '../utils/phoneUtils';
import { getStateFromAreaCode } from '../utils/timezoneUtils';

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
  const [dragOffset, setDragOffset] = useState(0);
  const [startX, setStartX] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    
    const deltaX = clientX - startX;
    // Only allow right swipes (positive deltaX)
    if (deltaX > 0) {
      setDragOffset(deltaX);
    }
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // If swiped more than 150px to the right, trigger swipe action
    if (dragOffset > 150) {
      handleSwipeRight();
    } else {
      // Reset position if not swiped far enough
      setDragOffset(0);
    }
  };

  const handleSwipeRight = () => {
    // Send email via native mail app
    const subject = encodeURIComponent(`${lead.name} - ${formatPhoneNumber(lead.phone)}`);
    const body = encodeURIComponent(`Contact: ${lead.name}\nPhone: ${formatPhoneNumber(lead.phone)}`);
    const mailtoUrl = `mailto:inbox@app.trello.com?subject=${subject}&body=${body}`;
    
    // Open native mail app
    window.location.href = mailtoUrl;
    
    // Animate card out and call onSwipeRight
    setDragOffset(1000);
    setTimeout(() => {
      setDragOffset(0);
      onSwipeRight?.();
    }, 300);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // Add global mouse move and up listeners when dragging
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        handleDragMove(e.clientX);
      };

      const handleGlobalMouseUp = () => {
        handleDragEnd();
      };

      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, startX, dragOffset]);

  const getCardStyle = () => {
    const rotation = dragOffset * 0.1; // Slight rotation based on drag
    const opacity = Math.max(0.3, 1 - (dragOffset / 300));
    
    return {
      transform: `translateX(${dragOffset}px) rotate(${rotation}deg)`,
      opacity: opacity,
      transition: isDragging ? 'none' : 'transform 0.3s ease-out, opacity 0.3s ease-out',
      cursor: isDragging ? 'grabbing' : 'grab'
    };
  };

  return (
    <div className="relative">
      {/* Background hint when dragging */}
      {dragOffset > 50 && (
        <div className="absolute inset-0 bg-green-500/20 rounded-3xl flex items-center justify-center animate-pulse">
          <div className="text-green-600 font-bold text-xl">Email to Trello!</div>
        </div>
      )}
      
      <Card 
        ref={cardRef}
        key={cardKey} 
        className="shadow-2xl border-border/50 rounded-3xl bg-card h-[400px] flex flex-col animate-scale-in select-none"
        style={getCardStyle()}
        onMouseDown={handleMouseDown}
        onMouseMove={isDragging ? handleMouseMove : undefined}
        onMouseUp={isDragging ? handleMouseUp : undefined}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <CardContent className="p-6 space-y-4 flex-1 flex flex-col pointer-events-none">
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
                    className="ml-2 p-1 bg-muted rounded transition-colors pointer-events-auto"
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
            className="w-full h-16 text-lg font-semibold bg-green-600 hover:bg-green-600 text-white rounded-2xl shadow-lg pointer-events-auto"
          >
            Call
          </Button>
        </CardContent>
      </Card>
      
      {/* Swipe instruction */}
      {!isDragging && dragOffset === 0 && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground opacity-60">
          Swipe right to email to Trello
        </div>
      )}
    </div>
  );
};

export default LeadCard;
