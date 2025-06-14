
import { Lead } from '../types/lead';
import { useFilters } from './useFilters';
import { useCallDelay } from './useCallDelay';
import { useLeadFiltering } from './useLeadFiltering';

interface UseCallingScreenFiltersProps {
  leadsData: Lead[];
}

export const useCallingScreenFilters = ({ leadsData }: UseCallingScreenFiltersProps) => {
  const {
    timezoneFilter,
    callFilter,
    shuffleMode,
    autoCall,
    isFilterChanging,
    toggleTimezoneFilter,
    toggleCallFilter,
    toggleShuffle,
    toggleAutoCall,
    setFilterChanging
  } = useFilters();

  const { callDelay, toggleCallDelay, resetCallDelay, getDelayDisplayType } = useCallDelay();

  const { getBaseLeads } = useLeadFiltering(leadsData, timezoneFilter, callFilter);

  return {
    timezoneFilter,
    callFilter,
    shuffleMode,
    autoCall,
    callDelay,
    isFilterChanging,
    getBaseLeads,
    getDelayDisplayType,
    toggleTimezoneFilter,
    toggleCallFilter,
    toggleShuffle,
    toggleAutoCall,
    toggleCallDelay,
    resetCallDelay,
    setFilterChanging
  };
};
