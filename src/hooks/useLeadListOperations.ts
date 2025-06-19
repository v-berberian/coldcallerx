import { useState } from 'react';
import { Lead } from '../types/lead';

interface LeadList {
  id: string;
  name: string;
  file_name?: string;
  total_leads?: number;
}

export const useLeadListOperations = () => {
  const [currentLeadList, setCurrentLeadList] = useState<LeadList | null>(null);
  const [leadsData, setLeadsData] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);

  const importLeadsFromCSV = async (leads: Lead[], fileName: string): Promise<boolean> => {
    setLoading(true);
    try {
      console.log('useLeadListOperations: Importing leads locally:', leads.length);
      
      // Store locally instead of cloud
      const leadList: LeadList = { id: Date.now().toString(), name: fileName };
      setCurrentLeadList(leadList);
      setLeadsData(leads);
      
      // Save to localStorage
      localStorage.setItem('currentLeadList', JSON.stringify(leadList));
      localStorage.setItem('leadsData', JSON.stringify(leads));
      
      return true;
    } catch (error) {
      console.error('useLeadListOperations: Error importing leads:', error);
    } finally {
      setLoading(false);
    }
    return false;
  };

  const deleteLeadList = async (leadListId: string): Promise<boolean> => {
    try {
      console.log('useLeadListOperations: Deleting lead list locally:', leadListId);
      
      // If we deleted the current list, clear it
      if (currentLeadList?.id === leadListId) {
        setCurrentLeadList(null);
        setLeadsData([]);
        localStorage.removeItem('currentLeadList');
        localStorage.removeItem('leadsData');
      }
      return true;
    } catch (error) {
      console.error('useLeadListOperations: Error deleting lead list:', error);
    }
    return false;
  };

  return {
    currentLeadList,
    leadsData,
    loading,
    setCurrentLeadList,
    setLeadsData,
    setLoading,
    importLeadsFromCSV,
    deleteLeadList
  };
};
