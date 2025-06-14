
import React, { useState, useEffect } from 'react';

interface AutoCallCountdownProps {
  isActive: boolean;
  duration: number;
  onComplete: () => void;
}

const AutoCallCountdown: React.FC<AutoCallCountdownProps> = ({
  isActive,
  duration,
  onComplete
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(duration);
      return;
    }

    setTimeLeft(duration);
    
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, duration, onComplete]);

  // Don't render any popup overlay - countdown will be shown in the UI near the button
  return null;
};

export default AutoCallCountdown;
