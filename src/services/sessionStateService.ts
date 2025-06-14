
import { sessionService, SessionState } from './sessionService';

export class SessionStateService {
  private currentState: SessionState = {
    currentLeadListId: null,
    currentLeadIndex: 0,
    timezoneFilter: 'ALL',
    callFilter: 'ALL',
    shuffleMode: false,
    autoCall: false,
    callDelay: 0
  };

  getCurrentState(): SessionState {
    return { ...this.currentState };
  }

  updateState(updates: Partial<SessionState>): SessionState {
    this.currentState = { ...this.currentState, ...updates };
    return { ...this.currentState };
  }

  async saveState(): Promise<boolean> {
    try {
      console.log('SessionStateService: Saving session state:', this.currentState);
      await sessionService.saveUserSession(this.currentState);
      return true;
    } catch (error) {
      console.error('SessionStateService: Error saving session state:', error);
      return false;
    }
  }

  async loadSavedState(): Promise<SessionState | null> {
    try {
      const savedSession = await sessionService.getUserSession();
      if (savedSession) {
        this.currentState = {
          currentLeadListId: savedSession.current_lead_list_id,
          currentLeadIndex: savedSession.current_lead_index,
          timezoneFilter: savedSession.timezone_filter,
          callFilter: savedSession.call_filter,
          shuffleMode: savedSession.shuffle_mode,
          autoCall: savedSession.auto_call,
          callDelay: savedSession.call_delay
        };
        return { ...this.currentState };
      }
      return null;
    } catch (error) {
      console.error('SessionStateService: Error loading session state:', error);
      return null;
    }
  }

  setState(newState: SessionState): void {
    this.currentState = { ...newState };
  }
}

export const sessionStateService = new SessionStateService();
