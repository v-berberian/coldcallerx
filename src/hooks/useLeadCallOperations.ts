import { Lead } from '../types/lead';
import { useCallback } from 'react';

interface LeadList {
  id: string;
  name: string;
  file_name?: string;
  total_leads?: number;
}

interface UseLeadCallOperationsProps {
  currentLeadList: LeadList | null;
  leadsData: Lead[];
  setLeadsData: (leads: Lead[]) => void;
  loadDailyStats: () => Promise<void>;
}

export const useLeadCallOperations = ({ 
  currentLeadList, 
  leadsData, 
  setLeadsData, 
  loadDailyStats 
}: UseLeadCallOperationsProps) => {

  const markLeadAsCalled = useCallback(async (lead: Lead): Promise<boolean> => {
    try {
      const now = new Date();
      const dateString = now.toLocaleDateString();
      const timeString = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      const lastCalledString = `${dateString} at ${timeString}`;

      const updatedLeads = leadsData.map(l => 
        l.name === lead.name && l.phone === lead.phone ? {
          ...l,
          lastCalled: lastCalledString
        } : l
      );
      
      setLeadsData(updatedLeads);
      
      // Save to CSV-specific storage immediately using synchronous localStorage
      try {
        const currentCSVId = localStorage.getItem('coldcaller-current-csv-id');
        if (currentCSVId) {
          const key = `coldcaller-csv-${currentCSVId}-leads`;
          localStorage.setItem(key, JSON.stringify(updatedLeads));
        } else {
          // Fall back to old storage
          localStorage.setItem('coldcaller-leads-data', JSON.stringify(updatedLeads));
        }
      } catch (error) {
        console.error('Error saving leads data:', error);
      }
      
      // Increment daily call count
      await loadDailyStats();

      return true;
    } catch (error) {
      console.error('Error in markLeadAsCalled:', error);
      return false;
    }
  }, [leadsData, setLeadsData, loadDailyStats]);

  const resetCallCount = useCallback((lead: Lead) => {
    try {
      const updatedLeads = leadsData.map(l => 
        l.name === lead.name && l.phone === lead.phone 
          ? { ...l, lastCalled: undefined }
          : l
      );
      
      setLeadsData(updatedLeads);
      
      // Save to CSV-specific storage immediately using synchronous localStorage
      try {
        const currentCSVId = localStorage.getItem('coldcaller-current-csv-id');
        if (currentCSVId) {
          const key = `coldcaller-csv-${currentCSVId}-leads`;
          localStorage.setItem(key, JSON.stringify(updatedLeads));
        } else {
          // Fall back to old storage
          localStorage.setItem('coldcaller-leads-data', JSON.stringify(updatedLeads));
        }
      } catch (error) {
        console.error('Error saving leads data:', error);
      }
    } catch (error) {
      console.error('Error in resetCallCount:', error);
    }
  }, [leadsData, setLeadsData]);

  const resetAllCallCounts = useCallback(() => {
    try {
      const updatedLeads = leadsData.map(lead => ({
        ...lead,
        lastCalled: undefined
      }));
      
      setLeadsData(updatedLeads);
      
      // Save to CSV-specific storage immediately using synchronous localStorage
      try {
        const currentCSVId = localStorage.getItem('coldcaller-current-csv-id');
        if (currentCSVId) {
          const key = `coldcaller-csv-${currentCSVId}-leads`;
          localStorage.setItem(key, JSON.stringify(updatedLeads));
        } else {
          // Fall back to old storage
          localStorage.setItem('coldcaller-leads-data', JSON.stringify(updatedLeads));
        }
      } catch (error) {
        console.error('Error saving leads data:', error);
      }
    } catch (error) {
      console.error('Error in resetAllCallCounts:', error);
    }
  }, [leadsData, setLeadsData]);

  return {
    markLeadAsCalled,
    resetCallCount,
    resetAllCallCounts
  };
};
