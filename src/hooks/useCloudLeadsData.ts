import { useState, useEffect, useCallback } from 'react';
import { Lead } from '../types/lead';
import { leadService, LeadList } from '../services/leadService';
import { dailyStatsService } from '../services/dailyStatsService';
import { sessionService, SessionState } from '../services/sessionService';
import { useAuth } from '../contexts/AuthContext';

export const useCloudLeadsData = () => {
  const [currentLeadList, setCurrentLeadList] = useState<LeadList | null>(null);
  const [leadsData, setLeadsData] = useState<Lead[]>([]);
  const [dailyCallCount, setDailyCallCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sessionState, setSessionState] = useState<SessionState>({
    currentLeadListId: null,
    currentLeadIndex: 0,
    timezoneFilter: 'ALL',
    callFilter: 'ALL',
    shuffleMode: false,
    autoCall: false,
    callDelay: 0
  });
  const { user } = useAuth();

  // Load user's session, lead list and daily stats on mount
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Load saved session state with retry logic
      const savedSession = await loadSessionWithRetry();
      
      // Load daily stats
      const stats = await dailyStatsService.getTodaysStats();
      if (stats) {
        setDailyCallCount(stats.call_count);
      }

      // Load lead lists
      const leadLists = await leadService.getLeadLists();
      
      if (leadLists.length > 0) {
        let targetLeadList: LeadList;
        let initialSessionState = { ...sessionState };

        // If we have a saved session with a valid lead list, use it
        if (savedSession?.current_lead_list_id) {
          const savedLeadList = leadLists.find(list => list.id === savedSession.current_lead_list_id);
          if (savedLeadList) {
            targetLeadList = savedLeadList;
            initialSessionState = {
              currentLeadListId: savedSession.current_lead_list_id,
              currentLeadIndex: savedSession.current_lead_index,
              timezoneFilter: savedSession.timezone_filter,
              callFilter: savedSession.call_filter,
              shuffleMode: savedSession.shuffle_mode,
              autoCall: savedSession.auto_call,
              callDelay: savedSession.call_delay
            };
          } else {
            // Saved lead list doesn't exist anymore, use most recent
            targetLeadList = leadLists[0];
            initialSessionState.currentLeadListId = targetLeadList.id;
          }
        } else {
          // No saved session, use most recent lead list
          targetLeadList = leadLists[0];
          initialSessionState.currentLeadListId = targetLeadList.id;
        }

        setCurrentLeadList(targetLeadList);
        setSessionState(initialSessionState);
        
        // Load leads for this list
        const leads = await leadService.getLeads(targetLeadList.id);
        setLeadsData(leads);

        // Save the initial session state (debounced)
        await sessionService.saveUserSession(initialSessionState);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Don't block the UI if session loading fails
    } finally {
      setLoading(false);
    }
  };

  const loadSessionWithRetry = async (maxRetries = 3): Promise<any> => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const session = await sessionService.getUserSession();
        return session;
      } catch (error) {
        console.error(`Session load attempt ${i + 1} failed:`, error);
        if (i === maxRetries - 1) {
          // On final failure, return null to use defaults
          return null;
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    return null;
  };

  const loadDailyStats = async () => {
    try {
      const stats = await dailyStatsService.getTodaysStats();
      if (stats) {
        setDailyCallCount(stats.call_count);
      }
    } catch (error) {
      console.error('Error loading daily stats:', error);
    }
  };

  const updateSessionState = useCallback(async (updates: Partial<SessionState>): Promise<boolean> => {
    try {
      const newSessionState = { ...sessionState, ...updates };
      setSessionState(newSessionState);
      
      // Use debounced save from sessionService
      const success = await sessionService.saveUserSession(newSessionState);
      
      if (!success) {
        console.warn('Session save failed, but continuing with local state');
        // Don't fail the operation if session save fails
        return true;
      }
      
      return true;
    } catch (error) {
      console.error('Error updating session state:', error);
      // Don't fail the operation if session update fails
      return true;
    }
  }, [sessionState]);

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

        // Update session state for new lead list
        await updateSessionState({
          currentLeadListId: leadList.id,
          currentLeadIndex: 0
        });

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

      // Update session state for new lead list
      await updateSessionState({
        currentLeadListId: leadList.id,
        currentLeadIndex: 0
      });
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

  const markLeadAsCalled = async (lead: Lead): Promise<boolean> => {
    if (!currentLeadList) return false;

    try {
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

      return true;
    } catch (error) {
      console.error('Error marking lead as called:', error);
      return false;
    }
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
    sessionState,
    importLeadsFromCSV,
    switchToLeadList,
    deleteLeadList,
    uploadCSVFile,
    markLeadAsCalled,
    resetCallCount,
    resetAllCallCounts,
    resetDailyCallCount,
    loadDailyStats,
    updateSessionState
  };
};
