
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

// Legacy session interface for backwards compatibility
interface LegacySession {
  id: string;
  user_id: string;
  current_lead_list_id: string | null;
  current_lead_index: number;
  timezone_filter: string;
  call_filter: string;
  shuffle_mode: boolean;
  auto_call: boolean;
  call_delay: number;
  last_accessed_at: string;
  created_at: string;
  updated_at: string;
}

// Debounce utility for session saves
let saveTimeout: NodeJS.Timeout | null = null;
const SAVE_DEBOUNCE_MS = 1000;

// Helper function to safely convert legacy session to new format
function normalizeSession(rawSession: any): UserSession | null {
  if (!rawSession) return null;
  
  const deviceId = getDeviceId();
  const now = new Date().toISOString();
  
  return {
    id: rawSession.id,
    user_id: rawSession.user_id,
    device_id: rawSession.device_id || deviceId,
    current_lead_list_id: rawSession.current_lead_list_id,
    current_lead_index: rawSession.current_lead_index || 0,
    timezone_filter: rawSession.timezone_filter || 'ALL',
    call_filter: rawSession.call_filter || 'ALL',
    shuffle_mode: rawSession.shuffle_mode || false,
    auto_call: rawSession.auto_call || false,
    call_delay: rawSession.call_delay || 0,
    last_accessed_at: rawSession.last_accessed_at || now,
    last_updated_at: rawSession.last_updated_at || now,
    created_at: rawSession.created_at || now,
    updated_at: rawSession.updated_at || now,
  };
}

export const sessionService = {
  async getUserSession(): Promise<UserSession | null> {
    try {
      const user = await supabase.auth.getUser();
      
      if (!user.data.user) {
        console.error('User not authenticated');
        return null;
      }

      const deviceId = getDeviceId();

      // Try to get session for current device (will work if migration is applied)
      try {
        const { data: deviceSession, error: deviceError } = await supabase
          .from('user_sessions')
          .select('*')
          .eq('user_id', user.data.user.id)
          .eq('device_id', deviceId)
          .maybeSingle();

        if (!deviceError && deviceSession) {
          return normalizeSession(deviceSession);
        }
      } catch (deviceQueryError) {
        console.log('Device query failed (migration may not be applied yet):', deviceQueryError);
      }

      // Fallback: get any session for this user (backwards compatible)
      try {
        const { data: userSession, error: userError } = await supabase
          .from('user_sessions')
          .select('*')
          .eq('user_id', user.data.user.id)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!userError && userSession) {
          return normalizeSession(userSession);
        }
      } catch (userQueryError) {
        console.log('User query failed:', userQueryError);
      }

      return null;
    } catch (error) {
      console.error('Error in getUserSession:', error);
      return null;
    }
  },

  async saveUserSession(sessionState: SessionState): Promise<boolean> {
    try {
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
            const now = new Date().toISOString();
            
            // Try new format first (with device_id and last_updated_at)
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
                last_accessed_at: now,
                last_updated_at: now
              };

              const { error } = await supabase
                .from('user_sessions')
                .upsert(sessionData, {
                  onConflict: 'user_id,device_id'
                });

              if (!error) {
                resolve(true);
                return;
              }
            } catch (newFormatError) {
              console.log('New format save failed, trying legacy format:', newFormatError);
            }

            // Fallback to legacy format (without device_id and last_updated_at)
            const legacySessionData = {
              user_id: user.data.user.id,
              current_lead_list_id: sessionState.currentLeadListId,
              current_lead_index: sessionState.currentLeadIndex,
              timezone_filter: sessionState.timezoneFilter,
              call_filter: sessionState.callFilter,
              shuffle_mode: sessionState.shuffleMode,
              auto_call: sessionState.autoCall,
              call_delay: sessionState.callDelay,
              last_accessed_at: now
            };

            const { error: legacyError } = await supabase
              .from('user_sessions')
              .upsert(legacySessionData, {
                onConflict: 'user_id'
              });

            if (legacyError) {
              console.error('Error saving user session (legacy):', legacyError);
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
    } catch (error) {
      console.error('Error in saveUserSession setup:', error);
      return false;
    }
  },

  async clearUserSession(): Promise<boolean> {
    try {
      const user = await supabase.auth.getUser();
      
      if (!user.data.user) {
        console.error('User not authenticated');
        return false;
      }

      const deviceId = getDeviceId();

      // Try device-specific clear first
      try {
        const { error } = await supabase
          .from('user_sessions')
          .delete()
          .eq('user_id', user.data.user.id)
          .eq('device_id', deviceId);

        if (!error) {
          return true;
        }
      } catch (deviceClearError) {
        console.log('Device-specific clear failed, trying user clear:', deviceClearError);
      }

      // Fallback to user-based clear
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', user.data.user.id);

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
    try {
      const user = await supabase.auth.getUser();
      
      if (!user.data.user) {
        console.error('User not authenticated');
        return false;
      }

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
