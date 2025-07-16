import { Lead } from '@/types/lead';

// Storage keys
const STORAGE_KEYS = {
  LEADS: 'leads',
  CURRENT_INDEX: 'currentIndex',
  CALL_COUNT: 'callCount',
  CSV_ID: 'csvId',
  FILE_NAME: 'fileName',
  EMAIL_SUBJECT: 'emailTemplateSubject',
  EMAIL_BODY: 'emailTemplateBody',
  TEXT_MESSAGE: 'textTemplateMessage',
  EMAIL_TEMPLATES: 'emailTemplates',
  TEXT_TEMPLATES: 'textTemplates',
  SELECTED_EMAIL_TEMPLATE: 'selectedEmailTemplate',
  SELECTED_TEXT_TEMPLATE: 'selectedTextTemplate',
  THEME: 'theme',
  AUTO_CALL_ENABLED: 'autoCallEnabled',
  CALL_DELAY: 'callDelay'
} as const;

export class StorageManager {
  // Lead management
  static getLeads(): Lead[] {
    try {
      const leads = localStorage.getItem(STORAGE_KEYS.LEADS);
      return leads ? JSON.parse(leads) : [];
    } catch (error) {
      console.error('Error loading leads:', error);
      return [];
    }
  }

  static setLeads(leads: Lead[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
    } catch (error) {
      console.error('Error saving leads:', error);
    }
  }

  // Current index management
  static getCurrentIndex(): number {
    try {
      const index = localStorage.getItem(STORAGE_KEYS.CURRENT_INDEX);
      return index ? parseInt(index, 10) : 0;
    } catch (error) {
      console.error('Error loading current index:', error);
      return 0;
    }
  }

  static setCurrentIndex(index: number): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_INDEX, index.toString());
    } catch (error) {
      console.error('Error saving current index:', error);
    }
  }

  // Call count management
  static getCallCount(): number {
    try {
      const count = localStorage.getItem(STORAGE_KEYS.CALL_COUNT);
      return count ? parseInt(count, 10) : 0;
    } catch (error) {
      console.error('Error loading call count:', error);
      return 0;
    }
  }

  static setCallCount(count: number): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CALL_COUNT, count.toString());
    } catch (error) {
      console.error('Error saving call count:', error);
    }
  }

  // CSV management
  static getCSVId(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.CSV_ID);
    } catch (error) {
      console.error('Error loading CSV ID:', error);
      return null;
    }
  }

  static setCSVId(id: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CSV_ID, id);
    } catch (error) {
      console.error('Error saving CSV ID:', error);
    }
  }

  static getFileName(): string {
    try {
      return localStorage.getItem(STORAGE_KEYS.FILE_NAME) || '';
    } catch (error) {
      console.error('Error loading file name:', error);
      return '';
    }
  }

  static setFileName(name: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.FILE_NAME, name);
    } catch (error) {
      console.error('Error saving file name:', error);
    }
  }

  // Template management
  static getEmailSubject(): string {
    try {
      return localStorage.getItem(STORAGE_KEYS.EMAIL_SUBJECT) || '';
    } catch (error) {
      console.error('Error loading email subject:', error);
      return '';
    }
  }

  static setEmailSubject(subject: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.EMAIL_SUBJECT, subject);
    } catch (error) {
      console.error('Error saving email subject:', error);
    }
  }

  static getEmailBody(): string {
    try {
      return localStorage.getItem(STORAGE_KEYS.EMAIL_BODY) || '';
    } catch (error) {
      console.error('Error loading email body:', error);
      return '';
    }
  }

  static setEmailBody(body: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.EMAIL_BODY, body);
    } catch (error) {
      console.error('Error saving email body:', error);
    }
  }

  static getTextMessage(): string {
    try {
      return localStorage.getItem(STORAGE_KEYS.TEXT_MESSAGE) || '';
    } catch (error) {
      console.error('Error loading text message:', error);
      return '';
    }
  }

  static setTextMessage(message: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TEXT_MESSAGE, message);
    } catch (error) {
      console.error('Error saving text message:', error);
    }
  }

  // Theme management
  static getTheme(): string {
    try {
      return localStorage.getItem(STORAGE_KEYS.THEME) || 'system';
    } catch (error) {
      console.error('Error loading theme:', error);
      return 'system';
    }
  }

  static setTheme(theme: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }

  // Auto call settings
  static getAutoCallEnabled(): boolean {
    try {
      const enabled = localStorage.getItem(STORAGE_KEYS.AUTO_CALL_ENABLED);
      return enabled ? JSON.parse(enabled) : false;
    } catch (error) {
      console.error('Error loading auto call enabled:', error);
      return false;
    }
  }

  static setAutoCallEnabled(enabled: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.AUTO_CALL_ENABLED, JSON.stringify(enabled));
    } catch (error) {
      console.error('Error saving auto call enabled:', error);
    }
  }

  static getCallDelay(): number {
    try {
      const delay = localStorage.getItem(STORAGE_KEYS.CALL_DELAY);
      return delay ? parseInt(delay, 10) : 3000;
    } catch (error) {
      console.error('Error loading call delay:', error);
      return 3000;
    }
  }

  static setCallDelay(delay: number): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CALL_DELAY, delay.toString());
    } catch (error) {
      console.error('Error saving call delay:', error);
    }
  }

  // Clear all storage
  static clearAll(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  // Clear specific data
  static clearLeadsData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.LEADS);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_INDEX);
      localStorage.removeItem(STORAGE_KEYS.CALL_COUNT);
      localStorage.removeItem(STORAGE_KEYS.CSV_ID);
      localStorage.removeItem(STORAGE_KEYS.FILE_NAME);
    } catch (error) {
      console.error('Error clearing leads data:', error);
    }
  }

  // Check if storage is available
  static isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
}

export { STORAGE_KEYS }; 