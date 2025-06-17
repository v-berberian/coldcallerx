import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

interface SearchAutocompleteProps {
  isVisible: boolean;
  onAnimationComplete?: () => void;
  children: React.ReactNode;
}

const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({ 
  isVisible,
  onAnimationComplete,
  children
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setIsAnimating(true);
    } else if (shouldRender) {
      setIsAnimating(false);
      // Fade out animation duration
      const timer = setTimeout(() => {
        setShouldRender(false);
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }, 20); // Reduced from 50ms to 20ms for even faster disappearance
      return () => clearTimeout(timer);
    }
  }, [isVisible, shouldRender, onAnimationComplete]);

  if (!shouldRender) {
    return null;
  }

  const animationClass = isAnimating ? 'animate-slide-down' : 'animate-fade-out';

  return (
    <div className={`absolute top-full left-0 right-0 z-50 mt-1 rounded-xl shadow-lg overflow-hidden ${animationClass} bg-background/15 backdrop-blur-sm border border-border/15`}>
      {children}
    </div>
  );
};

export default SearchAutocomplete;
