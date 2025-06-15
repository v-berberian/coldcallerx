
import { useState, useEffect } from 'react';
import { Lead } from '../types/lead';
import { getPhoneDigits } from '../utils/phoneUtils';
import { useHybridLeadOperations } from './useHybridLeadOperations';

export const useHybridLeadsData = (initialLeads: Lead[]) => {
  const { updateLeadCallCount, resetCallCount, resetAllCallCounts } = useHybridLeadOperations();
  
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

  const markLeadAsCalledWrapper = async (lead: Lead) => {
    try {
      // Update hybrid storage (both local and server)
      const success = await updateLeadCallCount(lead);
      
      if (success) {
        // Update local component state
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
            lastCalled: lastCalledString
          } : l
        );
        
        setLeadsData(updatedLeads);
      }
    } catch (error) {
      console.error('Error in markLeadAsCalledWrapper:', error);
    }
  };

  const resetCallCountWrapper = async (lead: Lead) => {
    try {
      const success = await resetCallCount(lead);
      
      if (success) {
        const updatedLeads = leadsData.map(l => 
          l.name === lead.name && l.phone === lead.phone 
            ? { ...l, lastCalled: undefined }
            : l
        );
        setLeadsData(updatedLeads);
      }
    } catch (error) {
      console.error('Error in resetCallCountWrapper:', error);
    }
  };

  const resetAllCallCountsWrapper = async () => {
    try {
      const success = await resetAllCallCounts();
      
      if (success) {
        const updatedLeads = leadsData.map(l => ({
          ...l,
          lastCalled: undefined
        }));
        setLeadsData(updatedLeads);
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
