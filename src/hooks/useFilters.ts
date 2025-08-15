
import { useState, useEffect } from 'react';
import { TimezoneFilter, CallFilter, TemperatureFilter } from '../types/lead';
import { appStorage } from '../utils/storage';

// Global flag to ensure filter loading only happens once
let filtersLoaded = false;

export const useFilters = () => {
  const [timezoneFilter, setTimezoneFilter] = useState<TimezoneFilter>('ALL');
  const [callFilter, setCallFilter] = useState<CallFilter>('ALL');
  const [temperatureFilter, setTemperatureFilter] = useState<TemperatureFilter>('ALL');
  const [shuffleMode, setShuffleMode] = useState(false);
  const [autoCall, setAutoCall] = useState(false);
  const [isFilterChanging, setIsFilterChanging] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const [isLoadingFromStorage, setIsLoadingFromStorage] = useState(false);
  const [hasFinishedLoading, setHasFinishedLoading] = useState(false);

  // Debug function to check current saved values
  const debugSavedFilters = async () => {
    try {
      const savedTimezoneFilter = await appStorage.getTimezoneFilter();
      const savedCallFilter = await appStorage.getCallFilter();
      const savedTemperatureFilter = await appStorage.getTemperatureFilter();
      const savedShuffleMode = await appStorage.getShuffleMode();
      const savedAutoCall = await appStorage.getAutoCall();
      
      console.log('🔍 DEBUG - Current saved filter values:', {
        timezoneFilter: savedTimezoneFilter,
        callFilter: savedCallFilter,
        temperatureFilter: savedTemperatureFilter,
        shuffleMode: savedShuffleMode,
        autoCall: savedAutoCall
      });
    } catch (error) {
      console.error('Error debugging saved filters:', error);
    }
  };

  // Load filter states from storage on initialization - only once globally
  useEffect(() => {
    const loadFilterStates = async () => {
      // Only load if not already loaded globally
      if (filtersLoaded) {
        console.log('Filters already loaded globally, skipping...');
        setIsLoaded(true);
        setHasInitialized(true);
        setHasFinishedLoading(true);
        return;
      }

      try {
        console.log('Loading filter states from storage...');
        setIsLoadingFromStorage(true); // Prevent saves during loading
        
        // Debug current saved values
        await debugSavedFilters();
        
        const savedTimezoneFilter = await appStorage.getTimezoneFilter();
        const savedCallFilter = await appStorage.getCallFilter();
        const savedTemperatureFilter = await appStorage.getTemperatureFilter();
        const savedShuffleMode = await appStorage.getShuffleMode();
        const savedAutoCall = await appStorage.getAutoCall();

        console.log('Raw restored filters:', {
          timezoneFilter: savedTimezoneFilter,
          callFilter: savedCallFilter,
          temperatureFilter: savedTemperatureFilter,
          shuffleMode: savedShuffleMode,
          autoCall: savedAutoCall
        });

        // Validate and set timezone filter
        if (savedTimezoneFilter && (savedTimezoneFilter === 'ALL' || savedTimezoneFilter === 'EST_CST')) {
          setTimezoneFilter(savedTimezoneFilter as TimezoneFilter);
          console.log('Set timezone filter to:', savedTimezoneFilter);
        } else {
          console.log('Invalid timezone filter, keeping default:', savedTimezoneFilter);
        }

        // Validate and set call filter
        if (savedCallFilter && (savedCallFilter === 'ALL' || savedCallFilter === 'UNCALLED')) {
          setCallFilter(savedCallFilter as CallFilter);
          console.log('Set call filter to:', savedCallFilter);
        } else {
          console.log('Invalid call filter, keeping default:', savedCallFilter);
        }

        // Validate and set temperature filter
        if (savedTemperatureFilter && ['ALL', 'COLD', 'WARM', 'HOT'].includes(savedTemperatureFilter)) {
          setTemperatureFilter(savedTemperatureFilter as TemperatureFilter);
          console.log('Set temperature filter to:', savedTemperatureFilter);
        } else {
          console.log('Invalid temperature filter, keeping default:', savedTemperatureFilter);
        }

        // Validate and set shuffle mode
        if (typeof savedShuffleMode === 'boolean') {
          setShuffleMode(savedShuffleMode);
          console.log('Set shuffle mode to:', savedShuffleMode);
        } else {
          console.log('Invalid shuffle mode, keeping default:', savedShuffleMode);
        }

        // Validate and set auto call
        if (typeof savedAutoCall === 'boolean') {
          setAutoCall(savedAutoCall);
          console.log('Set auto call to:', savedAutoCall);
        } else {
          console.log('Invalid auto call, keeping default:', savedAutoCall);
        }

        setIsLoaded(true);
        filtersLoaded = true; // Mark as loaded globally
        
        // Add a delay before allowing saves to prevent default value saves
        setTimeout(() => {
          setHasInitialized(true);
          setIsLoadingFromStorage(false); // Allow saves after loading is complete
          setHasFinishedLoading(true); // Mark that loading is completely finished
          console.log('Filter initialization complete - saves now enabled');
        }, 1000); // 1 second delay
      } catch (error) {
        console.error('Error loading filter states:', error);
        setIsLoaded(true);
        filtersLoaded = true; // Mark as loaded even on error
        setTimeout(() => {
          setHasInitialized(true);
          setIsLoadingFromStorage(false);
          setHasFinishedLoading(true);
          console.log('Filter initialization complete (error case) - saves now enabled');
        }, 1000);
      }
    };

    // Add a small delay to ensure storage is ready
    const timer = setTimeout(loadFilterStates, 100);
    return () => clearTimeout(timer);
  }, []);

  // Save filter states when they change - only after initialization, user interaction, and loading is complete
  useEffect(() => {
    if (isLoaded && hasInitialized && userHasInteracted && !isLoadingFromStorage && hasFinishedLoading) {
      console.log('💾 SAVING timezone filter:', timezoneFilter);
      appStorage.saveTimezoneFilter(timezoneFilter);
    }
  }, [timezoneFilter, isLoaded, hasInitialized, userHasInteracted, isLoadingFromStorage, hasFinishedLoading]);

  useEffect(() => {
    if (isLoaded && hasInitialized && userHasInteracted && !isLoadingFromStorage && hasFinishedLoading) {
      console.log('💾 SAVING call filter:', callFilter);
      appStorage.saveCallFilter(callFilter);
    }
  }, [callFilter, isLoaded, hasInitialized, userHasInteracted, isLoadingFromStorage, hasFinishedLoading]);

  useEffect(() => {
    if (isLoaded && hasInitialized && userHasInteracted && !isLoadingFromStorage && hasFinishedLoading) {
      console.log('💾 SAVING temperature filter:', temperatureFilter);
      appStorage.saveTemperatureFilter(temperatureFilter);
    }
  }, [temperatureFilter, isLoaded, hasInitialized, userHasInteracted, isLoadingFromStorage, hasFinishedLoading]);

  useEffect(() => {
    if (isLoaded && hasInitialized && userHasInteracted && !isLoadingFromStorage && hasFinishedLoading) {
      console.log('💾 SAVING shuffle mode:', shuffleMode);
      appStorage.saveShuffleMode(shuffleMode);
    }
  }, [shuffleMode, isLoaded, hasInitialized, userHasInteracted, isLoadingFromStorage, hasFinishedLoading]);

  useEffect(() => {
    if (isLoaded && hasInitialized && userHasInteracted && !isLoadingFromStorage && hasFinishedLoading) {
      console.log('💾 SAVING auto call:', autoCall);
      appStorage.saveAutoCall(autoCall);
    }
  }, [autoCall, isLoaded, hasInitialized, userHasInteracted, isLoadingFromStorage, hasFinishedLoading]);

  const toggleTimezoneFilter = () => {
    console.log('🔄 Toggle timezone filter clicked - current:', timezoneFilter);
    setUserHasInteracted(true);
    setTimezoneFilter(prev => prev === 'ALL' ? 'EST_CST' : 'ALL');
  };

  const toggleCallFilter = () => {
    console.log('🔄 Toggle call filter clicked - current:', callFilter);
    setUserHasInteracted(true);
    setCallFilter(prev => prev === 'ALL' ? 'UNCALLED' : 'ALL');
  };

  const toggleShuffle = () => {
    console.log('🔄 Toggle shuffle clicked - current:', shuffleMode);
    setUserHasInteracted(true);
    setShuffleMode(prev => !prev);
  };

  const toggleAutoCall = () => {
    console.log('🔄 Toggle auto call clicked - current:', autoCall);
    setUserHasInteracted(true);
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
    isLoaded,
    toggleTimezoneFilter,
    toggleCallFilter,
    toggleShuffle,
    toggleAutoCall,
    setFilterChanging,
    debugSavedFilters // Expose debug function
  };
};
