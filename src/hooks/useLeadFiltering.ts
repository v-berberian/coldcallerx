
import { Lead, TimezoneFilter, CallFilter } from '../types/lead';
import { filterLeadsByTimezone } from '../utils/timezoneUtils';

export const useLeadFiltering = (
  leadsData: Lead[], 
  timezoneFilter: TimezoneFilter, 
  callFilter: CallFilter
) => {
  const getBaseLeads = () => {
    console.log('useLeadFiltering: Starting with', leadsData.length, 'leads');
    console.log('useLeadFiltering: Timezone filter:', timezoneFilter, 'Call filter:', callFilter);
    
    // Start with all leads
    let filtered = [...leadsData];
    
    // Apply timezone filter
    if (timezoneFilter === 'EST_CST') {
      filtered = filterLeadsByTimezone(filtered, timezoneFilter);
      console.log('useLeadFiltering: After timezone filter:', filtered.length, 'leads');
    } else {
      console.log('useLeadFiltering: No timezone filter applied (All States)');
    }
    
    // Apply call filter
    if (callFilter === 'UNCALLED') {
      const beforeCallFilter = filtered.length;
      filtered = filtered.filter(lead => !lead.called || lead.called === 0);
      console.log('useLeadFiltering: After call filter:', filtered.length, 'leads (was', beforeCallFilter, ')');
    } else {
      console.log('useLeadFiltering: No call filter applied (All Numbers)');
    }
    
    console.log('useLeadFiltering: Final result:', filtered.length, 'leads');
    
    // Ensure we never return empty if we have original data and no filters should eliminate everything
    if (filtered.length === 0 && leadsData.length > 0) {
      console.warn('useLeadFiltering: Filters resulted in empty list, checking if this is expected...');
      
      // If "All States" and "All Numbers" should show all leads
      if (timezoneFilter === 'ALL' && callFilter === 'ALL') {
        console.log('useLeadFiltering: Returning original leads because filters should show everything');
        return leadsData;
      }
    }
    
    return filtered;
  };

  return { getBaseLeads };
};
