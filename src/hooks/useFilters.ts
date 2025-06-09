
import { useState } from 'react';
import { TimezoneFilter, CallFilter } from '../types/lead';

export const useFilters = () => {
  const [timezoneFilter, setTimezoneFilter] = useState<TimezoneFilter>('ALL');
  const [callFilter, setCallFilter] = useState<CallFilter>('ALL');
  const [shuffleMode, setShuffleMode] = useState(false);
  const [autoCall, setAutoCall] = useState(false);
  const [isFilterChanging, setIsFilterChanging] = useState(false);

  const toggleTimezoneFilter = () => {
    setTimezoneFilter(prev => prev === 'ALL' ? 'EST_CST' : 'ALL');
  };

  const toggleCallFilter = () => {
    setCallFilter(prev => prev === 'ALL' ? 'UNCALLED' : 'ALL');
  };

  const toggleShuffle = () => {
    setShuffleMode(prev => !prev);
  };

  const toggleAutoCall = () => {
    setAutoCall(prev => !prev);
  };

  const setFilterChanging = (isChanging: boolean) => {
    setIsFilterChanging(isChanging);
  };

  return {
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
  };
};
