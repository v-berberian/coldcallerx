import { useState } from 'react';
import { Lead } from '../types/lead';

// Minimal hybrid operations stub to satisfy imports when server features are unavailable
export const useHybridLeadOperations = () => {
  const [leadsData] = useState<Lead[]>([]);
  const currentLeadList: any = null;
  const isOnline = false;

  const updateLeadCallCount = async (_lead: Lead): Promise<boolean> => {
    return true;
  };

  const resetCallCount = async (_lead: Lead): Promise<boolean> => {
    return true;
  };

  const resetAllCallCounts = async (): Promise<boolean> => {
    return true;
  };

  return {
    currentLeadList,
    leadsData,
    isOnline,
    updateLeadCallCount,
    resetCallCount,
    resetAllCallCounts,
  };
};
