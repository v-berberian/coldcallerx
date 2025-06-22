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
      // Load current CSV ID and its data using synchronous localStorage
      const currentCSVId = localStorage.getItem('coldcaller-current-csv-id');
      const csvFilesStr = localStorage.getItem('coldcaller-csv-files');
      const csvFiles = csvFilesStr ? JSON.parse(csvFilesStr) : [];
      
      if (currentCSVId) {
        // Load data for the current CSV
        const key = `coldcaller-csv-${currentCSVId}-leads`;
        const savedLeadsStr = localStorage.getItem(key);
        const savedLeads = savedLeadsStr ? JSON.parse(savedLeadsStr) : [];
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
        const savedLeadsStr = localStorage.getItem('coldcaller-leads-data');
        const savedLeads = savedLeadsStr ? JSON.parse(savedLeadsStr) : [];
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
      
      // Save to CSV-specific storage using synchronous localStorage
      const key = `coldcaller-csv-${csvId}-leads`;
      localStorage.setItem(key, JSON.stringify(leads));
      localStorage.setItem('coldcaller-current-csv-id', csvId);

      return true;
    } catch (error) {
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
      
      // Save to CSV-specific storage using synchronous localStorage
      const currentCSVId = localStorage.getItem('coldcaller-current-csv-id');
      if (currentCSVId) {
        const key = `coldcaller-csv-${currentCSVId}-leads`;
        localStorage.setItem(key, JSON.stringify(updatedLeads));
      } else {
        // Fallback to old storage
        localStorage.setItem('coldcaller-leads-data', JSON.stringify(updatedLeads));
      }
      
      return updatedLeads;
    } catch (error) {
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
      
      // Save to CSV-specific storage using synchronous localStorage
      const currentCSVId = localStorage.getItem('coldcaller-current-csv-id');
      if (currentCSVId) {
        const key = `coldcaller-csv-${currentCSVId}-leads`;
        localStorage.setItem(key, JSON.stringify(updatedLeads));
      } else {
        // Fallback to old storage
        localStorage.setItem('coldcaller-leads-data', JSON.stringify(updatedLeads));
      }
      
      return updatedLeads;
    } catch (error) {
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
      
      // Save to CSV-specific storage using synchronous localStorage
      const currentCSVId = localStorage.getItem('coldcaller-current-csv-id');
      if (currentCSVId) {
        const key = `coldcaller-csv-${currentCSVId}-leads`;
        localStorage.setItem(key, JSON.stringify(updatedLeads));
      } else {
        // Fallback to old storage
        localStorage.setItem('coldcaller-leads-data', JSON.stringify(updatedLeads));
      }
      
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
