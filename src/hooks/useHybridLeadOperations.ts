import { useState, useEffect, useCallback } from 'react';
import { Lead } from '../types/lead';

export const useHybridLeadOperations = () => {
  const [currentLeadList, setCurrentLeadList] = useState<Lead[]>([]);
  const [leadsData, setLeadsData] = useState<Lead[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateLeadCallCount = useCallback(async (lead: Lead) => {
    // Update call count logic here
    const updatedLead = { ...lead, callCount: (lead.callCount || 0) + 1 };
    setLeadsData(prev => prev.map(l => l.phone === lead.phone ? updatedLead : l));
  }, []);

  const resetCallCount = useCallback(async (lead: Lead) => {
    // Reset call count logic here
    const updatedLead = { ...lead, callCount: 0 };
    setLeadsData(prev => prev.map(l => l.phone === lead.phone ? updatedLead : l));
  }, []);

  const resetAllCallCounts = useCallback(async () => {
    // Reset all call counts logic here
    setLeadsData(prev => prev.map(lead => ({ ...lead, callCount: 0 })));
  }, []);

  return {
    currentLeadList,
    leadsData,
    isOnline,
    updateLeadCallCount,
    resetCallCount,
    resetAllCallCounts
  };
};