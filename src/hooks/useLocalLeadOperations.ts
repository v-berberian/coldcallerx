
import { useState, useCallback } from 'react';
import { Lead } from '../types/lead';

export const useLocalLeadOperations = () => {
  const [currentLeadList, setCurrentLeadList] = useState<any>(null);
  const [leadsData, setLeadsData] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);

  const loadExistingData = useCallback(() => {
    try {
      // Load from localStorage
      const savedLeads = localStorage.getItem('leadsData');
      const savedLeadList = localStorage.getItem('currentLeadList');
      
      if (savedLeads && savedLeadList) {
        setLeadsData(JSON.parse(savedLeads));
        setCurrentLeadList(JSON.parse(savedLeadList));
        console.log('Loaded data from localStorage');
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, []);

  const importLeadsFromCSV = async (leads: Lead[], fileName: string): Promise<boolean> => {
    setLoading(true);
    try {
      const leadList = { 
        id: Date.now().toString(), 
        name: fileName,
        file_name: fileName + '.csv',
        total_leads: leads.length
      };

      // Save to localStorage
      setCurrentLeadList(leadList);
      setLeadsData(leads);
      localStorage.setItem('currentLeadList', JSON.stringify(leadList));
      localStorage.setItem('leadsData', JSON.stringify(leads));

      console.log('Successfully saved leads locally');
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
      localStorage.setItem('leadsData', JSON.stringify(updatedLeads));

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
      localStorage.setItem('leadsData', JSON.stringify(updatedLeads));

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
      localStorage.setItem('leadsData', JSON.stringify(updatedLeads));

      return true;
    } catch (error) {
      console.error('Error resetting all call counts:', error);
      return false;
    }
  };

  return {
    currentLeadList,
    leadsData,
    loading,
    setCurrentLeadList,
    setLeadsData,
    setLoading,
    importLeadsFromCSV,
    updateLeadCallCount,
    resetCallCount,
    resetAllCallCounts,
    loadExistingData
  };
};
