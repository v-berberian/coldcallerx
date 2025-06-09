import { useState } from 'react';
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

  const makeCall = (lead: Lead, markAsCalled: boolean = true) => {
    const phoneNumber = getPhoneDigits(lead.phone);
    window.location.href = `tel:${phoneNumber}`;
    
    // Only update the lead data if we should mark it as called
    if (markAsCalled) {
      markLeadAsCalled(lead);
    }
  };

  const markLeadAsCalled = (lead: Lead) => {
    const updatedLeads = leadsData.map(l => 
      l.name === lead.name && l.phone === lead.phone ? {
        ...l,
        called: (l.called || 0) + 1,
        lastCalled: new Date().toLocaleDateString()
      } : l
    );
    setLeadsData(updatedLeads);
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

  return {
    leadsData,
    makeCall,
    markLeadAsCalled,
    resetCallCount,
    resetAllCallCounts
  };
};
