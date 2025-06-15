
import { useState, useEffect } from 'react';
import { Lead } from '../types/lead';

export const useHybridLeadOperations = () => {
  const [currentLeadList, setCurrentLeadList] = useState<any>(null);
  const [leadsData, setLeadsData] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online status
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

  const loadExistingData = async () => {
    try {
      // Load from localStorage only
      const savedLeads = localStorage.getItem('coldcaller-leads');
      const savedLeadList = localStorage.getItem('coldcaller-current-list');
      
      if (savedLeads) {
        const leads = JSON.parse(savedLeads);
        setLeadsData(leads);
      }
      
      if (savedLeadList) {
        setCurrentLeadList(JSON.parse(savedLeadList));
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  };

  const importLeadsFromCSV = async (leads: Lead[], fileName: string): Promise<boolean> => {
    setLoading(true);
    try {
      const leadList = { 
        id: Date.now().toString(), 
        name: fileName,
        file_name: fileName + '.csv',
        total_leads: leads.length
      };

      // Save to localStorage only
      setCurrentLeadList(leadList);
      setLeadsData(leads);
      localStorage.setItem('coldcaller-current-list', JSON.stringify(leadList));
      localStorage.setItem('coldcaller-leads', JSON.stringify(leads));

      return true;
    } catch (error) {
      console.error('Error importing leads:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateLeadCallCount = async (lead: Lead): Promise<boolean> => {
    try {
      const now = new Date();
      const dateString = now.toLocaleDateString();
      const timeString = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      const lastCalledString = `${dateString} at ${timeString}`;
      const newCallCount = (lead.called || 0) + 1;

      // Update local state
      const updatedLeads = leadsData.map(l => 
        l.name === lead.name && l.phone === lead.phone ? {
          ...l,
          called: newCallCount,
          lastCalled: lastCalledString
        } : l
      );
      setLeadsData(updatedLeads);
      localStorage.setItem('coldcaller-leads', JSON.stringify(updatedLeads));

      return true;
    } catch (error) {
      console.error('Error updating call count:', error);
      return false;
    }
  };

  const resetCallCount = async (lead: Lead): Promise<boolean> => {
    try {
      // Update local state
      const updatedLeads = leadsData.map(l => 
        l.name === lead.name && l.phone === lead.phone 
          ? { ...l, called: 0, lastCalled: undefined }
          : l
      );
      setLeadsData(updatedLeads);
      localStorage.setItem('coldcaller-leads', JSON.stringify(updatedLeads));

      return true;
    } catch (error) {
      console.error('Error resetting call count:', error);
      return false;
    }
  };

  const resetAllCallCounts = async (): Promise<boolean> => {
    try {
      // Update local state
      const updatedLeads = leadsData.map(l => ({
        ...l,
        called: 0,
        lastCalled: undefined
      }));
      setLeadsData(updatedLeads);
      localStorage.setItem('coldcaller-leads', JSON.stringify(updatedLeads));

      return true;
    } catch (error) {
      console.error('Error resetting all call counts:', error);
      return false;
    }
  };

  const deleteLeadList = async (leadListId: string): Promise<boolean> => {
    try {
      // If we deleted the current list, clear it
      if (currentLeadList?.id === leadListId) {
        setCurrentLeadList(null);
        setLeadsData([]);
        localStorage.removeItem('coldcaller-current-list');
        localStorage.removeItem('coldcaller-leads');
      }

      return true;
    } catch (error) {
      console.error('Error deleting lead list:', error);
      return false;
    }
  };

  return {
    currentLeadList,
    leadsData,
    loading,
    isOnline,
    setCurrentLeadList,
    setLeadsData,
    setLoading,
    importLeadsFromCSV,
    updateLeadCallCount,
    resetCallCount,
    resetAllCallCounts,
    deleteLeadList,
    loadExistingData
  };
};
