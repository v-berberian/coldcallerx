
import { useMemo } from 'react';
import { Lead, TimezoneFilter, CallFilter } from '../types/lead';
import { filterLeadsByTimezone } from '../utils/timezoneUtils';

export const useOptimizedLeadFiltering = (
  leadsData: Lead[], 
  timezoneFilter: TimezoneFilter, 
  callFilter: CallFilter
) => {
  const getBaseLeads = useMemo(() => {
    return () => {
      let filtered = leadsData;
      
      // Apply timezone filter
      if (timezoneFilter !== 'ALL') {
        filtered = filterLeadsByTimezone(filtered, timezoneFilter);
      }
      
      // Apply call filter
      if (callFilter === 'UNCALLED') {
        filtered = filtered.filter(lead => !lead.lastCalled);
      }
      
      return filtered;
    };
  }, [leadsData, timezoneFilter, callFilter]);

  return { getBaseLeads };
};
