
import { useState, useEffect } from 'react';

export const useDailyCallState = () => {
  const [dailyCallCount, setDailyCallCount] = useState(0);

  // Load daily call count from localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    const savedCount = localStorage.getItem(`daily-calls-${today}`);
    if (savedCount) {
      setDailyCallCount(parseInt(savedCount, 10));
    }
  }, []);

  // Save daily call count to localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    localStorage.setItem(`daily-calls-${today}`, dailyCallCount.toString());
  }, [dailyCallCount]);

  const incrementDailyCallCount = () => {
    setDailyCallCount(prev => prev + 1);
  };

  const resetDailyCallCount = () => {
    setDailyCallCount(0);
  };

  return {
    dailyCallCount,
    incrementDailyCallCount,
    resetDailyCallCount
  };
};
