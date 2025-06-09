import { useState, useEffect } from 'react';
import { filterLeadsByTimezone, getTimezoneGroup } from '../utils/timezoneUtils';
import { getPhoneDigits } from '../utils/phoneUtils';

interface Lead {
  name: string;
  phone: string;
  called?: number;
  lastCalled?: string;
}

export const useLeadNavigation = (initialLeads: Lead[]) => {
  const [leadsData, setLeadsData] = useState<Lead[]>(
    initialLeads.map(lead => ({
      ...lead,
      called: lead.called || 0,
      lastCalled: lead.lastCalled || undefined
    }))
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [navigationHistory, setNavigationHistory] = useState<number[]>([0]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [cardKey, setCardKey] = useState(0);
  const [timezoneFilter, setTimezoneFilter] = useState<'ALL' | 'EST_CST'>('ALL');
  const [callFilter, setCallFilter] = useState<'ALL' | 'UNCALLED'>('ALL');
  const [shuffleMode, setShuffleMode] = useState(false);
  const [autoCall, setAutoCall] = useState(false);

  const getBaseLeads = () => {
    let filtered = filterLeadsByTimezone(leadsData, timezoneFilter);
    if (callFilter === 'UNCALLED') {
      filtered = filtered.filter(lead => !lead.called || lead.called === 0);
    }
    return filtered;
  };

  useEffect(() => {
    console.log('Filter change effect triggered', { timezoneFilter, callFilter });
    
    const baseLeadsBeforeFilter = getBaseLeads();
    const currentlyViewedLead = baseLeadsBeforeFilter[currentIndex];
    
    console.log('Currently viewed lead:', currentlyViewedLead?.name);
    
    let newFilteredLeads = filterLeadsByTimezone(leadsData, timezoneFilter);
    if (callFilter === 'UNCALLED') {
      newFilteredLeads = newFilteredLeads.filter(lead => !lead.called || lead.called === 0);
    }
    
    console.log('New filtered leads count:', newFilteredLeads.length);
    
    if (currentlyViewedLead) {
      const currentLeadMatchesNewFilter = newFilteredLeads.some(lead => 
        lead.name === currentlyViewedLead.name && lead.phone === currentlyViewedLead.phone
      );
      
      if (currentLeadMatchesNewFilter) {
        const newIndexOfCurrentLead = newFilteredLeads.findIndex(lead => 
          lead.name === currentlyViewedLead.name && lead.phone === currentlyViewedLead.phone
        );
        console.log('Current lead matches new filter, keeping at index:', newIndexOfCurrentLead);
        setCurrentIndex(newIndexOfCurrentLead);
        // Keep existing history but add current position
        setNavigationHistory(prev => [...prev, newIndexOfCurrentLead]);
        setHistoryIndex(prev => prev + 1);
        setCardKey(prev => prev + 1);
        return;
      }
      
      const originalIndex = leadsData.findIndex(lead => 
        lead.name === currentlyViewedLead.name && lead.phone === currentlyViewedLead.phone
      );
      
      console.log('Original index of current lead:', originalIndex);
      
      let nextIndex = 0;
      let foundNextLead = false;
      
      for (let i = originalIndex + 1; i < leadsData.length; i++) {
        const leadAtIndex = leadsData[i];
        const indexInFiltered = newFilteredLeads.findIndex(filteredLead => 
          filteredLead.name === leadAtIndex.name && filteredLead.phone === leadAtIndex.phone
        );
        
        if (indexInFiltered !== -1) {
          nextIndex = indexInFiltered;
          foundNextLead = true;
          console.log('Found next lead after current position at filtered index:', nextIndex, 'lead:', leadAtIndex.name);
          break;
        }
      }
      
      if (!foundNextLead) {
        console.log('No lead found after current position, wrapping to beginning');
        for (let i = 0; i <= originalIndex; i++) {
          const leadAtIndex = leadsData[i];
          const indexInFiltered = newFilteredLeads.findIndex(filteredLead => 
            filteredLead.name === leadAtIndex.name && filteredLead.phone === leadAtIndex.phone
          );
          
          if (indexInFiltered !== -1) {
            nextIndex = indexInFiltered;
            console.log('Found wrapped lead at filtered index:', nextIndex, 'lead:', leadAtIndex.name);
            break;
          }
        }
      }
      
      setCurrentIndex(nextIndex);
      // Keep existing history but add new position
      setNavigationHistory(prev => [...prev, nextIndex]);
      setHistoryIndex(prev => prev + 1);
      setCardKey(prev => prev + 1);
    } else if (newFilteredLeads.length > 0) {
      console.log('No current lead, setting to first');
      setCurrentIndex(0);
      // Keep existing history but add new position
      setNavigationHistory(prev => [...prev, 0]);
      setHistoryIndex(prev => prev + 1);
      setCardKey(prev => prev + 1);
    }
  }, [timezoneFilter, callFilter]);

  useEffect(() => {
    const baseLeads = getBaseLeads();
    if (currentIndex >= baseLeads.length && baseLeads.length > 0) {
      setCurrentIndex(0);
      setNavigationHistory([0]);
      setHistoryIndex(0);
      setCardKey(prev => prev + 1);
    }
  }, [timezoneFilter, callFilter, currentIndex]);

  const makeCall = (lead: Lead) => {
    const phoneNumber = getPhoneDigits(lead.phone);
    window.location.href = `tel:${phoneNumber}`;
    
    const updatedLeads = leadsData.map(l => 
      l.name === lead.name && l.phone === lead.phone ? {
        ...l,
        called: (l.called || 0) + 1,
        lastCalled: new Date().toLocaleDateString()
      } : l
    );
    setLeadsData(updatedLeads);
  };

  const handleNext = () => {
    const baseLeads = getBaseLeads();
    let nextIndex;
    
    if (shuffleMode) {
      const uncalledLeads = baseLeads.filter(lead => !lead.called || lead.called === 0);
      
      if (uncalledLeads.length > 0) {
        const randomUncalledLead = uncalledLeads[Math.floor(Math.random() * uncalledLeads.length)];
        nextIndex = baseLeads.findIndex(lead => 
          lead.name === randomUncalledLead.name && lead.phone === randomUncalledLead.phone
        );
      } else {
        do {
          nextIndex = Math.floor(Math.random() * baseLeads.length);
        } while (nextIndex === currentIndex && baseLeads.length > 1);
      }
    } else {
      nextIndex = (currentIndex + 1) % baseLeads.length;
    }
    
    setCurrentIndex(nextIndex);
    setCardKey(prev => prev + 1);
    const newHistory = navigationHistory.slice(0, historyIndex + 1);
    newHistory.push(nextIndex);
    setNavigationHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    if (autoCall && baseLeads[nextIndex]) {
      makeCall(baseLeads[nextIndex]);
    }
  };

  const handlePrevious = () => {
    if (historyIndex > 0) {
      const newHistoryIndex = historyIndex - 1;
      const prevIndex = navigationHistory[newHistoryIndex];
      setCurrentIndex(prevIndex);
      setHistoryIndex(newHistoryIndex);
      setCardKey(prev => prev + 1);
    }
  };

  const resetCallCount = (lead: Lead) => {
    const updatedLeads = leadsData.map(l => 
      l.name === lead.name && l.phone === lead.phone 
        ? { ...l, called: 0, lastCalled: undefined }
        : l
    );
    setLeadsData(updatedLeads);
  };

  const resetAllCallCounts = () => {
    const updatedLeads = leadsData.map(l => ({
      ...l,
      called: 0,
      lastCalled: undefined
    }));
    setLeadsData(updatedLeads);
  };

  const selectLead = (lead: Lead) => {
    const baseLeads = getBaseLeads();
    const leadIndex = baseLeads.findIndex(l => l.name === lead.name && l.phone === lead.phone);
    if (leadIndex !== -1) {
      setCurrentIndex(leadIndex);
      setNavigationHistory([leadIndex]);
      setHistoryIndex(0);
      setCardKey(prev => prev + 1);
    }
  };

  return {
    leadsData,
    currentIndex,
    cardKey,
    timezoneFilter,
    callFilter,
    shuffleMode,
    autoCall,
    historyIndex,
    getBaseLeads,
    makeCall,
    handleNext,
    handlePrevious,
    resetCallCount,
    resetAllCallCounts,
    selectLead,
    toggleTimezoneFilter: () => setTimezoneFilter(prev => prev === 'ALL' ? 'EST_CST' : 'ALL'),
    toggleCallFilter: () => setCallFilter(prev => prev === 'ALL' ? 'UNCALLED' : 'ALL'),
    toggleShuffle: () => setShuffleMode(prev => !prev),
    toggleAutoCall: () => setAutoCall(prev => !prev)
  };
};
