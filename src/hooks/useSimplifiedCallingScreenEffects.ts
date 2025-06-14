
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
  
  useComponentInitialization({
    componentReady,
    leadsInitialized,
    setLeadsInitialized,
    leads,
    memoizedResetLeadsData
  });

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

  // Save current index to localStorage when it changes
  useEffect(() => {
    if (leadsData.length > 0) {
      localStorage.setItem('coldcaller-current-index', currentIndex.toString());
    }
  }, [currentIndex, leadsData.length]);
};
