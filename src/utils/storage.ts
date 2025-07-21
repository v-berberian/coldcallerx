import { Lead } from '../types/lead';
import { Preferences } from '@capacitor/preferences';

// Storage keys
const STORAGE_KEYS = {
  CURRENT_LEAD_INDEX: 'coldcaller-current-lead-index',
  LEADS_DATA: 'coldcaller-leads-data',
  SEARCH_QUERY: 'coldcaller-search-query',
  TIMEZONE_FILTER: 'coldcaller-timezone-filter',
  CALL_FILTER: 'coldcaller-call-filter',
  SHUFFLE_MODE: 'coldcaller-shuffle-mode',
  AUTO_CALL: 'coldcaller-auto-call',
  CALL_DELAY: 'coldcaller-call-delay',
  APP_SETTINGS: 'coldcaller-app-settings',
  CSV_FILES: 'coldcaller-csv-files',
  CURRENT_CSV_ID: 'coldcaller-current-csv-id'
} as const;

// Helper function to create CSV-specific storage keys
const getCSVStorageKey = (csvId: string, key: string) => `coldcaller-csv-${csvId}-${key}`;

// App settings interface
export interface AppSettings {
  theme?: 'light' | 'dark' | 'system';
  autoCallDelay?: number;
  timezone?: string;
}

// Storage utility class
export class AppStorage {
  private static instance: AppStorage;
  private useCapacitorStorage: boolean = true;
  
  private constructor() {
    // Check if we're in a Capacitor environment
    this.useCapacitorStorage = typeof window !== 'undefined' && 'Capacitor' in window;
  }
  
  static getInstance(): AppStorage {
    if (!AppStorage.instance) {
      AppStorage.instance = new AppStorage();
    }
    return AppStorage.instance;
  }

  // Generic storage methods with Capacitor fallback
  private async setItem(key: string, value: unknown): Promise<void> {
    try {
      const stringValue = JSON.stringify(value);
      
      // Check data size and compress if needed
      const dataSize = new Blob([stringValue]).size;
      const maxSize = 1024 * 1024; // 1MB limit
      
      if (dataSize > maxSize) {
        console.warn(`Data size (${dataSize} bytes) exceeds limit for key: ${key}. Truncating...`);
        // For large data, store only essential information
        if (key.includes('leads-data')) {
          // For leads data, store only the first 100 leads to stay under limit
          const truncatedValue = Array.isArray(value) ? value.slice(0, 100) : value;
          const truncatedString = JSON.stringify(truncatedValue);
          if (this.useCapacitorStorage) {
            await Preferences.set({ key, value: truncatedString });
          } else {
            localStorage.setItem(key, truncatedString);
          }
          return;
        }
      }
      
      if (this.useCapacitorStorage) {
        await Preferences.set({ key, value: stringValue });
      } else {
        localStorage.setItem(key, stringValue);
      }
    } catch (error) {
      // Fallback to localStorage if Capacitor fails
      if (this.useCapacitorStorage) {
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch (fallbackError) {
          console.error('Failed to save to localStorage:', fallbackError);
        }
      }
    }
  }

  private async getItem<T>(key: string, defaultValue: T): Promise<T> {
    try {
      let item: string | null = null;
      
      if (this.useCapacitorStorage) {
        const result = await Preferences.get({ key });
        item = result.value;
      } else {
        item = localStorage.getItem(key);
      }
      
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      // Fallback to localStorage if Capacitor fails
      if (this.useCapacitorStorage) {
        try {
          const fallbackItem = localStorage.getItem(key);
          return fallbackItem ? JSON.parse(fallbackItem) : defaultValue;
        } catch (fallbackError) {
          console.error('Failed to read from localStorage:', fallbackError);
        }
      }
      return defaultValue;
    }
  }

