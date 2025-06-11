
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

  // Save to localStorage whenever leadsData changes
  useEffect(() => {
    if (leadsData.length > 0) {
      localStorage.setItem('coldcaller-leads', JSON.stringify(leadsData));
      console.log('Saved leads data to localStorage:', leadsData.length, 'leads');
    }
  }, [leadsData]);

  const makeCall = (lead: Lead, markAsCalled: boolean = true) => {
    const phoneNumber = getPhoneDigits(lead.phone);
    window.location.href = `tel:${phoneNumber}`;
    
    // Only update the lead data if we should mark it as called
    if (markAsCalled) {
      markLeadAsCalled(lead);
    }
  };

  const markLeadAsCalled = (lead: Lead) => {
    const now = new Date();
    const dateString = now.toLocaleDateString();
    const timeString = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    const lastCalledString = `${dateString} at ${timeString}`;

    const updatedLeads = leadsData.map(l => 
      l.name === lead.name && l.phone === lead.phone ? {
        ...l,
        called: (l.called || 0) + 1,
        lastCalled: lastCalledString
      } : l
    );
    
    setLeadsData(updatedLeads);
    console.log('Marked lead as called:', lead.name, 'New count:', (lead.called || 0) + 1);
  };

  const resetCallCount = (lead: Lead) => {
    const updatedLeads = leadsData.map(l => 
      l.name === lead.name && l.phone === lead.phone 
        ? { ...l, called: 0, lastCalled: undefined }
        : l
    );
    setLeadsData(updatedLeads);
    console.log('Reset call count for lead:', lead.name);
  };

  const resetAllCallCounts = () => {
    const updatedLeads = leadsData.map(l => ({
      ...l,
      called: 0,
      lastCalled: undefined
    }));
    setLeadsData(updatedLeads);
    console.log('Reset all call counts');
  };

  // New function to mark a lead as called when navigating away
  const markLeadAsCalledOnNavigation = (lead: Lead) => {
    markLeadAsCalled(lead);
  };

  return {
    leadsData,
    setLeadsData,
    makeCall,
    markLeadAsCalled,
    markLeadAsCalledOnNavigation,
    resetCallCount,
    resetAllCallCounts
  };
};
