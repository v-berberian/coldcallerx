
import { useState, useEffect } from 'react';
import { Lead } from '../types/lead';
import { getPhoneDigits } from '../utils/phoneUtils';

export const useLeadsData = (initialLeads: Lead[]) => {
  const [leadsData, setLeadsData] = useState<Lead[]>(
    initialLeads.map(lead => ({
      ...lead,
      called: lead.called || 0,
      lastCalled: lead.lastCalled || undefined
    }))
  );

  // Update local state when initialLeads change
  useEffect(() => {
    console.log('useLeadsData: Updating with new initial leads:', initialLeads.length);
    setLeadsData(initialLeads.map(lead => ({
      ...lead,
      called: lead.called || 0,
      lastCalled: lead.lastCalled || undefined
    })));
  }, [initialLeads]);

  // Load from localStorage on component mount to restore call counts
  useEffect(() => {
    const savedLeads = localStorage.getItem('leadsData');
    if (savedLeads && initialLeads.length > 0) {
      try {
        const parsedLeads = JSON.parse(savedLeads);
        console.log('useLeadsData: Restoring call counts from localStorage for', parsedLeads.length, 'leads');
        
        // Merge saved call data with current leads
        const mergedLeads = initialLeads.map(lead => {
          const savedLead = parsedLeads.find((saved: Lead) => 
            saved.name === lead.name && saved.phone === lead.phone
          );
          return {
            ...lead,
            called: savedLead?.called || 0,
            lastCalled: savedLead?.lastCalled || undefined
          };
        });
        
        setLeadsData(mergedLeads);
      } catch (error) {
        console.error('useLeadsData: Error loading from localStorage:', error);
      }
    }
  }, [initialLeads.length]); // Only run when leads count changes

  const makeCall = (lead: Lead, markAsCalled: boolean = true) => {
    const phoneNumber = getPhoneDigits(lead.phone);
    window.location.href = `tel:${phoneNumber}`;
    
    // Only update the lead data if we should mark it as called
    if (markAsCalled) {
      markLeadAsCalledWrapper(lead);
    }
  };

  const markLeadAsCalledWrapper = (lead: Lead) => {
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
          called: (l.called || 0) + 1,
          lastCalled: lastCalledString
        } : l
      );
      
      setLeadsData(updatedLeads);
      
      // Save to localStorage with consistent key
      try {
        localStorage.setItem('leadsData', JSON.stringify(updatedLeads));
        console.log('useLeadsData: Saved updated leads to localStorage');
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    } catch (error) {
      console.error('Error in markLeadAsCalledWrapper:', error);
    }
  };

  const resetCallCountWrapper = (lead: Lead) => {
    try {
      console.log('useLeadsData: Resetting call count for:', lead.name);
      const updatedLeads = leadsData.map(l => 
        l.name === lead.name && l.phone === lead.phone 
          ? { ...l, called: 0, lastCalled: undefined }
          : l
      );
      setLeadsData(updatedLeads);
      
      // Save to localStorage with consistent key
      try {
        localStorage.setItem('leadsData', JSON.stringify(updatedLeads));
        console.log('useLeadsData: Saved reset lead to localStorage');
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    } catch (error) {
      console.error('Error in resetCallCountWrapper:', error);
    }
  };

  const resetAllCallCountsWrapper = () => {
    try {
      console.log('useLeadsData: Resetting all call counts');
      const updatedLeads = leadsData.map(l => ({
        ...l,
        called: 0,
        lastCalled: undefined
      }));
      setLeadsData(updatedLeads);
      
      // Save to localStorage with consistent key
      try {
        localStorage.setItem('leadsData', JSON.stringify(updatedLeads));
        console.log('useLeadsData: Saved reset all leads to localStorage');
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    } catch (error) {
      console.error('Error in resetAllCallCountsWrapper:', error);
    }
  };

  // Function to mark a lead as called when navigating away
  const markLeadAsCalledOnNavigation = (lead: Lead) => {
    console.log('Marking lead as called on navigation:', lead.name);
    markLeadAsCalledWrapper(lead);
  };

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
