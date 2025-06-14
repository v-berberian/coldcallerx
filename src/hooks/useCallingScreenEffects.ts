
import { useEffect } from 'react';
import { Lead } from '../types/lead';
import { SessionState } from '@/services/sessionService';

interface UseCallingScreenEffectsProps {
  componentReady: boolean;
  setComponentReady: (ready: boolean) => void;
  leadsInitialized: boolean;
  setLeadsInitialized: (initialized: boolean) => void;
  leads: Lead[];
  memoizedResetLeadsData: (leads: Lead[]) => void;
  currentIndex: number;
  timezoneFilter: string;
  callFilter: string;
  shuffleMode: boolean;
  autoCall: boolean;
  callDelay: number;
  updateSessionState?: (updates: Partial<SessionState>) => Promise<boolean>;
  shouldAutoCall: boolean;
  setShouldAutoCall: (should: boolean) => void;
  setCurrentLeadForAutoCall: (lead: Lead | null) => void;
  executeAutoCall: (lead: Lead) => void;
  getBaseLeads: () => Lead[];
  markLeadAsCalled?: (lead: Lead) => Promise<boolean>;
}

export const useCallingScreenEffects = ({
  componentReady,
  setComponentReady,
  leadsInitialized,
  setLeadsInitialized,
  leads,
  memoizedResetLeadsData,
  currentIndex,
  timezoneFilter,
  callFilter,
  shuffleMode,
  autoCall,
  callDelay,
  updateSessionState,
  shouldAutoCall,
  setShouldAutoCall,
  setCurrentLeadForAutoCall,
  executeAutoCall,
  getBaseLeads,
  markLeadAsCalled
}: UseCallingScreenEffectsProps) => {
  
  // Progressive component initialization
  useEffect(() => {
    console.log('CallingScreenLogic: Starting progressive initialization');
    
    const initializeComponent = async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      console.log('CallingScreenLogic: Component ready');
      setComponentReady(true);
    };

    initializeComponent();
  }, [setComponentReady]);

  // Handle new CSV imports by resetting the leads data - only when leads actually change
  useEffect(() => {
    if (componentReady && !leadsInitialized) {
      console.log('CallingScreenLogic: Initializing leads data for first time');
      memoizedResetLeadsData(leads);
      setLeadsInitialized(true);
    }
  }, [componentReady, leadsInitialized, leads.length, memoizedResetLeadsData, setLeadsInitialized]);

  // Save session state changes to cloud
  useEffect(() => {
    if (updateSessionState && componentReady && leadsInitialized) {
      const saveSessionState = async () => {
        await updateSessionState({
          currentLeadIndex: currentIndex,
          timezoneFilter,
          callFilter,
          shuffleMode,
          autoCall,
          callDelay
        });
      };

      const timeoutId = setTimeout(saveSessionState, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [currentIndex, timezoneFilter, callFilter, shuffleMode, autoCall, callDelay, updateSessionState, componentReady, leadsInitialized]);

  // Handle auto-call trigger - this should fire immediately when shouldAutoCall becomes true
  useEffect(() => {
    if (shouldAutoCall && autoCall && componentReady && leadsInitialized) {
      const currentLeads = getBaseLeads();
      const currentLead = currentLeads[currentIndex];
      
      if (currentLead) {
        console.log('CallingScreenLogic: Auto-call triggered immediately for displayed lead:', currentLead.name, currentLead.phone);
        setCurrentLeadForAutoCall(currentLead);
        executeAutoCall(currentLead);
        
        // Mark as called in cloud if function is provided
        if (markLeadAsCalled) {
          markLeadAsCalled(currentLead);
        }
      }
      
      setShouldAutoCall(false);
    }
  }, [shouldAutoCall, autoCall, currentIndex, executeAutoCall, setCurrentLeadForAutoCall, setShouldAutoCall, markLeadAsCalled, componentReady, leadsInitialized, getBaseLeads]);
};
