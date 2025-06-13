
import { useState, useEffect } from 'react';

export const useDailyCallState = () => {
  const [dailyCallCount, setDailyCallCount] = useState(0);

  // Load daily call count from localStorage on mount
  useEffect(() => {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('coldcaller-daily-date');
    const savedCount = localStorage.getItem('coldcaller-daily-count');
    
    if (savedDate === today && savedCount) {
      setDailyCallCount(parseInt(savedCount, 10));
    } else {
      // New day, reset count
      setDailyCallCount(0);
      localStorage.setItem('coldcaller-daily-date', today);
      localStorage.setItem('coldcaller-daily-count', '0');
    }
  }, []);

  const incrementDailyCallCount = () => {
    const newCount = dailyCallCount + 1;
    setDailyCallCount(newCount);
    
    // Save to localStorage
    const today = new Date().toDateString();
    localStorage.setItem('coldcaller-daily-date', today);
    localStorage.setItem('coldcaller-daily-count', newCount.toString());
  };

  const resetDailyCallCount = () => {
    setDailyCallCount(0);
    
    // Save to localStorage
    const today = new Date().toDateString();
    localStorage.setItem('coldcaller-daily-date', today);
    localStorage.setItem('coldcaller-daily-count', '0');
  };

  return {
    dailyCallCount,
    incrementDailyCallCount,
    resetDailyCallCount
  };
};
