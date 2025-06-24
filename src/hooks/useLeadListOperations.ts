import { useState } from 'react';
import { Lead } from '../types/lead';
import { appStorage } from '../utils/storage';

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
      
      // Save using appStorage methods to avoid quota errors
      await appStorage.saveCSVLeadsData(leadList.id, leads);
      await appStorage.saveCurrentCSVId(leadList.id);
      
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
        await appStorage.removeCSVLeadsData(leadListId);
        await appStorage.saveCurrentCSVId('');
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
