
import { useCallback } from 'react';
import { Lead } from '../types/lead';
import { getStateFromAreaCode } from '../utils/timezoneUtils';

interface UseSimplifiedNavigationProps {
  leadsData: Lead[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  setCardKey: (fn: (prev: number) => number) => void;
  timezoneFilter: 'ALL' | 'EST_CST';
  callFilter: 'ALL' | 'UNCALLED';
  shuffleMode: boolean;
  navigationHistory: number[];
  setNavigationHistory: (history: number[]) => void;
  historyIndex: number;
  setHistoryIndex: (index: number) => void;
  shownLeadsInShuffle: Set<string>;
  setShownLeadsInShuffle: (shown: Set<string>) => void;
}

export const useSimplifiedNavigation = ({
  leadsData,
  currentIndex,
  setCurrentIndex,
  setCardKey,
  timezoneFilter,
  callFilter,
  shuffleMode,
  navigationHistory,
  setNavigationHistory,
  historyIndex,
  setHistoryIndex,
  shownLeadsInShuffle,
  setShownLeadsInShuffle
}: UseSimplifiedNavigationProps) => {

  const getFilteredLeads = useCallback(() => {
    let filtered = [...leadsData];

    // Apply timezone filter
    if (timezoneFilter === 'EST_CST') {
      filtered = filtered.filter(lead => {
        const state = getStateFromAreaCode(lead.phone);
        return ['NY', 'NJ', 'CT', 'MA', 'VT', 'NH', 'ME', 'RI', 'PA', 'DE', 'MD', 'DC', 'VA', 'WV', 'NC', 'SC', 'GA', 'FL', 'OH', 'KY', 'TN', 'AL', 'MS', 'IN', 'MI', 'IL', 'WI', 'MN', 'IA', 'MO', 'AR', 'LA', 'ND', 'SD', 'NE', 'KS', 'OK', 'TX'].includes(state.split(' - ')[0]);
      });
    }

    // Apply call filter
    if (callFilter === 'UNCALLED') {
      filtered = filtered.filter(lead => (lead.called || 0) === 0);
    }

    return filtered;
  }, [leadsData, timezoneFilter, callFilter]);

  const handleNext = useCallback(() => {
    const baseLeads = getFilteredLeads();
    if (baseLeads.length === 0) return;

    let nextIndex: number;

    if (shuffleMode) {
      // Shuffle mode logic
      const createLeadKey = (lead: Lead) => `${lead.name}-${lead.phone}`;
      const unshownLeads = baseLeads.filter(lead => 
        !shownLeadsInShuffle.has(createLeadKey(lead))
      );

      if (unshownLeads.length > 0) {
        const randomIndex = Math.floor(Math.random() * unshownLeads.length);
        const randomLead = unshownLeads[randomIndex];
        nextIndex = baseLeads.findIndex(lead => 
          lead.name === randomLead.name && lead.phone === randomLead.phone
        );
        
        // Mark as shown
        const newShown = new Set(shownLeadsInShuffle);
        newShown.add(createLeadKey(randomLead));
        setShownLeadsInShuffle(newShown);
      } else {
        // All shown, reset and pick random
        setShownLeadsInShuffle(new Set());
        nextIndex = Math.floor(Math.random() * baseLeads.length);
      }
    } else {
      // Sequential mode
      nextIndex = (currentIndex + 1) % baseLeads.length;
    }

    setCurrentIndex(nextIndex);
    setCardKey(prev => prev + 1);

    // Update navigation history
    const newHistory = navigationHistory.slice(0, historyIndex + 1);
    newHistory.push(nextIndex);
    setNavigationHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [currentIndex, shuffleMode, getFilteredLeads, shownLeadsInShuffle, setShownLeadsInShuffle, setCurrentIndex, setCardKey, navigationHistory, historyIndex, setNavigationHistory, setHistoryIndex]);

  const handlePrevious = useCallback(() => {
    const baseLeads = getFilteredLeads();
    if (baseLeads.length === 0) return;

    if (shuffleMode && historyIndex > 0) {
      // Use history in shuffle mode
      const newHistoryIndex = historyIndex - 1;
      const prevIndex = navigationHistory[newHistoryIndex];
      setCurrentIndex(prevIndex);
      setHistoryIndex(newHistoryIndex);
      setCardKey(prev => prev + 1);
    } else {
      // Sequential mode
      const prevIndex = currentIndex === 0 ? baseLeads.length - 1 : currentIndex - 1;
      setCurrentIndex(prevIndex);
      setCardKey(prev => prev + 1);
    }
  }, [currentIndex, shuffleMode, historyIndex, navigationHistory, getFilteredLeads, setCurrentIndex, setHistoryIndex, setCardKey]);

  const selectLead = useCallback((lead: Lead) => {
    const baseLeads = getFilteredLeads();
    const leadIndex = baseLeads.findIndex(l => l.name === lead.name && l.phone === lead.phone);
    
    if (leadIndex !== -1) {
      setCurrentIndex(leadIndex);
      setCardKey(prev => prev + 1);
      
      // Update navigation history
      const newHistory = navigationHistory.slice(0, historyIndex + 1);
      newHistory.push(leadIndex);
      setNavigationHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [getFilteredLeads, setCurrentIndex, setCardKey, navigationHistory, historyIndex, setNavigationHistory, setHistoryIndex]);

  return {
    getFilteredLeads,
    handleNext,
    handlePrevious,
    selectLead
  };
};