  private async removeItem(key: string): Promise<void> {
    try {
      if (this.useCapacitorStorage) {
        await Preferences.remove({ key });
      } else {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  }

  // Current lead index
  async saveCurrentLeadIndex(index: number): Promise<void> {
    await this.setItem(STORAGE_KEYS.CURRENT_LEAD_INDEX, index);
  }

  async getCurrentLeadIndex(): Promise<number> {
    return await this.getItem(STORAGE_KEYS.CURRENT_LEAD_INDEX, 0);
  }

  // Leads data with call status
  async saveLeadsData(leads: Lead[]): Promise<void> {
    await this.setItem(STORAGE_KEYS.LEADS_DATA, leads);
  }

  async getLeadsData(): Promise<Lead[]> {
    return await this.getItem(STORAGE_KEYS.LEADS_DATA, []);
  }

  // Search state
  async saveSearchQuery(query: string): Promise<void> {
    await this.setItem(STORAGE_KEYS.SEARCH_QUERY, query);
  }

  async getSearchQuery(): Promise<string> {
    return await this.getItem(STORAGE_KEYS.SEARCH_QUERY, '');
  }

  // Filter states
  async saveTimezoneFilter(filter: string): Promise<void> {
    console.log('Storage: Saving timezone filter:', filter, 'to key:', STORAGE_KEYS.TIMEZONE_FILTER);
    await this.setItem(STORAGE_KEYS.TIMEZONE_FILTER, filter);
  }

  async getTimezoneFilter(): Promise<string> {
    const result = await this.getItem(STORAGE_KEYS.TIMEZONE_FILTER, 'ALL');
    console.log('Storage: Retrieved timezone filter:', result, 'from key:', STORAGE_KEYS.TIMEZONE_FILTER);
    return result;
  }

  async saveCallFilter(filter: string): Promise<void> {
    console.log('Storage: Saving call filter:', filter, 'to key:', STORAGE_KEYS.CALL_FILTER);
    await this.setItem(STORAGE_KEYS.CALL_FILTER, filter);
  }

  async getCallFilter(): Promise<string> {
    const result = await this.getItem(STORAGE_KEYS.CALL_FILTER, 'ALL');
    console.log('Storage: Retrieved call filter:', result, 'from key:', STORAGE_KEYS.CALL_FILTER);
    return result;
  }

  // App modes
  async saveShuffleMode(enabled: boolean): Promise<void> {
    console.log('Storage: Saving shuffle mode:', enabled, 'to key:', STORAGE_KEYS.SHUFFLE_MODE);
    await this.setItem(STORAGE_KEYS.SHUFFLE_MODE, enabled);
  }

  async getShuffleMode(): Promise<boolean> {
    const result = await this.getItem(STORAGE_KEYS.SHUFFLE_MODE, false);
    console.log('Storage: Retrieved shuffle mode:', result, 'from key:', STORAGE_KEYS.SHUFFLE_MODE);
    return result;
  }

  async saveAutoCall(enabled: boolean): Promise<void> {
    console.log('Storage: Saving auto call:', enabled, 'to key:', STORAGE_KEYS.AUTO_CALL);
    await this.setItem(STORAGE_KEYS.AUTO_CALL, enabled);
  }

  async getAutoCall(): Promise<boolean> {
    const result = await this.getItem(STORAGE_KEYS.AUTO_CALL, false);
    console.log('Storage: Retrieved auto call:', result, 'from key:', STORAGE_KEYS.AUTO_CALL);
    return result;
  }

  async saveCallDelay(delay: number): Promise<void> {
    await this.setItem(STORAGE_KEYS.CALL_DELAY, delay);
  }

  async getCallDelay(): Promise<number> {
    return await this.getItem(STORAGE_KEYS.CALL_DELAY, 0);
  }

  // App settings
  async saveAppSettings(settings: AppSettings): Promise<void> {
    await this.setItem(STORAGE_KEYS.APP_SETTINGS, settings);
  }

  async getAppSettings(): Promise<AppSettings> {
    return await this.getItem(STORAGE_KEYS.APP_SETTINGS, {});
  }

  // Clear all app data
  async clearAllData(): Promise<void> {
    for (const key of Object.values(STORAGE_KEYS)) {
      await this.removeItem(key);
    }
  }

  // Export data for backup
  async exportData(): Promise<string> {
    const data = {
      currentLeadIndex: await this.getCurrentLeadIndex(),
      leadsData: await this.getLeadsData(),
      searchQuery: await this.getSearchQuery(),
      timezoneFilter: await this.getTimezoneFilter(),
      callFilter: await this.getCallFilter(),
      shuffleMode: await this.getShuffleMode(),
      autoCall: await this.getAutoCall(),
      callDelay: await this.getCallDelay(),
      appSettings: await this.getAppSettings(),
      exportDate: new Date().toISOString(),
    };
    
    return JSON.stringify(data, null, 2);
  }

  // Import data from backup
  async importData(jsonData: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.currentLeadIndex !== undefined) await this.saveCurrentLeadIndex(data.currentLeadIndex);
      if (data.leadsData) await this.saveLeadsData(data.leadsData);
      if (data.searchQuery !== undefined) await this.saveSearchQuery(data.searchQuery);
      if (data.timezoneFilter !== undefined) await this.saveTimezoneFilter(data.timezoneFilter);
      if (data.callFilter !== undefined) await this.saveCallFilter(data.callFilter);
      if (data.shuffleMode !== undefined) await this.saveShuffleMode(data.shuffleMode);
      if (data.autoCall !== undefined) await this.saveAutoCall(data.autoCall);
      if (data.callDelay !== undefined) await this.saveCallDelay(data.callDelay);
      if (data.appSettings) await this.saveAppSettings(data.appSettings);
      
      return true;
    } catch (error) {
      return false;
    }
  }

