
import { Lead, TimezoneFilter, CallFilter } from '../types/lead';
import { filterLeadsByTimezone } from '../utils/timezoneUtils';

export const useLeadFiltering = (
  leadsData: Lead[], 
  timezoneFilter: TimezoneFilter, 
  callFilter: CallFilter,
  pendingCallLeads: Set<string> = new Set()
) => {
  const getLeadKey = (lead: Lead) => `${lead.name}-${lead.phone}`;

  const getBaseLeads = () => {
    let filtered = filterLeadsByTimezone(leadsData, timezoneFilter);
    
    if (callFilter === 'UNCALLED') {
      filtered = filtered.filter(lead => {
        const hasBeenCalled = lead.called && lead.called > 0;
        const isPendingCall = pendingCallLeads.has(getLeadKey(lead));
        return !hasBeenCalled && !isPendingCall;
      });
    }
    
    return filtered;
  };

  return { getBaseLeads };
};
