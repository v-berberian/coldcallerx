import { useState, useCallback } from 'react';
import { Lead } from '../types/lead';
import { appStorage } from '../utils/storage';

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

  const loadExistingData = useCallback(async () => {
    try {
      // Load from Capacitor Preferences using appStorage
      const savedLeads = await appStorage.getLeadsData();
      const savedLeadList = localStorage.getItem('currentLeadList'); // Keep this as localStorage for now
      
      if (savedLeads.length > 0) {
        setLeadsData(savedLeads);
        console.log('Loaded data from Capacitor Preferences');
      }
      
      if (savedLeadList) {
        setCurrentLeadList(JSON.parse(savedLeadList));
      }
    } catch (error) {
      console.error('Error loading data from storage:', error);
    }
  }, []);

  const importLeadsFromCSV = async (leads: Lead[], fileName: string): Promise<boolean> => {
    setLoading(true);
    try {
      console.log('Importing new leads:', leads.length);
      
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
      
      // Save to Capacitor Preferences and localStorage
      await appStorage.saveLeadsData(leads);
      localStorage.setItem('currentLeadList', JSON.stringify(leadList));

      console.log('Successfully imported and saved leads locally');
      return true;
    } catch (error) {
      console.error('Error importing leads:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Updated to only set last called timestamp
  const updateLeadCallCount = useCallback(async (currentLeadsData: Lead[], lead: Lead): Promise<Lead[]> => {
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
      
      // Save to Capacitor Preferences
      await appStorage.saveLeadsData(updatedLeads);
      
      return updatedLeads;
    } catch (error) {
      console.error('Error updating last called:', error);
      return currentLeadsData;
    }
  }, []);

  const resetCallCount = useCallback(async (currentLeadsData: Lead[], lead: Lead): Promise<Lead[]> => {
    try {
      // Update the leads data - only clear lastCalled
      const updatedLeads = currentLeadsData.map(l => 
        l.name === lead.name && l.phone === lead.phone 
          ? { ...l, lastCalled: undefined }
          : l
      );
      
      await appStorage.saveLeadsData(updatedLeads);
      return updatedLeads;
    } catch (error) {
      console.error('Error resetting last called:', error);
      return currentLeadsData;
    }
  }, []);

  const resetAllCallCounts = useCallback(async (currentLeadsData: Lead[]): Promise<Lead[]> => {
    try {
      // Update the leads data - only clear lastCalled for all
      const updatedLeads = currentLeadsData.map(l => ({
        ...l,
        lastCalled: undefined
      }));
      
      await appStorage.saveLeadsData(updatedLeads);
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