  // CSV-specific storage methods
  async saveCSVLeadsData(csvId: string, leads: Lead[]): Promise<void> {
    await this.setItem(getCSVStorageKey(csvId, 'leads'), leads);
  }

  async getCSVLeadsData(csvId: string): Promise<Lead[]> {
    try {
      // First check if this is chunked data
      const metadata = await this.getCSVMetadata(csvId);
      
      if (metadata?.isChunked) {
        const leads: Lead[] = [];
        
        for (let i = 0; i < metadata.chunksCount; i++) {
          const chunkKey = `coldcaller-csv-${csvId}-chunk-${i}`;
          const chunk = await this.getChunkedData(chunkKey, []);
          leads.push(...chunk);
        }
        
        return leads;
      } else {
        // Fallback to single storage method
        return await this.getItem(getCSVStorageKey(csvId, 'leads'), []);
      }
    } catch (error) {
      console.error('Error getting CSV leads data:', error);
      return [];
    }
  }

  async saveCSVCurrentIndex(csvId: string, index: number): Promise<void> {
    console.log('Storage: Saving CSV current index:', index, 'for CSV ID:', csvId);
    await this.setItem(getCSVStorageKey(csvId, 'current-index'), index);
  }

  async getCSVCurrentIndex(csvId: string): Promise<number> {
    const result = await this.getItem(getCSVStorageKey(csvId, 'current-index'), 0);
    console.log('Storage: Retrieved CSV current index:', result, 'for CSV ID:', csvId);
    return result;
  }

  // CSV file management
  async saveCSVFiles(csvFiles: Array<{id: string, name: string, fileName: string, totalLeads: number, isChunked?: boolean}>): Promise<void> {
    await this.setItem(STORAGE_KEYS.CSV_FILES, csvFiles);
  }

  async getCSVFiles(): Promise<Array<{id: string, name: string, fileName: string, totalLeads: number, isChunked?: boolean}>> {
    return await this.getItem(STORAGE_KEYS.CSV_FILES, []);
  }

  async saveCurrentCSVId(csvId: string): Promise<void> {
    await this.setItem(STORAGE_KEYS.CURRENT_CSV_ID, csvId);
  }

  async getCurrentCSVId(): Promise<string | null> {
    return await this.getItem(STORAGE_KEYS.CURRENT_CSV_ID, null);
  }

  // Remove CSV file and its data
  async removeCSVFile(csvId: string): Promise<void> {
    try {
      // Get current CSV files
      const csvFiles = await this.getCSVFiles();
      const updatedFiles = csvFiles.filter(file => file.id !== csvId);
      await this.saveCSVFiles(updatedFiles);
    } catch (error) {
      console.error('Error removing CSV file:', error);
    }
  }

  async removeCSVLeadsData(csvId: string): Promise<void> {
    try {
      // Remove CSV-specific storage keys
      await this.removeItem(getCSVStorageKey(csvId, 'leads'));
      await this.removeItem(getCSVStorageKey(csvId, 'current-index'));
    } catch (error) {
      console.error('Error removing CSV leads data:', error);
    }
  }

