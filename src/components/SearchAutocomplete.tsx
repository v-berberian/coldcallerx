import React, { useEffect, useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';

interface SearchAutocompleteProps {
  isVisible: boolean;
  onAnimationComplete?: () => void;
  children: React.ReactNode;
  maxItems?: number;
}

const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({ 
  isVisible,
  onAnimationComplete,
  children,
  maxItems = 50 // Limit items for performance
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Optimize children rendering for large lists
  const optimizedChildren = useMemo(() => {
    if (React.isValidElement(children) && children.props.children) {
      const childArray = Array.isArray(children.props.children) 
        ? children.props.children 
        : [children.props.children];
      
      // Limit the number of items rendered
      const limitedChildren = childArray.slice(0, maxItems);
      
      return React.cloneElement(children, {
        ...children.props,
        children: limitedChildren
      });
    }
    return children;
  }, [children, maxItems]);

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
      {optimizedChildren}
    </div>
  );
};

export default SearchAutocomplete;
