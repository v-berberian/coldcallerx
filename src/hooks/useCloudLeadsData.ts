
import { useState, useEffect } from 'react';
import { Lead } from '../types/lead';
import { leadService, LeadList } from '../services/leadService';
import { dailyStatsService } from '../services/dailyStatsService';
import { useAuth } from '../contexts/AuthContext';

export const useCloudLeadsData = () => {
  const [currentLeadList, setCurrentLeadList] = useState<LeadList | null>(null);
  const [leadsData, setLeadsData] = useState<Lead[]>([]);
  const [dailyCallCount, setDailyCallCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load user's most recent lead list and daily stats on mount
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Load daily stats
      const stats = await dailyStatsService.getTodaysStats();
      if (stats) {
        setDailyCallCount(stats.call_count);
      }

      // Load most recent lead list
      const leadLists = await leadService.getLeadLists();
      if (leadLists.length > 0) {
        const mostRecentList = leadLists[0]; // Already ordered by created_at desc
        setCurrentLeadList(mostRecentList);
        
        // Load leads for this list
        const leads = await leadService.getLeads(mostRecentList.id);
        setLeadsData(leads);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDailyStats = async () => {
    const stats = await dailyStatsService.getTodaysStats();
    if (stats) {
      setDailyCallCount(stats.call_count);
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
        return true;
      }
    } catch (error) {
      console.error('Error importing leads:', error);
    } finally {
      setLoading(false);
    }
    return false;
  };

  const switchToLeadList = async (leadList: LeadList) => {
    setLoading(true);
    try {
      const leads = await leadService.getLeads(leadList.id);
      setCurrentLeadList(leadList);
      setLeadsData(leads);
    } catch (error) {
      console.error('Error switching lead list:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteLeadList = async (leadListId: string): Promise<boolean> => {
    try {
      const success = await leadService.deleteLeadList(leadListId);
      if (success) {
        // If we deleted the current list, clear it and reload
        if (currentLeadList?.id === leadListId) {
          await loadUserData();
        }
        return true;
      }
    } catch (error) {
      console.error('Error deleting lead list:', error);
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
    dailyCallCount,
    loading,
    importLeadsFromCSV,
    switchToLeadList,
    deleteLeadList,
    uploadCSVFile,
    markLeadAsCalled,
    resetCallCount,
    resetAllCallCounts,
    resetDailyCallCount,
    loadDailyStats
  };
};
