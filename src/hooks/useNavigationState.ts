
import { useState } from 'react';

export const useNavigationState = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [navigationHistory, setNavigationHistory] = useState<number[]>([0]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [cardKey, setCardKey] = useState(0);

  const updateNavigation = (newIndex: number, addToHistory = true, forceCardUpdate = false) => {
    console.log('updateNavigation: newIndex =', newIndex, 'forceCardUpdate =', forceCardUpdate);
    setCurrentIndex(newIndex);
    
    // Only update card key for user-initiated navigation (like manual next/previous)
    // NOT for session restoration or real-time updates
    if (forceCardUpdate) {
      console.log('updateNavigation: Forcing card update for user navigation');
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
      // Force card update for user navigation
      setCardKey(prev => prev + 1);
      return true;
    }
    return false;
  };

  const resetNavigation = (index = 0, forceCardUpdate = false) => {
    console.log('resetNavigation: index =', index, 'forceCardUpdate =', forceCardUpdate);
    setCurrentIndex(index);
    setNavigationHistory([index]);
    setHistoryIndex(0);
    
    // Only force card update when explicitly requested (like CSV import)
    if (forceCardUpdate) {
      console.log('resetNavigation: Forcing card update');
      setCardKey(prev => prev + 1);
    }
  };

  const updateCurrentIndexOnly = (index: number) => {
    // This method updates index without changing cardKey - for session restoration and real-time updates
    console.log('updateCurrentIndexOnly: Preserving card state for index:', index);
    setCurrentIndex(index);
    // Absolutely no cardKey changes to preserve card state
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
