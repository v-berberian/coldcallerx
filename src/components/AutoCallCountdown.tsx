
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

  if (!isActive || timeLeft === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border rounded-2xl p-8 text-center shadow-lg">
        <div className="text-6xl font-bold text-green-600 mb-4">
          {timeLeft}
        </div>
        <div className="text-lg text-muted-foreground">
          Auto-calling in...
        </div>
      </div>
    </div>
  );
};

export default AutoCallCountdown;
