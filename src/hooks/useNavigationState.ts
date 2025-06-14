
import { useState } from 'react';

export const useNavigationState = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [navigationHistory, setNavigationHistory] = useState<number[]>([0]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [cardKey, setCardKey] = useState(0);

  const updateNavigation = (newIndex: number, addToHistory = true) => {
    setCurrentIndex(newIndex);
    setCardKey(prev => prev + 1); // This is needed for card switching animation
    
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

  const resetNavigation = (index = 0) => {
    setCurrentIndex(index);
    setNavigationHistory([index]);
    setHistoryIndex(0);
    setCardKey(prev => prev + 1); // This is needed for proper card reset
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
    setCardKey
  };
};
