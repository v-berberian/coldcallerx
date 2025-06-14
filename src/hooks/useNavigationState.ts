
import { useState } from 'react';

export const useNavigationState = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [navigationHistory, setNavigationHistory] = useState<number[]>([0]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [cardKey, setCardKey] = useState(0);

  const updateNavigation = (newIndex: number, addToHistory = true, forceCardUpdate = true) => {
    setCurrentIndex(newIndex);
    
    // Only update card key if this is a user-initiated navigation (not session restoration)
    if (forceCardUpdate) {
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
      setCardKey(prev => prev + 1); // This is needed for card switching animation
      return true;
    }
    return false;
  };

  const resetNavigation = (index = 0, forceCardUpdate = true) => {
    setCurrentIndex(index);
    setNavigationHistory([index]);
    setHistoryIndex(0);
    
    // Only force card update when explicitly requested (like CSV import)
    if (forceCardUpdate) {
      setCardKey(prev => prev + 1);
    }
  };

  const updateCurrentIndexOnly = (index: number) => {
    // This method updates index without changing cardKey - for session restoration
    setCurrentIndex(index);
  };

  return {
    currentIndex,
    cardKey,
    historyIndex,
    navigationHistory,
    updateNavigation,
    goToPrevious,
    resetNavigation,
    updateCurrentIndexOnly,
    setCurrentIndex,
    setCardKey
  };
};
