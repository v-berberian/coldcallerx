
import { useState } from 'react';

export const useNavigationState = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [navigationHistory, setNavigationHistory] = useState<number[]>([0]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [cardKey, setCardKey] = useState(0);

  const updateNavigation = (newIndex: number, addToHistory = true, silent = false) => {
    setCurrentIndex(newIndex);
    
    // Save to localStorage immediately for instant restoration
    localStorage.setItem('coldcaller-current-index', newIndex.toString());
    
    // Only update cardKey for user-initiated navigation, not for session restoration
    if (!silent) {
      setCardKey(prev => prev + 1);
    }
    
    if (addToHistory) {
      const newHistory = navigationHistory.slice(0, historyIndex + 1);
      newHistory.push(newIndex);
      setNavigationHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const goToPrevious = () => {
    if (historyIndex > 0) {
      const newHistoryIndex = historyIndex - 1;
      const prevIndex = navigationHistory[newHistoryIndex];
      setCurrentIndex(prevIndex);
      setHistoryIndex(newHistoryIndex);
      
      // Save to localStorage immediately
      localStorage.setItem('coldcaller-current-index', prevIndex.toString());
      setCardKey(prev => prev + 1);
      return true;
    }
    return false;
  };

  const resetNavigation = (index = 0, silent = false) => {
    setCurrentIndex(index);
    setNavigationHistory([index]);
    setHistoryIndex(0);
    
    // Save to localStorage immediately
    localStorage.setItem('coldcaller-current-index', index.toString());
    
    // Only update cardKey for user-initiated resets
    if (!silent) {
      setCardKey(prev => prev + 1);
    }
  };

  // Function to restore from localStorage immediately
  const restoreFromLocalStorage = (leadsLength: number) => {
    const savedIndex = localStorage.getItem('coldcaller-current-index');
    if (savedIndex && leadsLength > 0) {
      const index = Math.max(0, Math.min(parseInt(savedIndex, 10), leadsLength - 1));
      if (index !== currentIndex) {
        console.log('Restoring from localStorage:', index);
        setCurrentIndex(index);
        setNavigationHistory([index]);
        setHistoryIndex(0);
        // Don't update cardKey to prevent remount
      }
    }
  };

  return {
    currentIndex,
    cardKey,
    historyIndex,
    navigationHistory,
    updateNavigation,
    goToPrevious,
    resetNavigation,
    setCurrentIndex,
    setCardKey,
    restoreFromLocalStorage
  };
};
