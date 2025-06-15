
import { useState, useEffect } from 'react';
import { Lead } from '../types/lead';
import { getPhoneDigits } from '../utils/phoneUtils';

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
          lastCalled: lastCalledString
        } : l
      );
      
      setLeadsData(updatedLeads);
      
      // Save to localStorage with error handling
      try {
        localStorage.setItem('coldcaller-leads', JSON.stringify(updatedLeads));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    } catch (error) {
      console.error('Error in markLeadAsCalledWrapper:', error);
    }
  };

  const resetCallCountWrapper = (lead: Lead) => {
    try {
      const updatedLeads = leadsData.map(l => 
        l.name === lead.name && l.phone === lead.phone 
          ? { ...l, lastCalled: undefined }
          : l
      );
      setLeadsData(updatedLeads);
      
      // Save to localStorage with error handling
      try {
        localStorage.setItem('coldcaller-leads', JSON.stringify(updatedLeads));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    } catch (error) {
      console.error('Error in resetCallCountWrapper:', error);
    }
  };

  const resetAllCallCountsWrapper = () => {
    try {
      const updatedLeads = leadsData.map(l => ({
        ...l,
        lastCalled: undefined
      }));
      setLeadsData(updatedLeads);
      
      // Save to localStorage with error handling
      try {
        localStorage.setItem('coldcaller-leads', JSON.stringify(updatedLeads));
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
