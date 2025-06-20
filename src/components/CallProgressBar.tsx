
import React, { useState, useEffect } from 'react';
import DailyProgress from './DailyProgress';

interface CallProgressBarProps {
  dailyCallCount: number;
}

const CallProgressBar: React.FC<CallProgressBarProps> = ({ dailyCallCount }) => {
  const [isVisible, setIsVisible] = useState(false);

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

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-4 z-50">
      <DailyProgress dailyCallCount={dailyCallCount} />
    </div>
  );
};

export default CallProgressBar;
