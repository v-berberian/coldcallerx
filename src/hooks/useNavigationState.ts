import { useState, useCallback, useEffect } from 'react';
import { appStorage } from '../utils/storage';

export const useNavigationState = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load initial state from localStorage
  useEffect(() => {
    const loadInitialState = async () => {
      const savedIndex = await appStorage.getCurrentLeadIndex();
      if (savedIndex !== null && savedIndex >= 0) {
        setCurrentIndex(savedIndex);
      }
      setIsLoaded(true);
    };
    
    loadInitialState();
  }, []);

  const updateNavigation = useCallback((index: number) => {
    setHistoryIndex(prevHistory => {
      return currentIndex;
    });
    setCurrentIndex(index);
  }, []);

  const resetNavigation = useCallback((index: number) => {
    setHistoryIndex(-1);
    setCurrentIndex(index);
  }, []);

  const goToPrevious = useCallback(() => {
    if (historyIndex >= 0) {
      setCurrentIndex(historyIndex);
      setHistoryIndex(-1);
      return true;
    }
    return false;
  }, [historyIndex, currentIndex]);

  const setCurrentIndexDirectly = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const restoreFromLocalStorage = useCallback(async (totalLeads: number) => {
    const savedIndex = await appStorage.getCurrentLeadIndex();
    if (savedIndex !== null && savedIndex >= 0 && savedIndex < totalLeads) {
      setCurrentIndex(savedIndex);
    }
  }, []);

  const syncFromCloudSession = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  return {
    currentIndex,
    historyIndex,
    updateNavigation,
    goToPrevious,
    resetNavigation,
    setCurrentIndex: setCurrentIndexDirectly,
    restoreFromLocalStorage,
    syncFromCloudSession,
    isLoaded
  };
}; 