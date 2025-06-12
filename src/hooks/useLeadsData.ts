
import { useState, useEffect } from 'react';
import { Lead } from '../types/lead';
import { getPhoneDigits } from '../utils/phoneUtils';
import { useCloudLeadsData } from './useCloudLeadsData';

export const useLeadsData = (initialLeads: Lead[]) => {
  const { markLeadAsCalled, resetCallCount, resetAllCallCounts } = useCloudLeadsData();
  const [leadsData, setLeadsData] = useState<Lead[]>(
    initialLeads.map(lead => ({
      ...lead,
      called: lead.called || 0,
      lastCalled: lead.lastCalled || undefined
    }))
  );

  // Update local state when initialLeads change
  useEffect(() => {
    setLeadsData(initialLeads.map(lead => ({
      ...lead,
      called: lead.called || 0,
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

  const markLeadAsCalledWrapper = async (lead: Lead) => {
    // Update cloud data
    await markLeadAsCalled(lead);
    
    // Update local state for immediate UI feedback
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
  };

  const resetCallCountWrapper = async (lead: Lead) => {
    await resetCallCount(lead);
    
    // Update local state
    const updatedLeads = leadsData.map(l => 
      l.name === lead.name && l.phone === lead.phone 
        ? { ...l, called: 0, lastCalled: undefined }
        : l
    );
    setLeadsData(updatedLeads);
  };

  const resetAllCallCountsWrapper = async () => {
    await resetAllCallCounts();
    
    // Update local state
    const updatedLeads = leadsData.map(l => ({
      ...l,
      called: 0,
      lastCalled: undefined
    }));
    setLeadsData(updatedLeads);
  };

  // Function to mark a lead as called when navigating away
  const markLeadAsCalledOnNavigation = (lead: Lead) => {
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
