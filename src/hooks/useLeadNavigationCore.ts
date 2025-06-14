
import { useState } from 'react';
import { Lead } from '../types/lead';

export const useLeadNavigationCore = (initialLeads: Lead[]) => {
  const [leadsData, setLeadsData] = useState<Lead[]>(initialLeads);

  const resetLeadsData = (newLeads: Lead[]) => {
    const formattedLeads = newLeads.map(lead => ({
      ...lead,
      called: lead.called || 0,
      lastCalled: lead.lastCalled || undefined
    }));
    setLeadsData(formattedLeads);
    console.log('Reset leads data with', formattedLeads.length, 'leads');
  };

  return {
    leadsData,
    setLeadsData,
    resetLeadsData
  };
};
