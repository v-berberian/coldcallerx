
export const dailyStatsService = {
  getTodaysStats: async () => {
    const today = new Date().toDateString();
    const savedCount = localStorage.getItem(`dailyCallCount_${today}`);
    return savedCount ? { call_count: parseInt(savedCount, 10) } : { call_count: 0 };
  },

  resetDailyCallCount: async () => {
    const today = new Date().toDateString();
    localStorage.setItem(`dailyCallCount_${today}`, '0');
  }
};
