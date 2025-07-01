import { useState, useCallback, useEffect } from 'react';
import { appStorage } from '../utils/storage';

export const useNavigationState = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [navigationHistory, setNavigationHistory] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load initial state from localStorage
  useEffect(() => {
    const loadInitialState = async () => {
      try {
        const currentCSVId = await appStorage.getCurrentCSVId();
        let savedIndex = 0;
        
        if (currentCSVId) {
          // Try to get index from CSV-specific storage first
          savedIndex = await appStorage.getCSVCurrentIndex(currentCSVId);
        } else {
          // Fallback to global storage
          savedIndex = await appStorage.getCurrentLeadIndex();
        }
        
        if (savedIndex !== null && savedIndex >= 0) {
          setCurrentIndex(savedIndex);
        }
      } catch (error) {
        console.error('Error loading initial navigation state:', error);
      }
      setIsLoaded(true);
    };
    
    loadInitialState();
  }, []);

  const updateNavigation = useCallback((index: number) => {
    console.log('useNavigationState: updateNavigation called with index:', index, 'currentIndex:', currentIndex);
    setHistoryIndex(prevHistory => {
      return currentIndex;
    });
    setCurrentIndex(index);
    console.log('useNavigationState: currentIndex updated to:', index);
  }, [currentIndex]);

  const updateNavigationWithHistory = useCallback((index: number, addToHistory: boolean = true) => {
    console.log('useNavigationState: updateNavigationWithHistory called with index:', index, 'addToHistory:', addToHistory, 'currentIndex:', currentIndex);
    if (addToHistory) {
      setNavigationHistory(prevHistory => {
        // Add current index to history if it's different from the last item
        const newHistory = [...prevHistory];
        if (newHistory.length === 0 || newHistory[newHistory.length - 1] !== currentIndex) {
          newHistory.push(currentIndex);
        }
        // Keep only the last 50 items to prevent memory issues
        return newHistory.slice(-50);
      });
    }
    setHistoryIndex(prevHistory => {
      return currentIndex;
    });
    setCurrentIndex(index);
    console.log('useNavigationState: currentIndex updated to:', index);
  }, [currentIndex]);

  const resetNavigation = useCallback((index: number) => {
    setHistoryIndex(-1);
    setCurrentIndex(index);
    setNavigationHistory([]);
  }, []);

  const goToPrevious = useCallback(() => {
    if (historyIndex >= 0) {
      setCurrentIndex(historyIndex);
      setHistoryIndex(-1);
      return true;
    }
    return false;
  }, [historyIndex, currentIndex]);

  const goToPreviousFromHistory = useCallback(() => {
    if (navigationHistory.length > 0) {
      const previousIndex = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory(prevHistory => prevHistory.slice(0, -1));
      setCurrentIndex(previousIndex);
      return true;
    }
    return false;
  }, [navigationHistory]);

  const setCurrentIndexDirectly = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const restoreFromLocalStorage = useCallback(async (totalLeads: number) => {
    try {
      const currentCSVId = await appStorage.getCurrentCSVId();
      let savedIndex = 0;
      
      if (currentCSVId) {
        // Try to get index from CSV-specific storage first
        savedIndex = await appStorage.getCSVCurrentIndex(currentCSVId);
      } else {
        // Fallback to global storage
        savedIndex = await appStorage.getCurrentLeadIndex();
      }
      
      if (savedIndex !== null && savedIndex >= 0 && savedIndex < totalLeads) {
        setCurrentIndex(savedIndex);
      }
    } catch (error) {
      console.error('Error restoring from localStorage:', error);
    }
  }, []);

  const syncFromCloudSession = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  return {
    currentIndex,
    historyIndex,
    navigationHistory,
    updateNavigation,
    updateNavigationWithHistory,
    goToPrevious,
    goToPreviousFromHistory,
    resetNavigation,
    setCurrentIndex: setCurrentIndexDirectly,
    restoreFromLocalStorage,
    syncFromCloudSession,
    isLoaded
  };
}; 