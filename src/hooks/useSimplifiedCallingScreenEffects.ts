
import { useEffect } from 'react';
import { Lead } from '../types/lead';
import { SessionState } from '@/services/sessionService';
import { useComponentInitialization } from './useComponentInitialization';
import { useSessionPersistence } from './useSessionPersistence';
import { useAutoCallEffects } from './useAutoCallEffects';

interface UseSimplifiedCallingScreenEffectsProps {
  componentReady: boolean;
  setComponentReady: (ready: boolean) => void;
  leadsInitialized: boolean;
  setLeadsInitialized: (initialized: boolean) => void;
  leads: Lead[];
  leadsData: Lead[];
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

export const useSimplifiedCallingScreenEffects = ({
  componentReady,
  setComponentReady,
  leadsInitialized,
  setLeadsInitialized,
  leads,
  leadsData,
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
}: UseSimplifiedCallingScreenEffectsProps) => {
  
  // Initialize component when leads are available
  useEffect(() => {
    console.log('Component initialization effect:', { 
      leadsLength: leads.length, 
      leadsDataLength: leadsData.length,
      componentReady,
      leadsInitialized
    });

    if (leads.length > 0 && leadsData.length > 0 && !leadsInitialized) {
      console.log('Setting leads as initialized');
      setLeadsInitialized(true);
    }

    if (leadsInitialized && !componentReady) {
      console.log('Setting component as ready');
      setComponentReady(true);
    }
  }, [leads.length, leadsData.length, leadsInitialized, componentReady, setLeadsInitialized, setComponentReady]);

  // Reset leads data when leads change - use length comparison instead of object comparison
  useEffect(() => {
    if (leads.length > 0 && leads.length !== leadsData.length) {
      console.log('Resetting leads data with new leads:', leads.length);
      memoizedResetLeadsData(leads);
    }
  }, [leads.length, leadsData.length, memoizedResetLeadsData]);

  useSessionPersistence({
    componentReady,
    leadsInitialized,
    currentIndex,
    timezoneFilter,
    callFilter,
    shuffleMode,
    autoCall,
    callDelay,
    updateSessionState
  });

  useAutoCallEffects({
    shouldAutoCall,
    autoCall,
    componentReady,
    leadsInitialized,
    currentIndex,
    callDelay,
    getBaseLeads,
    setCurrentLeadForAutoCall,
    executeAutoCall,
    setShouldAutoCall,
    markLeadAsCalled
  });

  // Note: localStorage saving is now handled directly in useNavigationState
  // for immediate persistence on every navigation change
};
