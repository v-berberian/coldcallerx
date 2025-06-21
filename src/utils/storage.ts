import { Lead } from '../types/lead';

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
  
  private constructor() {}
  
  static getInstance(): AppStorage {
    if (!AppStorage.instance) {
      AppStorage.instance = new AppStorage();
    }
    return AppStorage.instance;
  }

  // Generic storage methods
  private setItem(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return defaultValue;
    }
  }

  private removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  }

  // Current lead index
  saveCurrentLeadIndex(index: number): void {
    this.setItem(STORAGE_KEYS.CURRENT_LEAD_INDEX, index);
  }

  getCurrentLeadIndex(): number {
    return this.getItem(STORAGE_KEYS.CURRENT_LEAD_INDEX, 0);
  }

  // Leads data with call status
  saveLeadsData(leads: Lead[]): void {
    this.setItem(STORAGE_KEYS.LEADS_DATA, leads);
  }

  getLeadsData(): Lead[] {
    return this.getItem(STORAGE_KEYS.LEADS_DATA, []);
  }

  // Search state
  saveSearchQuery(query: string): void {
    this.setItem(STORAGE_KEYS.SEARCH_QUERY, query);
  }

  getSearchQuery(): string {
    return this.getItem(STORAGE_KEYS.SEARCH_QUERY, '');
  }

  // Filter states
  saveTimezoneFilter(filter: string): void {
    this.setItem(STORAGE_KEYS.TIMEZONE_FILTER, filter);
  }

  getTimezoneFilter(): string {
    return this.getItem(STORAGE_KEYS.TIMEZONE_FILTER, 'all');
  }

  saveCallFilter(filter: string): void {
    this.setItem(STORAGE_KEYS.CALL_FILTER, filter);
  }

  getCallFilter(): string {
    return this.getItem(STORAGE_KEYS.CALL_FILTER, 'all');
  }

  // App modes
  saveShuffleMode(enabled: boolean): void {
    this.setItem(STORAGE_KEYS.SHUFFLE_MODE, enabled);
  }

  getShuffleMode(): boolean {
    return this.getItem(STORAGE_KEYS.SHUFFLE_MODE, false);
  }

  saveAutoCall(enabled: boolean): void {
    this.setItem(STORAGE_KEYS.AUTO_CALL, enabled);
  }

  getAutoCall(): boolean {
    return this.getItem(STORAGE_KEYS.AUTO_CALL, false);
  }

  saveCallDelay(delay: number): void {
    this.setItem(STORAGE_KEYS.CALL_DELAY, delay);
  }

  getCallDelay(): number {
    return this.getItem(STORAGE_KEYS.CALL_DELAY, 0);
  }

  // Daily call tracking
  saveDailyCallCount(count: number): void {
    this.setItem(STORAGE_KEYS.DAILY_CALL_COUNT, count);
  }

  getDailyCallCount(): number {
    return this.getItem(STORAGE_KEYS.DAILY_CALL_COUNT, 0);
  }

  saveLastOpenedDate(date: string): void {
    this.setItem(STORAGE_KEYS.LAST_OPENED_DATE, date);
  }

  getLastOpenedDate(): string {
    return this.getItem(STORAGE_KEYS.LAST_OPENED_DATE, '');
  }

  // App settings
  saveAppSettings(settings: AppSettings): void {
    this.setItem(STORAGE_KEYS.APP_SETTINGS, settings);
  }

  getAppSettings(): AppSettings {
    return this.getItem(STORAGE_KEYS.APP_SETTINGS, {});
  }

  // Check if we need to reset daily count (new day)
  shouldResetDailyCount(): boolean {
    const lastOpened = this.getLastOpenedDate();
    const today = new Date().toDateString();
    
    if (lastOpened !== today) {
      this.saveLastOpenedDate(today);
      return true;
    }
    
    return false;
  }

  // Clear all app data
  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      this.removeItem(key);
    });
  }

  // Export data for backup
  exportData(): string {
    const data = {
      currentLeadIndex: this.getCurrentLeadIndex(),
      leadsData: this.getLeadsData(),
      searchQuery: this.getSearchQuery(),
      timezoneFilter: this.getTimezoneFilter(),
      callFilter: this.getCallFilter(),
      shuffleMode: this.getShuffleMode(),
      autoCall: this.getAutoCall(),
      callDelay: this.getCallDelay(),
      dailyCallCount: this.getDailyCallCount(),
      lastOpenedDate: this.getLastOpenedDate(),
      appSettings: this.getAppSettings(),
      exportDate: new Date().toISOString(),
    };
    
    return JSON.stringify(data, null, 2);
  }

  // Import data from backup
  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.currentLeadIndex !== undefined) this.saveCurrentLeadIndex(data.currentLeadIndex);
      if (data.leadsData) this.saveLeadsData(data.leadsData);
      if (data.searchQuery !== undefined) this.saveSearchQuery(data.searchQuery);
      if (data.timezoneFilter !== undefined) this.saveTimezoneFilter(data.timezoneFilter);
      if (data.callFilter !== undefined) this.saveCallFilter(data.callFilter);
      if (data.shuffleMode !== undefined) this.saveShuffleMode(data.shuffleMode);
      if (data.autoCall !== undefined) this.saveAutoCall(data.autoCall);
      if (data.callDelay !== undefined) this.saveCallDelay(data.callDelay);
      if (data.dailyCallCount !== undefined) this.saveDailyCallCount(data.dailyCallCount);
      if (data.lastOpenedDate) this.saveLastOpenedDate(data.lastOpenedDate);
      if (data.appSettings) this.saveAppSettings(data.appSettings);
      
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
}

// Export singleton instance
export const appStorage = AppStorage.getInstance(); 