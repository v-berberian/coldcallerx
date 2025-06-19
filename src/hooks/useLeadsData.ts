import { useState, useEffect, useCallback } from 'react';
import { Lead } from '../types/lead';
import { getPhoneDigits } from '../utils/phoneUtils';

// Throttle localStorage saves to prevent performance issues with large datasets
const throttleLocalStorage = (() => {
  let timeoutId: NodeJS.Timeout | null = null;
  let pendingData: string | null = null;
  
  return (key: string, data: string) => {
    pendingData = data;
    
    if (timeoutId) return;
    
    timeoutId = setTimeout(() => {
      if (pendingData) {
        try {
          localStorage.setItem(key, pendingData);
        } catch (error) {
          console.error('localStorage save failed:', error);
          // If storage is full, try to clear some space
          if (error instanceof Error && error.name === 'QuotaExceededError') {
            try {
              // Remove old data to make space
              const keys = Object.keys(localStorage);
              const oldKeys = keys.filter(k => k.startsWith('coldcaller-') && k !== key);
              if (oldKeys.length > 0) {
                localStorage.removeItem(oldKeys[0]);
                localStorage.setItem(key, pendingData);
              }
            } catch (clearError) {
              console.error('Failed to clear localStorage space:', clearError);
            }
          }
        }
        pendingData = null;
      }
      timeoutId = null;
    }, 1000); // Throttle to 1 second
  };
})();

export const useLeadsData = (initialLeads: Lead[]) => {
  const [leadsData, setLeadsData] = useState<Lead[]>(
    initialLeads.map(lead => ({
      ...lead,
      lastCalled: lead.lastCalled || undefined
    }))
  );

  // Update local state when initialLeads change
  useEffect(() => {
    setLeadsData(initialLeads.map(lead => ({
      ...lead,
      lastCalled: lead.lastCalled || undefined
    })));
  }, [initialLeads]);

  const makeCall = (lead: Lead, markAsCalled: boolean = true) => {
    const phoneNumber = getPhoneDigits(lead.phone);
    window.location.href = `tel:${phoneNumber}`;
    
    // Only update the lead data if we should mark it as called
    if (markAsCalled) {
      markLeadAsCalledWrapper(lead);
    }
  };

  const markLeadAsCalledWrapper = useCallback((lead: Lead) => {
    try {
      const now = new Date();
      
      // Ensure we have a valid date
      if (isNaN(now.getTime())) {
        console.error('Invalid date created');
        return;
      }

      const dateString = now.toLocaleDateString();
      const timeString = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      const lastCalledString = `${dateString} at ${timeString}`;

      console.log('Marking lead as called:', lead.name, 'at', lastCalledString);

      const updatedLeads = leadsData.map(l => 
        l.name === lead.name && l.phone === lead.phone ? {
          ...l,
          lastCalled: lastCalledString
        } : l
      );
      
      setLeadsData(updatedLeads);
      
      // Use throttled localStorage save
      throttleLocalStorage('coldcaller-leads', JSON.stringify(updatedLeads));
    } catch (error) {
      console.error('Error in markLeadAsCalledWrapper:', error);
    }
  }, [leadsData]);

  const resetCallCountWrapper = useCallback((lead: Lead) => {
    try {
      const updatedLeads = leadsData.map(l => 
        l.name === lead.name && l.phone === lead.phone 
          ? { ...l, lastCalled: undefined }
          : l
      );
      setLeadsData(updatedLeads);
      
      // Use throttled localStorage save
      throttleLocalStorage('coldcaller-leads', JSON.stringify(updatedLeads));
    } catch (error) {
      console.error('Error in resetCallCountWrapper:', error);
    }
  }, [leadsData]);

  const resetAllCallCountsWrapper = useCallback(() => {
    try {
      const updatedLeads = leadsData.map(l => ({
        ...l,
        lastCalled: undefined
      }));
      setLeadsData(updatedLeads);
      
      // Use throttled localStorage save
      throttleLocalStorage('coldcaller-leads', JSON.stringify(updatedLeads));
    } catch (error) {
      console.error('Error in resetAllCallCountsWrapper:', error);
    }
  }, [leadsData]);

  // Function to mark a lead as called when navigating away
  const markLeadAsCalledOnNavigation = useCallback((lead: Lead) => {
    console.log('Marking lead as called on navigation:', lead.name);
    markLeadAsCalledWrapper(lead);
  }, [markLeadAsCalledWrapper]);

  return {
    leadsData,
    setLeadsData,
    makeCall,
    markLeadAsCalled: markLeadAsCalledWrapper,
    markLeadAsCalledOnNavigation,
    resetCallCount: resetCallCountWrapper,
    resetAllCallCounts: resetAllCallCountsWrapper
  };
};
