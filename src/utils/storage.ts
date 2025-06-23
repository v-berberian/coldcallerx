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
  DAILY_CALL_COUNT: 'coldcaller-daily-call-count',
  LAST_OPENED_DATE: 'coldcaller-last-opened-date',
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
  dailyCallGoal?: number;
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
    await this.setItem(STORAGE_KEYS.TIMEZONE_FILTER, filter);
  }

  async getTimezoneFilter(): Promise<string> {
    return await this.getItem(STORAGE_KEYS.TIMEZONE_FILTER, 'all');
  }

  async saveCallFilter(filter: string): Promise<void> {
    await this.setItem(STORAGE_KEYS.CALL_FILTER, filter);
  }

  async getCallFilter(): Promise<string> {
    return await this.getItem(STORAGE_KEYS.CALL_FILTER, 'all');
  }

  // App modes
  async saveShuffleMode(enabled: boolean): Promise<void> {
    await this.setItem(STORAGE_KEYS.SHUFFLE_MODE, enabled);
  }

  async getShuffleMode(): Promise<boolean> {
    return await this.getItem(STORAGE_KEYS.SHUFFLE_MODE, false);
  }

  async saveAutoCall(enabled: boolean): Promise<void> {
    await this.setItem(STORAGE_KEYS.AUTO_CALL, enabled);
  }

  async getAutoCall(): Promise<boolean> {
    return await this.getItem(STORAGE_KEYS.AUTO_CALL, false);
  }

  async saveCallDelay(delay: number): Promise<void> {
    await this.setItem(STORAGE_KEYS.CALL_DELAY, delay);
  }

  async getCallDelay(): Promise<number> {
    return await this.getItem(STORAGE_KEYS.CALL_DELAY, 0);
  }

  // Daily call tracking
  async saveDailyCallCount(count: number): Promise<void> {
    await this.setItem(STORAGE_KEYS.DAILY_CALL_COUNT, count);
  }

  async getDailyCallCount(): Promise<number> {
    return await this.getItem(STORAGE_KEYS.DAILY_CALL_COUNT, 0);
  }

  async saveLastOpenedDate(date: string): Promise<void> {
    await this.setItem(STORAGE_KEYS.LAST_OPENED_DATE, date);
  }

  async getLastOpenedDate(): Promise<string> {
    return await this.getItem(STORAGE_KEYS.LAST_OPENED_DATE, '');
  }

  // App settings
  async saveAppSettings(settings: AppSettings): Promise<void> {
    await this.setItem(STORAGE_KEYS.APP_SETTINGS, settings);
  }

  async getAppSettings(): Promise<AppSettings> {
    return await this.getItem(STORAGE_KEYS.APP_SETTINGS, {});
  }

  // Check if we need to reset daily count (new day)
  async shouldResetDailyCount(): Promise<boolean> {
    const lastOpened = await this.getLastOpenedDate();
    const today = new Date().toDateString();
    
    if (lastOpened !== today) {
      await this.saveLastOpenedDate(today);
      return true;
    }
    
    return false;
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
      dailyCallCount: await this.getDailyCallCount(),
      lastOpenedDate: await this.getLastOpenedDate(),
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
      if (data.dailyCallCount !== undefined) await this.saveDailyCallCount(data.dailyCallCount);
      if (data.lastOpenedDate) await this.saveLastOpenedDate(data.lastOpenedDate);
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
    return await this.getItem(getCSVStorageKey(csvId, 'leads'), []);
  }

  async saveCSVCurrentIndex(csvId: string, index: number): Promise<void> {
    await this.setItem(getCSVStorageKey(csvId, 'current-index'), index);
  }

  async getCSVCurrentIndex(csvId: string): Promise<number> {
    return await this.getItem(getCSVStorageKey(csvId, 'current-index'), 0);
  }

  // CSV file management
  async saveCSVFiles(csvFiles: Array<{id: string, name: string, fileName: string, totalLeads: number}>): Promise<void> {
    await this.setItem(STORAGE_KEYS.CSV_FILES, csvFiles);
  }

  async getCSVFiles(): Promise<Array<{id: string, name: string, fileName: string, totalLeads: number}>> {
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