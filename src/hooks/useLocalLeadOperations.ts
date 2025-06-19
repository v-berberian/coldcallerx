import { useState, useCallback } from 'react';
import { Lead } from '../types/lead';

interface LeadList {
  id: string;
  name: string;
  file_name: string;
  total_leads: number;
}

export const useLocalLeadOperations = () => {
  const [currentLeadList, setCurrentLeadList] = useState<LeadList | null>(null);
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
      }
    } catch (error) {
    }
  }, []);

  const importLeadsFromCSV = async (leads: Lead[], fileName: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Create the new lead list first
      const leadList = { 
        id: Date.now().toString(), 
        name: fileName,
        file_name: fileName + '.csv',
        total_leads: leads.length
      };

      // Update state in the correct order
      setCurrentLeadList(leadList);
      setLeadsData(leads);
      
      // Save to localStorage after state updates
      localStorage.setItem('currentLeadList', JSON.stringify(leadList));
      localStorage.setItem('leadsData', JSON.stringify(leads));

      return true;
    } catch (error) {
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
