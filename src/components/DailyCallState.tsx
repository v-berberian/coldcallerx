import { useState, useEffect, useCallback, useMemo } from 'react';

// Cache for daily stats to reduce localStorage reads
const dailyStatsCache = {
  date: '',
  callCount: 0,
  lastUpdated: 0
};

export const useDailyCallState = () => {
  const [dailyCallCount, setDailyCallCount] = useState(0);

  // Memoize today's date to avoid recalculation
  const today = useMemo(() => new Date().toDateString(), []);

  // Load daily call count from localStorage on mount with caching
  useEffect(() => {
    const now = Date.now();
    
    // Use cache if it's recent (within 1 minute)
    if (dailyStatsCache.lastUpdated > now - 60000 && dailyStatsCache.date === today) {
      setDailyCallCount(dailyStatsCache.callCount);
      return;
    }

    const savedDate = localStorage.getItem('coldcaller-daily-date');
    const savedCallCount = localStorage.getItem('coldcaller-daily-call-count');
    
    if (savedDate === today && savedCallCount) {
      const callCount = parseInt(savedCallCount, 10);
      setDailyCallCount(callCount);
      
      // Update cache
      dailyStatsCache.date = today;
      dailyStatsCache.callCount = callCount;
      dailyStatsCache.lastUpdated = now;
    } else {
      // New day, reset count
      setDailyCallCount(0);
      localStorage.setItem('coldcaller-daily-date', today);
      localStorage.setItem('coldcaller-daily-call-count', '0');
      
      // Update cache
      dailyStatsCache.date = today;
      dailyStatsCache.callCount = 0;
      dailyStatsCache.lastUpdated = now;
    }
  }, [today]);

  const incrementDailyCallCount = useCallback(() => {
    const newCount = dailyCallCount + 1;
    setDailyCallCount(newCount);
    
    // Update cache
    dailyStatsCache.callCount = newCount;
    dailyStatsCache.lastUpdated = Date.now();
    
    // Throttle localStorage writes for performance
    setTimeout(() => {
      localStorage.setItem('coldcaller-daily-date', today);
      localStorage.setItem('coldcaller-daily-call-count', newCount.toString());
    }, 0);
  }, [dailyCallCount, today]);

  const resetDailyCallCount = useCallback(() => {
    setDailyCallCount(0);
    
    // Update cache
    dailyStatsCache.callCount = 0;
    dailyStatsCache.lastUpdated = Date.now();
    
    // Throttle localStorage writes for performance
    setTimeout(() => {
      localStorage.setItem('coldcaller-daily-date', today);
      localStorage.setItem('coldcaller-daily-call-count', '0');
    }, 0);
  }, [today]);

  return {
    dailyCallCount,
    incrementDailyCallCount,
    resetDailyCallCount
  };
};
