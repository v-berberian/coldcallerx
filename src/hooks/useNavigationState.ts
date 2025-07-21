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
        console.log('Loading initial navigation state...');
        const currentCSVId = await appStorage.getCurrentCSVId();
        let savedIndex = 0;
        
        if (currentCSVId) {
          // Try to get index from CSV-specific storage first
          savedIndex = await appStorage.getCSVCurrentIndex(currentCSVId);
          console.log('Initial load - CSV-specific index:', savedIndex, 'for CSV ID:', currentCSVId);
        } else {
          // Fallback to global storage
          savedIndex = await appStorage.getCurrentLeadIndex();
          console.log('Initial load - global index:', savedIndex);
        }
        
        if (savedIndex !== null && savedIndex >= 0) {
          console.log('Setting initial current index to:', savedIndex);
          setCurrentIndex(savedIndex);
        }
      } catch (error) {
        console.error('Error loading initial navigation state:', error);
      }
      setIsLoaded(true);
    };
    
    // Add a delay to ensure CSV ID is loaded first
    const timer = setTimeout(loadInitialState, 200);
    return () => clearTimeout(timer);
  }, []);

  const updateNavigation = useCallback((index: number) => {
    console.log('Navigation: updating from', currentIndex, 'to', index);
    setHistoryIndex(prevHistory => {
      return currentIndex;
    });
    setCurrentIndex(index);
  }, [currentIndex]);

  const updateNavigationWithHistory = useCallback((index: number, addToHistory: boolean = true) => {
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
      console.log('Starting index restoration with', totalLeads, 'total leads');
      const currentCSVId = await appStorage.getCurrentCSVId();
      let savedIndex = 0;
      
      if (currentCSVId) {
        // Try to get index from CSV-specific storage first
        savedIndex = await appStorage.getCSVCurrentIndex(currentCSVId);
        console.log('Restoring CSV-specific index:', savedIndex, 'for CSV ID:', currentCSVId);
      } else {
        // Fallback to global storage
        savedIndex = await appStorage.getCurrentLeadIndex();
        console.log('Restoring global index:', savedIndex);
      }
      
      if (savedIndex !== null && savedIndex >= 0 && savedIndex < totalLeads) {
        console.log('Setting current index to:', savedIndex, 'from saved value (valid range)');
        setCurrentIndex(savedIndex);
      } else {
        console.log('Saved index invalid or out of bounds:', savedIndex, 'total leads:', totalLeads, '- resetting to 0');
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Error restoring from localStorage:', error);
      // Reset to 0 on error
      setCurrentIndex(0);
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