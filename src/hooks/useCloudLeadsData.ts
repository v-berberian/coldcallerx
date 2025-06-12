
import { useState, useEffect } from 'react';
import { Lead } from '../types/lead';
import { leadService, LeadList } from '../services/leadService';
import { dailyStatsService } from '../services/dailyStatsService';
import { useAuth } from '../contexts/AuthContext';

export const useCloudLeadsData = () => {
  const [currentLeadList, setCurrentLeadList] = useState<LeadList | null>(null);
  const [leadsData, setLeadsData] = useState<Lead[]>([]);
  const [leadLists, setLeadLists] = useState<LeadList[]>([]);
  const [dailyCallCount, setDailyCallCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Load lead lists and daily stats
  useEffect(() => {
    if (user) {
      loadLeadLists();
      loadDailyStats();
    }
  }, [user]);

  const loadLeadLists = async () => {
    const lists = await leadService.getLeadLists();
    setLeadLists(lists);
  };

  const loadDailyStats = async () => {
    const stats = await dailyStatsService.getTodaysStats();
    if (stats) {
      setDailyCallCount(stats.call_count);
    }
  };

  const switchToLeadList = async (leadListId: string): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      const selectedList = leadLists.find(list => list.id === leadListId);
      if (!selectedList) {
        setLoading(false);
        return false;
      }

      const leads = await leadService.getLeads(leadListId);
      setCurrentLeadList(selectedList);
      setLeadsData(leads);
      return true;
    } catch (error) {
      console.error('Error switching to lead list:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const importLeadsFromCSV = async (leads: Lead[], fileName: string): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
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
        // Refresh lead lists
        await loadLeadLists();
        return true;
      }
    } catch (error) {
      console.error('Error importing leads:', error);
    } finally {
      setLoading(false);
    }
    return false;
  };

  const uploadCSVFile = async (file: File): Promise<string | null> => {
    if (!user) return null;
    return await leadService.uploadCSVFile(file, user.id);
  };

  const markLeadAsCalled = async (lead: Lead) => {
    if (!currentLeadList) return;

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

    // Update database
    await leadService.updateLeadCallCount(
      currentLeadList.id,
      lead.name,
      lead.phone,
      newCallCount,
      lastCalledString
    );

    // Increment daily call count
    await dailyStatsService.incrementDailyCallCount();
    await loadDailyStats();
  };

  const resetCallCount = async (lead: Lead) => {
    if (!currentLeadList) return;

    // Update local state
    const updatedLeads = leadsData.map(l => 
      l.name === lead.name && l.phone === lead.phone 
        ? { ...l, called: 0, lastCalled: undefined }
        : l
    );
    setLeadsData(updatedLeads);

    // Update database
    await leadService.resetLeadCallCount(currentLeadList.id, lead.name, lead.phone);
  };

  const resetAllCallCounts = async () => {
    if (!currentLeadList) return;

    // Update local state
    const updatedLeads = leadsData.map(l => ({
      ...l,
      called: 0,
      lastCalled: undefined
    }));
    setLeadsData(updatedLeads);

    // Update database
    await leadService.resetAllCallCounts(currentLeadList.id);
  };

  const resetDailyCallCount = async () => {
    await dailyStatsService.resetDailyCallCount();
    setDailyCallCount(0);
  };

  return {
    currentLeadList,
    leadsData,
    leadLists,
    dailyCallCount,
    loading,
    importLeadsFromCSV,
    uploadCSVFile,
    switchToLeadList,
    markLeadAsCalled,
    resetCallCount,
    resetAllCallCounts,
    resetDailyCallCount,
    loadDailyStats
  };
};
