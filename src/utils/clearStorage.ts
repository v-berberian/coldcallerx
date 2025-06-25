import { Preferences } from '@capacitor/preferences';

export const clearColdCallerStorage = async () => {
  try {
    // Clear Capacitor Preferences
    const keys = await Preferences.keys();
    const coldcallerKeys = keys.keys.filter(key => 
      key.startsWith('coldcaller') || 
      key.startsWith('CapacitorStorage')
    );
    
    for (const key of coldcallerKeys) {
      await Preferences.remove({ key });
    }
    
    // Clear localStorage
    const localStorageKeys = Object.keys(localStorage);
    const coldcallerLocalKeys = localStorageKeys.filter(key => 
      key.startsWith('coldcaller') || 
      key.startsWith('CapacitorStorage')
    );
    
    for (const key of coldcallerLocalKeys) {
      localStorage.removeItem(key);
    }
    
    // Clear sessionStorage
    const sessionStorageKeys = Object.keys(sessionStorage);
    const coldcallerSessionKeys = sessionStorageKeys.filter(key => 
      key.startsWith('coldcaller') || 
      key.startsWith('CapacitorStorage')
    );
    
    for (const key of coldcallerSessionKeys) {
      sessionStorage.removeItem(key);
    }
    
    // Clear IndexedDB databases
    const dbNames = ['coldcaller-db', 'CapacitorStorage'];
    for (const dbName of dbNames) {
      try {
        const db = indexedDB.deleteDatabase(dbName);
        db.onsuccess = () => {
          // Database deleted successfully
        };
        db.onerror = () => {
          // Database deletion failed
        };
      } catch (error) {
        // Database doesn't exist or can't be deleted
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error clearing storage:', error);
    return false;
  }
};

export const clearAllStorage = async () => {
  // Alias for clearColdCallerStorage for backward compatibility
  return clearColdCallerStorage();
};

export const quickClearColdCallerStorage = () => {
  try {
    // Clear all localStorage
    localStorage.clear();
    
    // Clear all sessionStorage
    sessionStorage.clear();
    
    return true;
  } catch (error) {
    console.error('Error in quick clear:', error);
    return false;
  }
};

// Make functions available globally for debugging
if (typeof window !== 'undefined') {
  (window as unknown as { clearColdCallerStorage: typeof clearColdCallerStorage; quickClearColdCallerStorage: typeof quickClearColdCallerStorage; clearAllStorage: typeof clearAllStorage }).clearColdCallerStorage = clearColdCallerStorage;
  (window as unknown as { clearColdCallerStorage: typeof clearColdCallerStorage; quickClearColdCallerStorage: typeof quickClearColdCallerStorage; clearAllStorage: typeof clearAllStorage }).quickClearColdCallerStorage = quickClearColdCallerStorage;
  (window as unknown as { clearColdCallerStorage: typeof clearColdCallerStorage; quickClearColdCallerStorage: typeof quickClearColdCallerStorage; clearAllStorage: typeof clearAllStorage }).clearAllStorage = clearAllStorage;
} 