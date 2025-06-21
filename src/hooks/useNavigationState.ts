import { useState } from 'react';
import { appStorage } from '../utils/storage';

export const useNavigationState = () => {
  // Initialize from localStorage immediately
  const getInitialIndex = () => {
    return appStorage.getCurrentLeadIndex();
  };

  const [currentIndex, setCurrentIndex] = useState(getInitialIndex());
  const [navigationHistory, setNavigationHistory] = useState<number[]>([getInitialIndex()]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const updateNavigation = (newIndex: number, addToHistory = true, silent = false) => {
    setCurrentIndex(newIndex);
    
    // Always save to localStorage immediately for instant restoration
    appStorage.saveCurrentLeadIndex(newIndex);
    console.log('Saved to localStorage:', newIndex);
    
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
      appStorage.saveCurrentLeadIndex(prevIndex);
      console.log('Saved to localStorage (previous):', prevIndex);
      return true;
    }
    return false;
  };

  const resetNavigation = (index = 0, silent = false) => {
    setCurrentIndex(index);
    setNavigationHistory([index]);
    setHistoryIndex(0);
    
    // Save to localStorage immediately
    appStorage.saveCurrentLeadIndex(index);
    console.log('Saved to localStorage (reset):', index);
  };

  // Function to restore from localStorage when leads are ready
  const restoreFromLocalStorage = (leadsLength: number) => {
    const savedIndex = appStorage.getCurrentLeadIndex();
    if (leadsLength > 0) {
      const index = Math.max(0, Math.min(savedIndex, leadsLength - 1));
      if (index !== currentIndex) {
        console.log('Restoring from localStorage:', index);
        setCurrentIndex(index);
        setNavigationHistory([index]);
        setHistoryIndex(0);
      }
    }
  };

  // Function to sync from cloud session (secondary, silent)
  const syncFromCloudSession = (sessionIndex: number, leadsLength: number) => {
    if (leadsLength > 0) {
      const validIndex = Math.max(0, Math.min(sessionIndex, leadsLength - 1));
      
      // Only update if different from current localStorage value
      const currentLocalIndex = appStorage.getCurrentLeadIndex();
      
      if (validIndex !== currentLocalIndex) {
        console.log('Syncing from cloud session (silent):', validIndex);
        setCurrentIndex(validIndex);
        setNavigationHistory([validIndex]);
        setHistoryIndex(0);
        appStorage.saveCurrentLeadIndex(validIndex);
      }
    }
  };

  return {
    currentIndex,
    historyIndex,
    navigationHistory,
    updateNavigation,
    goToPrevious,
    resetNavigation,
    setCurrentIndex,
    restoreFromLocalStorage,
    syncFromCloudSession
  };
};
