
import { useState } from 'react';
import { Lead } from '../types/lead';
import { leadService, LeadList } from '../services/leadService';
import { sessionStateService } from '../services/sessionStateService';

export const useLeadListOperations = () => {
  const [currentLeadList, setCurrentLeadList] = useState<LeadList | null>(null);
  const [leadsData, setLeadsData] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);

  const importLeadsFromCSV = async (leads: Lead[], fileName: string): Promise<boolean> => {
    setLoading(true);
    try {
      console.log('useLeadListOperations: Importing leads from CSV:', leads.length);
      
      // Create lead list
      const leadList = await leadService.createLeadList(fileName, fileName);
      if (!leadList) {
        setLoading(false);
        return false;
      }

      // Save leads to database
      const success = await leadService.saveLeads(leadList.id, leads);
      if (success) {
        setCurrentLeadList(leadList);
        setLeadsData(leads);

        // Update session state for new lead list
        const newSessionState = sessionStateService.updateState({
          currentLeadListId: leadList.id,
          currentLeadIndex: 0
        });
        await sessionStateService.saveState();

        return true;
      }
    } catch (error) {
      console.error('useLeadListOperations: Error importing leads:', error);
    } finally {
      setLoading(false);
    }
    return false;
  };

  const switchToLeadList = async (leadList: LeadList) => {
    setLoading(true);
    try {
      console.log('useLeadListOperations: Switching to lead list:', leadList.name);
      const leads = await leadService.getLeads(leadList.id);
      setCurrentLeadList(leadList);
      setLeadsData(leads);

      // Update session state for new lead list
      const newSessionState = sessionStateService.updateState({
        currentLeadListId: leadList.id,
        currentLeadIndex: 0
      });
      await sessionStateService.saveState();
    } catch (error) {
      console.error('useLeadListOperations: Error switching lead list:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteLeadList = async (leadListId: string): Promise<boolean> => {
    try {
      console.log('useLeadListOperations: Deleting lead list:', leadListId);
      const success = await leadService.deleteLeadList(leadListId);
      if (success) {
        // If we deleted the current list, clear it
        if (currentLeadList?.id === leadListId) {
          setCurrentLeadList(null);
          setLeadsData([]);
        }
        return true;
      }
    } catch (error) {
      console.error('useLeadListOperations: Error deleting lead list:', error);
    }
    return false;
  };

  const uploadCSVFile = async (file: File, userId: string): Promise<string | null> => {
    return await leadService.uploadCSVFile(file, userId);
  };

  return {
    currentLeadList,
    leadsData,
    loading,
    setCurrentLeadList,
    setLeadsData,
    setLoading,
    importLeadsFromCSV,
    switchToLeadList,
    deleteLeadList,
    uploadCSVFile
  };
};
