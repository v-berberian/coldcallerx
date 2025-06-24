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
      // Load current CSV ID and its data using appStorage
      const currentCSVId = await appStorage.getCurrentCSVId();
      const csvFiles = await appStorage.getCSVFiles();
      
      if (currentCSVId) {
        // Load data for the current CSV
        const savedLeads = await appStorage.getCSVLeadsData(currentCSVId);
        const currentFile = csvFiles.find(f => f.id === currentCSVId);
        
        if (savedLeads.length > 0) {
          setLeadsData(savedLeads);
        }
        
        if (currentFile) {
          setCurrentLeadList({
            id: currentFile.id,
            name: currentFile.name,
            file_name: currentFile.fileName,
            total_leads: currentFile.totalLeads
          });
        }
      } else {
        // Fallback to old storage for backward compatibility
        const savedLeads = await appStorage.getLeadsData();
        const savedLeadList = localStorage.getItem('currentLeadList');
        
        if (savedLeads.length > 0) {
          setLeadsData(savedLeads);
        }
        
        if (savedLeadList) {
          setCurrentLeadList(JSON.parse(savedLeadList));
        }
      }
    } catch (error) {
      console.error('Error loading existing data:', error);
    }
  }, []);

  const importLeadsFromCSV = async (leads: Lead[], fileName: string, csvId: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Create the new lead list
      const leadList = { 
        id: csvId, 
        name: fileName,
        file_name: fileName + '.csv',
        total_leads: leads.length
      };

      // Update state
      setCurrentLeadList(leadList);
      setLeadsData(leads);
      
      // Save to CSV-specific storage using appStorage
      await appStorage.saveCSVLeadsData(csvId, leads);
      await appStorage.saveCurrentCSVId(csvId);

      return true;
    } catch (error) {
      console.error('Error importing leads from CSV:', error);
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

      // Update the leads data - only set lastCalled
      const updatedLeads = currentLeadsData.map(l => 
        l.name === lead.name && l.phone === lead.phone ? {
          ...l,
          lastCalled: lastCalledString
        } : l
      );
      
      // Save to CSV-specific storage using appStorage
      const currentCSVId = await appStorage.getCurrentCSVId();
      if (currentCSVId) {
        await appStorage.saveCSVLeadsData(currentCSVId, updatedLeads);
      }
      
      return updatedLeads;
    } catch (error) {
      console.error('Error updating lead call count:', error);
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
      
      // Save to CSV-specific storage using appStorage
      const currentCSVId = await appStorage.getCurrentCSVId();
      if (currentCSVId) {
        await appStorage.saveCSVLeadsData(currentCSVId, updatedLeads);
      }
      
      return updatedLeads;
    } catch (error) {
      console.error('Error resetting call count:', error);
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
      
      // Save to CSV-specific storage using appStorage
      const currentCSVId = await appStorage.getCurrentCSVId();
      if (currentCSVId) {
        await appStorage.saveCSVLeadsData(currentCSVId, updatedLeads);
      }
      
      return updatedLeads;
    } catch (error) {
      console.error('Error resetting all call counts:', error);
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
