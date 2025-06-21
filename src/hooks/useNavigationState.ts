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
        console.log('useNavigationState: Loading saved index:', savedIndex);
        setCurrentIndex(savedIndex);
      }
      setIsLoaded(true);
    };
    
    loadInitialState();
  }, []);

  const updateNavigation = useCallback((index: number) => {
    console.log('useNavigationState: updateNavigation called with index:', index);
    setHistoryIndex(prevHistory => {
      console.log('useNavigationState: Setting history index to current index');
      return currentIndex;
    });
    setCurrentIndex(index);
    console.log('useNavigationState: State will be updated to index:', index);
  }, []);

  // Debug effect to track currentIndex changes
  useEffect(() => {
    console.log('useNavigationState: currentIndex changed to:', currentIndex);
  }, [currentIndex]);

  const resetNavigation = useCallback((index: number) => {
    console.log('useNavigationState: resetNavigation called with index:', index);
    setHistoryIndex(-1);
    setCurrentIndex(index);
  }, []);

  const goToPrevious = useCallback(() => {
    if (historyIndex >= 0) {
      console.log('useNavigationState: goToPrevious from', currentIndex, 'to', historyIndex);
      setCurrentIndex(historyIndex);
      setHistoryIndex(-1);
      return true;
    }
    return false;
  }, [historyIndex, currentIndex]);

  const setCurrentIndexDirectly = useCallback((index: number) => {
    console.log('useNavigationState: setCurrentIndexDirectly called with index:', index);
    setCurrentIndex(index);
  }, []);

  const restoreFromLocalStorage = useCallback(async (totalLeads: number) => {
    const savedIndex = await appStorage.getCurrentLeadIndex();
    if (savedIndex !== null && savedIndex >= 0 && savedIndex < totalLeads) {
      console.log('useNavigationState: restoreFromLocalStorage setting index to:', savedIndex);
      setCurrentIndex(savedIndex);
    }
  }, []);

  const syncFromCloudSession = useCallback((index: number) => {
    console.log('useNavigationState: syncFromCloudSession setting index to:', index);
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