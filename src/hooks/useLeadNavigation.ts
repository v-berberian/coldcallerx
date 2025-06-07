
import { useState } from 'react';

export const useLeadNavigation = (totalLeads: number) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [navigationHistory, setNavigationHistory] = useState<number[]>([0]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [shuffleMode, setShuffleMode] = useState(false);

  const navigateToIndex = (index: number) => {
    setCurrentIndex(index);
    const newHistory = navigationHistory.slice(0, historyIndex + 1);
    newHistory.push(index);
    setNavigationHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleNext = () => {
    let nextIndex;
    if (shuffleMode) {
      do {
        nextIndex = Math.floor(Math.random() * totalLeads);
      } while (nextIndex === currentIndex && totalLeads > 1);
    } else {
      nextIndex = (currentIndex + 1) % totalLeads;
    }
    navigateToIndex(nextIndex);
    return nextIndex;
  };

  const handlePrevious = () => {
    if (historyIndex > 0) {
      const newHistoryIndex = historyIndex - 1;
      const prevIndex = navigationHistory[newHistoryIndex];
      setCurrentIndex(prevIndex);
      setHistoryIndex(newHistoryIndex);
    }
  };

  const resetNavigation = () => {
    setCurrentIndex(0);
    setNavigationHistory([0]);
    setHistoryIndex(0);
  };

  const toggleShuffle = () => {
    setShuffleMode(!shuffleMode);
  };

  return {
    currentIndex,
    setCurrentIndex,
    handleNext,
    handlePrevious,
    resetNavigation,
    navigateToIndex,
    shuffleMode,
    toggleShuffle,
    canGoPrevious: historyIndex > 0
  };
};
