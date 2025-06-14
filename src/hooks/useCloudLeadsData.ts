
import { useEffect } from 'react';
import { leadService, LeadList } from '../services/leadService';
import { useAuth } from '../contexts/AuthContext';
import { useLeadListOperations } from './useLeadListOperations';
import { useLeadCallOperations } from './useLeadCallOperations';
import { useDailyStatsOperations } from './useDailyStatsOperations';
import { useSessionManagement } from './useSessionManagement';
import { SessionState } from '../services/sessionService';

export const useCloudLeadsData = () => {
  const { user } = useAuth();
  
  const {
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
  } = useLeadListOperations();

  const { dailyCallCount, loadDailyStats, resetDailyCallCount } = useDailyStatsOperations();
  
  const { sessionState, updateSessionState, loadSessionState, setInitialSessionState } = useSessionManagement();

  const { markLeadAsCalled, resetCallCount, resetAllCallCounts } = useLeadCallOperations({
    currentLeadList,
    leadsData,
    setLeadsData,
    loadDailyStats
  });

  // Load user's session, lead list and daily stats on mount
  useEffect(() => {
    if (user) {
      console.log('useCloudLeadsData: User detected, loading session data');
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      console.log('useCloudLeadsData: Starting to load user data');
      
      // Load saved session state first
      const savedSession = await loadSessionState();
      console.log('useCloudLeadsData: Saved session loaded:', savedSession ? 'found' : 'not found');
      
      // Load daily stats
      await loadDailyStats();

      // Load lead lists
      const leadLists = await leadService.getLeadLists();
      console.log('useCloudLeadsData: Lead lists loaded:', leadLists.length, 'lists');
      
      if (leadLists.length > 0) {
        let targetLeadList: LeadList;
        let initialSessionState = { ...sessionState };

        // If we have a saved session with a valid lead list, use it
        if (savedSession?.currentLeadListId) {
          const savedLeadList = leadLists.find(list => list.id === savedSession.currentLeadListId);
          if (savedLeadList) {
            console.log('useCloudLeadsData: Restoring saved session for lead list:', savedLeadList.name);
            targetLeadList = savedLeadList;
            initialSessionState = savedSession;
            console.log('useCloudLeadsData: Session restored - index:', savedSession.currentLeadIndex, 'filters:', savedSession.timezoneFilter, savedSession.callFilter);
          } else {
            console.log('useCloudLeadsData: Saved lead list not found, using most recent');
            targetLeadList = leadLists[0];
            initialSessionState.currentLeadListId = targetLeadList.id;
          }
        } else {
          console.log('useCloudLeadsData: No saved session, using most recent lead list');
          targetLeadList = leadLists[0];
          initialSessionState.currentLeadListId = targetLeadList.id;
        }

        setCurrentLeadList(targetLeadList);
        setInitialSessionState(initialSessionState);
        
        // Load leads for this list
        const leads = await leadService.getLeads(targetLeadList.id);
        console.log('useCloudLeadsData: Loaded', leads.length, 'leads for list:', targetLeadList.name);
        setLeadsData(leads);

        // Save the initial session state if it wasn't already saved
        if (!savedSession || savedSession.currentLeadListId !== targetLeadList.id) {
          console.log('useCloudLeadsData: Saving initial session state');
          await updateSessionState(initialSessionState);
        }
      } else {
        console.log('useCloudLeadsData: No lead lists found');
      }
    } catch (error) {
      console.error('useCloudLeadsData: Error loading user data:', error);
    } finally {
      setLoading(false);
      console.log('useCloudLeadsData: Data loading complete');
    }
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
    uploadCSVFile: (file: File) => uploadCSVFile(file, user?.id || ''),
    markLeadAsCalled,
    resetCallCount,
    resetAllCallCounts,
    resetDailyCallCount,
    loadDailyStats,
    updateSessionState
  };
};
