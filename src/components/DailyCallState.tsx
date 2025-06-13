
import { useCloudLeadsData } from '@/hooks/useCloudLeadsData';

export const useDailyCallState = () => {
  const { dailyCallCount, resetDailyCallCount, loadDailyStats } = useCloudLeadsData();

  const incrementDailyCallCount = () => {
    // This is now handled automatically in markLeadAsCalled
    loadDailyStats();
  };

  return {
    dailyCallCount,
    incrementDailyCallCount,
    resetDailyCallCount
  };
};
