import { useState, useCallback, useEffect } from 'react';
import { appStorage } from '../utils/storage';

export const useNavigationState = (refreshTrigger: number = 0) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [navigationHistory, setNavigationHistory] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isIndexReady, setIsIndexReady] = useState(false);
  const [currentCSVId, setCurrentCSVId] = useState<string | null>(null);

  // Load initial state from localStorage
  useEffect(() => {
    const loadInitialState = async () => {
      try {
        const csvId = await appStorage.getCurrentCSVId();
        setCurrentCSVId(csvId);
        
        let savedIndex = 0;
        
        if (csvId) {
          // Try to get index from CSV-specific storage first
          savedIndex = await appStorage.getCSVCurrentIndex(csvId);
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
      setIsIndexReady(true);
    };
    
    // Add a delay to ensure CSV ID is loaded first
    const timer = setTimeout(loadInitialState, 200);
    return () => clearTimeout(timer);
  }, []);

  // React to CSV ID changes and load the correct index for the new CSV
  useEffect(() => {
    const handleCSVChange = async () => {
      try {
        const csvId = await appStorage.getCurrentCSVId();
        
        // Only update if CSV ID has actually changed
        if (csvId !== currentCSVId) {
          console.log('🔄 CSV SWITCH: ID changed from', currentCSVId, 'to', csvId);
          setCurrentCSVId(csvId);
          
          if (csvId) {
            // Load the saved index for this specific CSV
            const savedIndex = await appStorage.getCSVCurrentIndex(csvId);
            console.log('📊 CSV SWITCH: Loading index', savedIndex, 'for CSV', csvId);
            
            if (savedIndex !== null && savedIndex >= 0) {
              console.log('✅ CSV SWITCH: Setting index to', savedIndex, 'for CSV', csvId);
              setCurrentIndex(savedIndex);
              setIsIndexReady(true);
            } else {
              console.log('🔄 CSV SWITCH: No saved index, resetting to 0 for CSV', csvId);
              setCurrentIndex(0);
              setIsIndexReady(true);
            }
          } else {
            // Fallback to global storage
            const savedIndex = await appStorage.getCurrentLeadIndex();
            setCurrentIndex(savedIndex || 0);
            setIsIndexReady(true);
          }
        }
      } catch (error) {
        console.error('Error handling CSV change:', error);
      }
    };

    // Only run this effect if we're already loaded (to avoid running on initial load)
    if (isLoaded) {
      handleCSVChange();
    }
  }, [isLoaded, currentCSVId]);

  // React to refresh trigger changes (for CSV switching)
  useEffect(() => {
    const handleRefreshTrigger = async () => {
      try {
        console.log('🔄 REFRESH TRIGGER:', refreshTrigger);
        const csvId = await appStorage.getCurrentCSVId();
        
        if (csvId) {
          // Load the saved index for this specific CSV
          const savedIndex = await appStorage.getCSVCurrentIndex(csvId);
          console.log('📊 REFRESH: Loading index', savedIndex, 'for CSV', csvId);
          
          if (savedIndex !== null && savedIndex >= 0) {
            console.log('✅ REFRESH: Setting index to', savedIndex, 'for CSV', csvId);
            setCurrentIndex(savedIndex);
            setIsIndexReady(true);
          } else {
            console.log('🔄 REFRESH: No saved index, resetting to 0 for CSV', csvId);
            setCurrentIndex(0);
            setIsIndexReady(true);
          }
        } else {
          // Fallback to global storage
          const savedIndex = await appStorage.getCurrentLeadIndex();
          setCurrentIndex(savedIndex || 0);
          setIsIndexReady(true);
        }
      } catch (error) {
        console.error('Error handling refresh trigger:', error);
      }
    };

    // Only run this effect if we're already loaded and refresh trigger is > 0
    if (isLoaded && refreshTrigger > 0) {
      setIsIndexReady(false);
      handleRefreshTrigger();
    }
  }, [isLoaded, refreshTrigger]);

  const updateNavigation = useCallback((index: number) => {
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
      const csvId = await appStorage.getCurrentCSVId();
      let savedIndex = 0;
      
      if (csvId) {
        // Try to get index from CSV-specific storage first
        savedIndex = await appStorage.getCSVCurrentIndex(csvId);
      } else {
        // Fallback to global storage
        savedIndex = await appStorage.getCurrentLeadIndex();
      }
      
      if (savedIndex !== null && savedIndex >= 0 && savedIndex < totalLeads) {
        setCurrentIndex(savedIndex);
        setIsIndexReady(true);
      } else {
        setCurrentIndex(0);
        setIsIndexReady(true);
      }
    } catch (error) {
      console.error('Error restoring from localStorage:', error);
      // Reset to 0 on error
      setCurrentIndex(0);
      setIsIndexReady(true);
    }
  }, []);

  const syncFromCloudSession = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsIndexReady(true);
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
    isLoaded,
    isIndexReady
  };
}; 