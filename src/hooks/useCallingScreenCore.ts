
import { useState, useCallback, useRef, useEffect } from 'react';
import { Lead } from '../types/lead';
import { SessionState } from '@/services/sessionService';

interface UseCallingScreenCoreProps {
  leads: Lead[];
  sessionState?: SessionState;
}

export const useCallingScreenCore = ({ leads, sessionState }: UseCallingScreenCoreProps) => {
  // Core state
  const [componentReady, setComponentReady] = useState(false);
  const [leadsInitialized, setLeadsInitialized] = useState(false);
  const [leadsData, setLeadsData] = useState<Lead[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardKey, setCardKey] = useState(0);
  
  // Filters
  const [timezoneFilter, setTimezoneFilter] = useState<'ALL' | 'EST_CST'>('ALL');
  const [callFilter, setCallFilter] = useState<'ALL' | 'UNCALLED'>('ALL');
  const [shuffleMode, setShuffleMode] = useState(false);
  const [autoCall, setAutoCall] = useState(false);
  const [callDelay, setCallDelay] = useState(15);
  
  // Auto-call state
  const [shouldAutoCall, setShouldAutoCall] = useState(false);
  const [currentLeadForAutoCall, setCurrentLeadForAutoCall] = useState<Lead | null>(null);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [countdownTime, setCountdownTime] = useState(0);
  
  // Navigation history for shuffle mode
  const [navigationHistory, setNavigationHistory] = useState<number[]>([0]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [shownLeadsInShuffle, setShownLeadsInShuffle] = useState<Set<string>>(new Set());
  
  // Session restoration tracking
  const sessionRestoredRef = useRef(false);
  const initializationCompleteRef = useRef(false);

  // Initialize leads data when leads change
  useEffect(() => {
    if (leads.length > 0 && !initializationCompleteRef.current) {
      console.log('Initializing leads data:', leads.length);
      const formattedLeads = leads.map(lead => ({
        ...lead,
        called: lead.called || 0,
        lastCalled: lead.lastCalled || undefined
      }));
      setLeadsData(formattedLeads);
      setLeadsInitialized(true);
      setComponentReady(true);
      initializationCompleteRef.current = true;
    }
  }, [leads.length]);

  // Restore session state once when available
  useEffect(() => {
    if (
      sessionState && 
      leadsData.length > 0 && 
      leadsInitialized && 
      componentReady && 
      !sessionRestoredRef.current
    ) {
      console.log('Restoring session state:', sessionState);
      if (sessionState.currentLeadIndex !== undefined && leadsData.length > 0) {
        const validIndex = Math.max(0, Math.min(sessionState.currentLeadIndex, leadsData.length - 1));
        setCurrentIndex(validIndex);
        setCardKey(prev => prev + 1);
      }
      
      // Restore filters
      setTimezoneFilter(sessionState.timezoneFilter as 'ALL' | 'EST_CST');
      setCallFilter(sessionState.callFilter as 'ALL' | 'UNCALLED');
      setShuffleMode(sessionState.shuffleMode);
      setAutoCall(sessionState.autoCall);
      setCallDelay(sessionState.callDelay);
      
      sessionRestoredRef.current = true;
    }
  }, [sessionState?.currentLeadIndex, leadsData.length, leadsInitialized, componentReady]);

  // Reset initialization when leads change significantly
  useEffect(() => {
    if (leads.length > 0 && leadsData.length > 0 && leads.length !== leadsData.length) {
      console.log('Leads changed, resetting initialization');
      initializationCompleteRef.current = false;
      sessionRestoredRef.current = false;
    }
  }, [leads.length, leadsData.length]);

  const resetLeadsData = useCallback((newLeads: Lead[]) => {
    console.log('Resetting leads data with', newLeads.length, 'leads');
    const formattedLeads = newLeads.map(lead => ({
      ...lead,
      called: lead.called || 0,
      lastCalled: lead.lastCalled || undefined
    }));
    setLeadsData(formattedLeads);
    setCurrentIndex(0);
    setCardKey(prev => prev + 1);
    setNavigationHistory([0]);
    setHistoryIndex(0);
    setShownLeadsInShuffle(new Set());
    initializationCompleteRef.current = true;
  }, []);

  return {
    // State
    componentReady,
    setComponentReady,
    leadsInitialized,
    setLeadsInitialized,
    leadsData,
    setLeadsData,
    currentIndex,
    setCurrentIndex,
    cardKey,
    setCardKey,
    
    // Filters
    timezoneFilter,
    setTimezoneFilter,
    callFilter,
    setCallFilter,
    shuffleMode,
    setShuffleMode,
    autoCall,
    setAutoCall,
    callDelay,
    setCallDelay,
    
    // Auto-call
    shouldAutoCall,
    setShouldAutoCall,
    currentLeadForAutoCall,
    setCurrentLeadForAutoCall,
    isCountdownActive,
    setIsCountdownActive,
    countdownTime,
    setCountdownTime,
    
    // Navigation
    navigationHistory,
    setNavigationHistory,
    historyIndex,
    setHistoryIndex,
    shownLeadsInShuffle,
    setShownLeadsInShuffle,
    
    // Actions
    resetLeadsData
  };
};
