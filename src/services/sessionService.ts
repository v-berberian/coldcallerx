
import { supabase } from '@/integrations/supabase/client';
import { getDeviceId } from '@/utils/deviceUtils';

export interface UserSession {
  id: string;
  user_id: string;
  device_id: string;
  current_lead_list_id: string | null;
  current_lead_index: number;
  timezone_filter: string;
  call_filter: string;
  shuffle_mode: boolean;
  auto_call: boolean;
  call_delay: number;
  last_accessed_at: string;
  last_updated_at: string;
  created_at: string;
  updated_at: string;
}

export interface SessionState {
  currentLeadListId: string | null;
  currentLeadIndex: number;
  timezoneFilter: string;
  callFilter: string;
  shuffleMode: boolean;
  autoCall: boolean;
  callDelay: number;
}

// Debounce utility for session saves
let saveTimeout: NodeJS.Timeout | null = null;
const SAVE_DEBOUNCE_MS = 1000;

export const sessionService = {
  async getUserSession(): Promise<UserSession | null> {
    const user = await supabase.auth.getUser();
    
    if (!user.data.user) {
      console.error('User not authenticated');
      return null;
    }

    const deviceId = getDeviceId();

    try {
      // First try to get session for current device
      const { data: deviceSession, error: deviceError } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.data.user.id)
        .eq('device_id', deviceId)
        .maybeSingle();

      if (deviceError && deviceError.code !== 'PGRST116') {
        console.error('Error fetching device session:', deviceError);
      }

      if (deviceSession) {
        return deviceSession;
      }

      // If no session for current device, get the most recent session from any device
      const { data: recentSession, error: recentError } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.data.user.id)
        .order('last_updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (recentError && recentError.code !== 'PGRST116') {
        console.error('Error fetching recent session:', recentError);
        return null;
      }

      return recentSession;
    } catch (error) {
      console.error('Error in getUserSession:', error);
      return null;
    }
  },

  async saveUserSession(sessionState: SessionState): Promise<boolean> {
    const user = await supabase.auth.getUser();
    
    if (!user.data.user) {
      console.error('User not authenticated');
      return false;
    }

    const deviceId = getDeviceId();

    // Clear existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    // Debounce the save operation
    return new Promise((resolve) => {
      saveTimeout = setTimeout(async () => {
        try {
          const sessionData = {
            user_id: user.data.user.id,
            device_id: deviceId,
            current_lead_list_id: sessionState.currentLeadListId,
            current_lead_index: sessionState.currentLeadIndex,
            timezone_filter: sessionState.timezoneFilter,
            call_filter: sessionState.callFilter,
            shuffle_mode: sessionState.shuffleMode,
            auto_call: sessionState.autoCall,
            call_delay: sessionState.callDelay,
            last_accessed_at: new Date().toISOString(),
            last_updated_at: new Date().toISOString()
          };

          const { error } = await supabase
            .from('user_sessions')
            .upsert(sessionData, {
              onConflict: 'user_id,device_id'
            });

          if (error) {
            console.error('Error saving user session:', error);
            resolve(false);
          } else {
            resolve(true);
          }
        } catch (error) {
          console.error('Error in saveUserSession:', error);
          resolve(false);
        }
      }, SAVE_DEBOUNCE_MS);
    });
  },

  async clearUserSession(): Promise<boolean> {
    const user = await supabase.auth.getUser();
    
    if (!user.data.user) {
      console.error('User not authenticated');
      return false;
    }

    const deviceId = getDeviceId();

    try {
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', user.data.user.id)
        .eq('device_id', deviceId);

      if (error) {
        console.error('Error clearing user session:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in clearUserSession:', error);
      return false;
    }
  },

  async clearAllUserSessions(): Promise<boolean> {
    const user = await supabase.auth.getUser();
    
    if (!user.data.user) {
      console.error('User not authenticated');
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', user.data.user.id);

      if (error) {
        console.error('Error clearing all user sessions:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in clearAllUserSessions:', error);
      return false;
    }
  }
};
