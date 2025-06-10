
import { useState } from 'react';
import { Lead } from '../types/lead';

export const useUncalledFilter = () => {
  const [pendingCallUpdates, setPendingCallUpdates] = useState<Set<string>>(new Set());

  const getLeadKey = (lead: Lead) => `${lead.name}-${lead.phone}`;

  const markLeadAsPendingCall = (lead: Lead) => {
    const key = getLeadKey(lead);
    setPendingCallUpdates(prev => new Set(prev).add(key));
  };

  const commitPendingCalls = (leadsData: Lead[], setLeadsData: (leads: Lead[]) => void) => {
    if (pendingCallUpdates.size === 0) return;

    const now = new Date();
    const dateString = now.toLocaleDateString();
    const timeString = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    const lastCalledString = `${dateString} at ${timeString}`;

    const updatedLeads = leadsData.map(lead => {
      const key = getLeadKey(lead);
      if (pendingCallUpdates.has(key)) {
        return {
          ...lead,
          called: (lead.called || 0) + 1,
          lastCalled: lastCalledString
        };
      }
      return lead;
    });

    setLeadsData(updatedLeads);
    setPendingCallUpdates(new Set());
  };

  const clearPendingCalls = () => {
    setPendingCallUpdates(new Set());
  };

  const isLeadPendingCall = (lead: Lead) => {
    return pendingCallUpdates.has(getLeadKey(lead));
  };

  return {
    markLeadAsPendingCall,
    commitPendingCalls,
    clearPendingCalls,
    isLeadPendingCall
  };
};
