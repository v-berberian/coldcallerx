import { useState } from 'react';
import { dailyStatsService } from '../services/dailyStatsService';

export const useDailyStatsOperations = () => {
  const [dailyCallCount, setDailyCallCount] = useState(0);

  const loadDailyStats = async () => {
    try {
      const stats = await dailyStatsService.getTodaysStats();
      if (stats) {
        setDailyCallCount(stats.call_count);
      }
    } catch (error) {
      console.error('useDailyStatsOperations: Error loading daily stats:', error);
    }
  };

  const resetDailyCallCount = async () => {
    try {
      await dailyStatsService.resetDailyCallCount();
      setDailyCallCount(0);
    } catch (error) {
      console.error('useDailyStatsOperations: Error resetting daily call count:', error);
    }
  };

  return {
    dailyCallCount,
    loadDailyStats,
    resetDailyCallCount
  };
};
