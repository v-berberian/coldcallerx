import { useMemo, useCallback, useState, useEffect } from 'react';
import { Lead, TimezoneFilter, CallFilter, TemperatureFilter } from '../types/lead';
import { filterLeadsByTimezone, filterLeadsByTemperature } from '../utils/timezoneUtils';

export const useLeadFiltering = (
  leadsData: Lead[], 
  timezoneFilter: TimezoneFilter, 
  callFilter: CallFilter,
  temperatureFilter: TemperatureFilter,
  currentCSVId: string | null
) => {
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);

  // Apply synchronous filters first
  const syncFilteredLeads = useMemo(() => {
    let filtered = filterLeadsByTimezone(leadsData, timezoneFilter);
    if (callFilter === 'UNCALLED') {
      filtered = filtered.filter(lead => !lead.lastCalled);
    }
    return filtered;
  }, [leadsData, timezoneFilter, callFilter]);

  // Apply async temperature filtering
  useEffect(() => {
    const applyTemperatureFilter = async () => {
      if (temperatureFilter === 'ALL' || !currentCSVId) {
        setFilteredLeads(syncFilteredLeads);
        return;
      }

      try {
        const temperatureFiltered = await filterLeadsByTemperature(
          syncFilteredLeads, 
          temperatureFilter, 
          currentCSVId
        );
        setFilteredLeads(temperatureFiltered);
      } catch (error) {
        console.error('Error applying temperature filter:', error);
        setFilteredLeads(syncFilteredLeads); // Fallback to sync filtered leads
      }
    };

    applyTemperatureFilter();
  }, [syncFilteredLeads, temperatureFilter, currentCSVId]);

  const getBaseLeads = useCallback(() => {
    return filteredLeads;
  }, [filteredLeads]);

  return { getBaseLeads };
};
