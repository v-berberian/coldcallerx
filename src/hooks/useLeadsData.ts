import { useState, useEffect, useCallback } from 'react';
import { Lead } from '../types/lead';
import { getPhoneDigits } from '../utils/phoneUtils';
import { appStorage } from '../utils/storage';

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

export const useLeadsData = (initialLeads: Lead[], refreshTrigger: number = 0) => {
  const [leadsData, setLeadsData] = useState<Lead[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Try to load from CSV-specific storage first
        const currentCSVId = await appStorage.getCurrentCSVId();
        let saved: Lead[] = [];
        
        if (currentCSVId) {
          saved = await appStorage.getCSVLeadsData(currentCSVId);
        }
        
        // If no CSV-specific data, fall back to old storage
        if (saved.length === 0) {
          saved = await appStorage.getLeadsData();
        }
        
        setLeadsData(saved.length > 0 ? saved : initialLeads);
        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading leads data:', error);
        setLeadsData(initialLeads);
        setIsLoaded(true);
      }
    })();
  }, [initialLeads, refreshTrigger]);

  useEffect(() => {
    if (isLoaded && leadsData.length > 0) {
      try {
        const currentCSVId = localStorage.getItem('coldcaller-current-csv-id');
        if (currentCSVId) {
          const key = `coldcaller-csv-${currentCSVId}-leads`;
          localStorage.setItem(key, JSON.stringify(leadsData));
        } else {
          // Fall back to old storage
          localStorage.setItem('coldcaller-leads-data', JSON.stringify(leadsData));
        }
      } catch (error) {
        console.error('Error saving leads data:', error);
      }
    }
  }, [leadsData, isLoaded]);

  const makeCall = (lead: Lead, markAsCalled: boolean = true, onCallMade?: () => void, onTransitionDetected?: () => void) => {
    const phoneNumber = getPhoneDigits(lead.phone);
    
    // Set up a flag to track if we've already marked this call
    let callMarked = false;
    let transitionDetected = false;
    
    // Function to mark the call when iOS transitions to Phone app
    const markCallOnTransition = () => {
      if (!callMarked && transitionDetected) {
        callMarked = true;
        
        // Call the transition callback to set callMadeToCurrentLead flag
        if (onTransitionDetected) {
          onTransitionDetected();
        }
        
        // Call the callback to increment daily call count
        if (onCallMade) {
          onCallMade();
        }
        
        // Mark the lead as called
        if (markAsCalled) {
          markLeadAsCalledWrapper(lead);
        } else {
          // Call the callback to increment daily call count
          if (onCallMade) {
            onCallMade();
          }
        }
      }
    };
    
    // Listen for app visibility change (when iOS transitions to Phone app)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        transitionDetected = true;
        markCallOnTransition();
      } else {
        // Clean up listeners when app regains focus
        cleanupListeners();
      }
    };
    
    // Listen for page blur (alternative method)
    const handlePageBlur = () => {
      transitionDetected = true;
      markCallOnTransition();
    };
    
    // Function to clean up all listeners
    const cleanupListeners = () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handlePageBlur);
      clearTimeout(cleanupTimeout);
    };
    
    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handlePageBlur);
    
    // Set a timeout to clean up listeners and handle edge cases
    const cleanupTimeout = setTimeout(() => {
      cleanupListeners();
      
      // If no transition was detected, don't mark the call
      if (!transitionDetected) {
        // If no transition was detected, don't mark the call
        callMarked = true;
        
        if (onTransitionDetected) {
          onTransitionDetected();
        }
        
        if (onCallMade) {
          onCallMade();
        }
        
        if (markAsCalled) {
          markLeadAsCalledWrapper(lead);
        }
      } else if (!callMarked) {
        callMarked = true;
        
        if (onTransitionDetected) {
          onTransitionDetected();
        }
        
        if (onCallMade) {
          onCallMade();
        }
        
        if (markAsCalled) {
          markLeadAsCalledWrapper(lead);
        }
      }
    }, 5000); // 5 second timeout to give more time for iOS transition
    
    // Initiate the call
    window.location.href = `tel:${phoneNumber}`;
  };

  const markLeadAsCalledWrapper = useCallback((lead: Lead) => {
    try {
      const now = new Date();
      
      // Ensure we have a valid date
      if (isNaN(now.getTime())) {
        return;
      }

      const dateString = now.toLocaleDateString();
      const timeString = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      const lastCalledString = `${dateString} at ${timeString}`;

      // Use a function to get the current leadsData to avoid stale closure
      setLeadsData(currentLeads => {
        const updatedLeads = currentLeads.map(l => 
          l.name === lead.name && l.phone === lead.phone ? {
            ...l,
            lastCalled: lastCalledString
          } : l
        );
        
        // Save to CSV-specific storage immediately using synchronous localStorage
        try {
          const currentCSVId = localStorage.getItem('coldcaller-current-csv-id');
          if (currentCSVId) {
            const key = `coldcaller-csv-${currentCSVId}-leads`;
            localStorage.setItem(key, JSON.stringify(updatedLeads));
          } else {
            // Fall back to old storage
            localStorage.setItem('coldcaller-leads-data', JSON.stringify(updatedLeads));
          }
        } catch (error) {
          console.error('Error saving leads data:', error);
        }
        
        return updatedLeads;
      });
    } catch (error) {
      console.error('Error in markLeadAsCalledWrapper:', error);
    }
  }, []); // Remove leadsData dependency to avoid stale closure

  const resetCallCountWrapper = useCallback((lead: Lead) => {
    try {
      // Use a function to get the current leadsData to avoid stale closure
      setLeadsData(currentLeads => {
        const updatedLeads = currentLeads.map(l => 
          l.name === lead.name && l.phone === lead.phone 
            ? { ...l, lastCalled: undefined }
            : l
        );
        
        // Save to CSV-specific storage immediately using synchronous localStorage
        try {
          const currentCSVId = localStorage.getItem('coldcaller-current-csv-id');
          if (currentCSVId) {
            const key = `coldcaller-csv-${currentCSVId}-leads`;
            localStorage.setItem(key, JSON.stringify(updatedLeads));
          } else {
            // Fall back to old storage
            localStorage.setItem('coldcaller-leads-data', JSON.stringify(updatedLeads));
          }
        } catch (error) {
          console.error('Error saving leads data:', error);
        }
        
        return updatedLeads;
      });
    } catch (error) {
      console.error('Error in resetCallCountWrapper:', error);
    }
  }, []); // Remove leadsData dependency to avoid stale closure

  const resetAllCallCountsWrapper = useCallback(() => {
    try {
      // Use a function to get the current leadsData to avoid stale closure
      setLeadsData(currentLeads => {
        const updatedLeads = currentLeads.map(l => ({
          ...l,
          lastCalled: undefined
        }));
        
        // Save to CSV-specific storage immediately using synchronous localStorage
        try {
          const currentCSVId = localStorage.getItem('coldcaller-current-csv-id');
          if (currentCSVId) {
            const key = `coldcaller-csv-${currentCSVId}-leads`;
            localStorage.setItem(key, JSON.stringify(updatedLeads));
          } else {
            // Fall back to old storage
            localStorage.setItem('coldcaller-leads-data', JSON.stringify(updatedLeads));
          }
        } catch (error) {
          console.error('Error saving leads data:', error);
        }
        
        return updatedLeads;
      });
    } catch (error) {
      console.error('Error in resetAllCallCountsWrapper:', error);
    }
  }, []); // Remove leadsData dependency to avoid stale closure

  // Function to mark a lead as called when navigating away
  const markLeadAsCalledOnNavigation = useCallback((lead: Lead) => {
    markLeadAsCalledWrapper(lead);
  }, [markLeadAsCalledWrapper]);

  return {
    leadsData,
    setLeadsData,
    isLoaded,
    makeCall,
    markLeadAsCalled: markLeadAsCalledWrapper,
    markLeadAsCalledOnNavigation,
    resetCallCount: resetCallCountWrapper,
    resetAllCallCounts: resetAllCallCountsWrapper
  };
};
