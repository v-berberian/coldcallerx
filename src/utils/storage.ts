import { Lead } from '../types/lead';
import { Preferences } from '@capacitor/preferences';

// Storage keys
const STORAGE_KEYS = {
  CURRENT_LEAD_INDEX: 'coldcallerx_current_lead_index',
  LEADS_DATA: 'coldcallerx_leads_data',
  SEARCH_QUERY: 'coldcallerx_search_query',
  TIMEZONE_FILTER: 'coldcallerx_timezone_filter',
  CALL_FILTER: 'coldcallerx_call_filter',
  SHUFFLE_MODE: 'coldcallerx_shuffle_mode',
  AUTO_CALL: 'coldcallerx_auto_call',
  CALL_DELAY: 'coldcallerx_call_delay',
  DAILY_CALL_COUNT: 'coldcallerx_daily_call_count',
  LAST_OPENED_DATE: 'coldcallerx_last_opened_date',
  APP_SETTINGS: 'coldcallerx_app_settings',
} as const;

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
    console.log('AppStorage: Using', this.useCapacitorStorage ? 'Capacitor Preferences' : 'localStorage');
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
        console.log('AppStorage: Saved to Capacitor Preferences:', key, value);
      } else {
        localStorage.setItem(key, stringValue);
        console.log('AppStorage: Saved to localStorage:', key, value);
      }
    } catch (error) {
      console.error('Failed to save to storage:', error);
      // Fallback to localStorage if Capacitor fails
      if (this.useCapacitorStorage) {
        try {
          localStorage.setItem(key, JSON.stringify(value));
          console.log('AppStorage: Fallback to localStorage:', key);
        } catch (fallbackError) {
          console.error('Fallback localStorage also failed:', fallbackError);
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
        console.log('AppStorage: Retrieved from Capacitor Preferences:', key, item);
      } else {
        item = localStorage.getItem(key);
        console.log('AppStorage: Retrieved from localStorage:', key, item);
      }
      
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Failed to read from storage:', error);
      // Fallback to localStorage if Capacitor fails
      if (this.useCapacitorStorage) {
        try {
          const fallbackItem = localStorage.getItem(key);
          console.log('AppStorage: Fallback to localStorage:', key);
          return fallbackItem ? JSON.parse(fallbackItem) : defaultValue;
        } catch (fallbackError) {
          console.error('Fallback localStorage also failed:', fallbackError);
        }
      }
      return defaultValue;
    }
  }

  private async removeItem(key: string): Promise<void> {
    try {
      if (this.useCapacitorStorage) {
        await Preferences.remove({ key });
        console.log('AppStorage: Removed from Capacitor Preferences:', key);
      } else {
        localStorage.removeItem(key);
        console.log('AppStorage: Removed from localStorage:', key);
      }
    } catch (error) {
      console.error('Failed to remove from storage:', error);
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
      console.error('Failed to import data:', error);
      return false;
    }
  }
}

// Export singleton instance
export const appStorage = AppStorage.getInstance(); 