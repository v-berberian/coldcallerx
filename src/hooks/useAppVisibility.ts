import { useEffect, useState } from 'react';

/**
 * Hook to detect when the app is visible/hidden for energy optimization
 * Pauses non-essential operations when app is backgrounded
 */
export const useAppVisibility = () => {
  const [isVisible, setIsVisible] = useState(!document.hidden);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      setIsVisible(visible);
      
      // Log for debugging energy optimizations
      if (visible) {
        console.log('🔋 App foregrounded - resuming operations');
      } else {
        console.log('🔋 App backgrounded - pausing operations');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Handle page focus/blur as additional signals
    const handleFocus = () => setIsVisible(true);
    const handleBlur = () => setIsVisible(false);
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  return isVisible;
};
