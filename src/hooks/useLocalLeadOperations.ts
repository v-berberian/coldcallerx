
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

  // Updated to only set last called timestamp
  const updateLeadCallCount = useCallback((currentLeadsData: Lead[], lead: Lead): Lead[] => {
    try {
      const now = new Date();
      const dateString = now.toLocaleDateString();
      const timeString = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      const lastCalledString = `${dateString} at ${timeString}`;

      console.log('Updating last called for:', lead.name, 'to:', lastCalledString);

      // Update the leads data - only set lastCalled
      const updatedLeads = currentLeadsData.map(l => 
        l.name === lead.name && l.phone === lead.phone ? {
          ...l,
          lastCalled: lastCalledString
        } : l
      );
      
      // Save to localStorage
      localStorage.setItem('leadsData', JSON.stringify(updatedLeads));
      
      return updatedLeads;
    } catch (error) {
      console.error('Error updating last called:', error);
      return currentLeadsData;
    }
  }, []);

  const resetCallCount = useCallback((currentLeadsData: Lead[], lead: Lead): Lead[] => {
    try {
      // Update the leads data - only clear lastCalled
      const updatedLeads = currentLeadsData.map(l => 
        l.name === lead.name && l.phone === lead.phone 
          ? { ...l, lastCalled: undefined }
          : l
      );
      
      localStorage.setItem('leadsData', JSON.stringify(updatedLeads));
      return updatedLeads;
    } catch (error) {
      console.error('Error resetting last called:', error);
      return currentLeadsData;
    }
  }, []);

  const resetAllCallCounts = useCallback((currentLeadsData: Lead[]): Lead[] => {
    try {
      // Update the leads data - only clear lastCalled for all
      const updatedLeads = currentLeadsData.map(l => ({
        ...l,
        lastCalled: undefined
      }));
      
      localStorage.setItem('leadsData', JSON.stringify(updatedLeads));
      return updatedLeads;
    } catch (error) {
      console.error('Error resetting all last called timestamps:', error);
      return currentLeadsData;
    }
  }, []);

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
