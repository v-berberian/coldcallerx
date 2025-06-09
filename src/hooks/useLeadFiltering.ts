
import { Lead, TimezoneFilter, CallFilter } from '../types/lead';
import { filterLeadsByTimezone } from '../utils/timezoneUtils';

export const useLeadFiltering = (
  leadsData: Lead[], 
  timezoneFilter: TimezoneFilter, 
  callFilter: CallFilter
) => {
  const getBaseLeads = () => {
    let filtered = filterLeadsByTimezone(leadsData, timezoneFilter);
    if (callFilter === 'UNCALLED') {
      filtered = filtered.filter(lead => !lead.called || lead.called === 0);
    }
    return filtered;
  };

  return { getBaseLeads };
};
