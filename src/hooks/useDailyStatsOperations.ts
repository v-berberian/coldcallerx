
import { useState } from 'react';
import { dailyStatsService } from '../services/dailyStatsService';

export const useDailyStatsOperations = () => {
  const [dailyCallCount, setDailyCallCount] = useState(0);

  const loadDailyStats = async () => {
    try {
      console.log('useDailyStatsOperations: Loading daily stats');
      const stats = await dailyStatsService.getTodaysStats();
      if (stats) {
        setDailyCallCount(stats.call_count);
        console.log('useDailyStatsOperations: Loaded daily stats:', stats.call_count, 'calls');
      }
    } catch (error) {
      console.error('useDailyStatsOperations: Error loading daily stats:', error);
    }
  };

  const resetDailyCallCount = async () => {
    try {
      console.log('useDailyStatsOperations: Resetting daily call count');
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
