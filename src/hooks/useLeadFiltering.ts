import { useMemo, useCallback } from 'react';
import { Lead, TimezoneFilter, CallFilter } from '../types/lead';
import { filterLeadsByTimezone } from '../utils/timezoneUtils';

export const useLeadFiltering = (
  leadsData: Lead[], 
  timezoneFilter: TimezoneFilter, 
  callFilter: CallFilter
) => {
  // Memoize filtered leads to avoid recalculation
  const baseLeads = useMemo(() => {
    let filtered = filterLeadsByTimezone(leadsData, timezoneFilter);
    if (callFilter === 'UNCALLED') {
      filtered = filtered.filter(lead => !lead.lastCalled);
    }
    return filtered;
  }, [leadsData, timezoneFilter, callFilter]);

  const getBaseLeads = useCallback(() => {
    return baseLeads;
  }, [baseLeads]);

  return { getBaseLeads };
};