  // Comprehensive CSV data removal - removes ALL data associated with a CSV ID
  async removeAllCSVData(csvId: string): Promise<void> {
    try {
      // Remove CSV file metadata
      await this.removeCSVFile(csvId);
      
      // Remove CSV leads data
      await this.removeCSVLeadsData(csvId);
      
      // Remove chunked data
      await this.removeChunkedCSVData(csvId);
      
      // Remove any additional CSV-related keys that might exist
      const additionalKeys = [
        getCSVStorageKey(csvId, 'metadata'),
        getCSVStorageKey(csvId, 'settings'),
        getCSVStorageKey(csvId, 'filters'),
        getCSVStorageKey(csvId, 'search'),
        getCSVStorageKey(csvId, 'state'),
        getCSVStorageKey(csvId, 'progress'),
        getCSVStorageKey(csvId, 'stats'),
        getCSVStorageKey(csvId, 'calls'),
        getCSVStorageKey(csvId, 'history'),
        getCSVStorageKey(csvId, 'backup'),
        getCSVStorageKey(csvId, 'temp'),
        getCSVStorageKey(csvId, 'cache')
      ];
      
      for (const key of additionalKeys) {
        try {
          await this.removeItem(key);
        } catch (error) {
          // Ignore individual key removal errors
        }
      }
      
      // Clean up localStorage fallback
      try {
        const localStorageKeys = Object.keys(localStorage);
        const csvKeys = localStorageKeys.filter(key => key.includes(`coldcaller-csv-${csvId}`));
        csvKeys.forEach(key => localStorage.removeItem(key));
      } catch (error) {
        // Ignore localStorage cleanup errors
      }
      
      // Clean up sessionStorage fallback
      try {
        const sessionStorageKeys = Object.keys(sessionStorage);
        const sessionCsvKeys = sessionStorageKeys.filter(key => key.includes(`coldcaller-csv-${csvId}`));
        sessionCsvKeys.forEach(key => sessionStorage.removeItem(key));
      } catch (error) {
        // Ignore sessionStorage cleanup errors
      }
      
      // Clean up Capacitor Preferences (if available)
      try {
        const { Preferences } = await import('@capacitor/preferences');
        const keys = await Preferences.keys();
        const capacitorCsvKeys = keys.keys.filter(key => key.includes(`coldcaller-csv-${csvId}`));
        for (const key of capacitorCsvKeys) {
          await Preferences.remove({ key });
        }
      } catch (error) {
        // Ignore Capacitor cleanup errors
      }
    } catch (error) {
      console.error('Error in comprehensive CSV data removal:', error);
    }
  }

  // Chunked CSV data management
  async getCSVMetadata(csvId: string): Promise<{ isChunked: boolean; chunksCount: number } | null> {
    try {
      const metadata = await this.getItem(getCSVStorageKey(csvId, 'metadata'), null);
      return metadata;
    } catch (error) {
      console.error('Error getting CSV metadata:', error);
      return null;
    }
  }

  // Public method to save chunked data
  async saveChunkedData(csvId: string, chunkKey: string, data: unknown): Promise<void> {
    await this.setItem(chunkKey, data);
  }

  // Public method to get chunked data
  async getChunkedData<T>(chunkKey: string, defaultValue: T): Promise<T> {
    return await this.getItem(chunkKey, defaultValue);
  }

  // Public method to save CSV metadata
  async saveCSVMetadata(csvId: string, metadata: unknown): Promise<void> {
    await this.setItem(getCSVStorageKey(csvId, 'metadata'), metadata);
  }

  async removeChunkedCSVData(csvId: string): Promise<void> {
    try {
      const metadata = await this.getCSVMetadata(csvId);
      if (metadata?.isChunked && metadata.chunksCount) {
        // Remove all chunk files
        for (let i = 0; i < metadata.chunksCount; i++) {
          const chunkKey = `coldcaller-csv-${csvId}-chunk-${i}`;
          await this.removeItem(chunkKey);
          
          // Also clean up from localStorage and sessionStorage as fallback
          try {
            localStorage.removeItem(chunkKey);
            sessionStorage.removeItem(chunkKey);
          } catch (error) {
            // Ignore fallback cleanup errors
          }
        }
        
        // Remove metadata
        await this.removeItem(getCSVStorageKey(csvId, 'metadata'));
      }
    } catch (error) {
      console.error('Error removing chunked CSV data:', error);
    }
  }
}

// Export singleton instance
export const appStorage = AppStorage.getInstance(); 