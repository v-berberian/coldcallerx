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

export const useLeadsData = (initialLeads: Lead[]) => {
  const [leadsData, setLeadsData] = useState<Lead[]>(() => {
    // Try to load from storage first, fallback to initial leads
    const savedLeads = appStorage.getLeadsData();
    if (savedLeads.length > 0) {
      console.log('Loading leads from storage:', savedLeads.length, 'leads');
      return savedLeads;
    }
    console.log('No saved leads found, using initial leads:', initialLeads.length, 'leads');
    return initialLeads.map(lead => ({
      ...lead,
      lastCalled: lead.lastCalled || undefined
    }));
  });

  // Update local state when initialLeads change
  useEffect(() => {
    setLeadsData(initialLeads.map(lead => ({
      ...lead,
      lastCalled: lead.lastCalled || undefined
    })));
  }, [initialLeads]);

  // Save leads data to storage whenever it changes
  useEffect(() => {
    if (leadsData.length > 0) {
      appStorage.saveLeadsData(leadsData);
    }
  }, [leadsData]);

  // Log call tracking capabilities on mount
  useEffect(() => {
    console.log('📱 CALL TRACKING CAPABILITIES ON iOS:');
    console.log('✅ CAN TRACK: iOS transition from app to Phone app');
    console.log('✅ CAN TRACK: When Phone app actually opens');
    console.log('✅ CAN TRACK: App focus loss (indicates call initiation)');
    console.log('❌ CANNOT TRACK: Actual call completion (answered/hung up)');
    console.log('❌ CANNOT TRACK: Call duration or length');
    console.log('❌ CANNOT TRACK: Call outcome (voicemail, busy, etc.)');
    console.log('🔒 REASON: iOS privacy restrictions prevent call state access');
    console.log('📞 SOLUTION: App tracks iOS transitions to Phone app');
  }, []);

  const makeCall = (lead: Lead, markAsCalled: boolean = true, onCallMade?: () => void, onTransitionDetected?: () => void) => {
    const phoneNumber = getPhoneDigits(lead.phone);
    
    console.log('📞 CALL ATTEMPT: Initiating call to', lead.name, 'at', phoneNumber);
    console.log('📱 Waiting for iOS transition to Phone app...');
    
    // Set up a flag to track if we've already marked this call
    let callMarked = false;
    let transitionDetected = false;
    
    // Function to mark the call when iOS transitions to Phone app
    const markCallOnTransition = () => {
      if (!callMarked && transitionDetected) {
        callMarked = true;
        console.log('✅ iOS TRANSITION DETECTED: App lost focus - Phone app opened');
        console.log('📞 CALL INITIATED: Lead will be marked as called');
        
        // Call the transition callback to set callMadeToCurrentLead flag
        if (onTransitionDetected) {
          console.log('🎯 SETTING CALL FLAG: Marking that call was actually made');
          onTransitionDetected();
        }
        
        // Call the callback to increment daily call count
        if (onCallMade) {
          onCallMade();
        }
        
        // Mark the lead as called
        if (markAsCalled) {
          console.log('✅ MARKING AS CALLED: Lead marked immediately after iOS transition');
          markLeadAsCalledWrapper(lead);
        } else {
          console.log('⏳ DEFERRED MARKING: Lead will be marked on navigation');
        }
      }
    };
    
    // Listen for app visibility change (when iOS transitions to Phone app)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('📱 APP LOST FOCUS: iOS transitioning to Phone app');
        transitionDetected = true;
        markCallOnTransition();
      } else {
        console.log('📱 APP REGAINED FOCUS: User returned from Phone app');
        // Clean up listeners when app regains focus
        cleanupListeners();
      }
    };
    
    // Listen for page blur (alternative method)
    const handlePageBlur = () => {
      console.log('📱 PAGE BLUR: iOS transitioning to Phone app');
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
        console.log('❌ NO iOS TRANSITION: User likely cancelled the call menu');
        console.log('📞 CALL NOT MARKED: Lead will not be marked as called');
        console.log('🎯 CALL FLAG NOT SET: callMadeToCurrentLead remains false');
      } else if (!callMarked) {
        console.log('⏰ TIMEOUT: iOS transition detected but call not marked yet');
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

      console.log('✅ LEAD MARKED AS CALLED:', lead.name, 'at', lastCalledString);
      console.log('📊 TRACKING STATUS: Call attempt logged (iOS cannot track actual call duration)');
      console.log('🔒 PRIVACY NOTE: iOS prevents apps from accessing call logs or call state');

      const updatedLeads = leadsData.map(l => 
        l.name === lead.name && l.phone === lead.phone ? {
          ...l,
          lastCalled: lastCalledString
        } : l
      );
      
      setLeadsData(updatedLeads);
      
      // Save to appStorage
      appStorage.saveLeadsData(updatedLeads);
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
      
      // Save to appStorage
      appStorage.saveLeadsData(updatedLeads);
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
      
      // Save to appStorage
      appStorage.saveLeadsData(updatedLeads);
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
