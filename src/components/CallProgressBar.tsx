
import React, { useState, useEffect } from 'react';
import DailyProgress from './DailyProgress';

interface CallProgressBarProps {
  dailyCallCount: number;
}

const CallProgressBar: React.FC<CallProgressBarProps> = ({ dailyCallCount }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Load visibility setting from localStorage
  useEffect(() => {
    const savedDailyGoal = localStorage.getItem('dailyGoalEnabled');
    if (savedDailyGoal !== null) {
      setIsVisible(savedDailyGoal === 'true');
    } else {
      setIsVisible(true); // Default to visible
    }
  }, []);

  // Listen for changes to the daily goal setting
  useEffect(() => {
    const handleStorageChange = () => {
      const savedDailyGoal = localStorage.getItem('dailyGoalEnabled');
      if (savedDailyGoal !== null) {
        setIsVisible(savedDailyGoal === 'true');
      }
    };

    const handleCustomEvent = (event: CustomEvent) => {
      setIsVisible(event.detail.enabled);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('dailyGoalSettingChanged', handleCustomEvent as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('dailyGoalSettingChanged', handleCustomEvent as EventListener);
    };
  }, []);

  // Trigger bounce animation when dailyCallCount changes
  useEffect(() => {
    if (isVisible && dailyCallCount > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [dailyCallCount, isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className={`fixed left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-3 z-[100] transition-transform duration-300 ${
        isAnimating ? 'animate-bounce' : ''
      }`}
      style={{ 
        bottom: '-10px',
        transform: 'translateZ(0)',
        willChange: 'transform',
        paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))'
      }}
    >
      <DailyProgress dailyCallCount={dailyCallCount} />
    </div>
  );
};

export default CallProgressBar;
