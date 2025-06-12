import { supabase } from '@/integrations/supabase/client';

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

export const sessionService = {
  async getUserSession(deviceId: string): Promise<UserSession | null> {
    if (!deviceId) {
      console.log('No device ID provided for session fetch');
      return null;
    }

    const user = await supabase.auth.getUser();
    
    if (!user.data.user) {
      console.error('User not authenticated');
      return null;
    }

    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', user.data.user.id)
      .eq('device_id', deviceId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user session:', error);
      return null;
    }

    return data;
  },

  async getMostRecentSession(): Promise<UserSession | null> {
    const user = await supabase.auth.getUser();
    
    if (!user.data.user) {
      console.error('User not authenticated');
      return null;
    }

    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', user.data.user.id)
      .order('last_updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching most recent session:', error);
      return null;
    }

    return data;
  },

  async saveUserSession(sessionState: SessionState, deviceId: string): Promise<boolean> {
    if (!deviceId) {
      console.error('No device ID provided for session save');
      return false;
    }

    const user = await supabase.auth.getUser();
    
    if (!user.data.user) {
      console.error('User not authenticated');
      return false;
    }

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
      return false;
    }

    return true;
  },

  async clearUserSession(deviceId: string): Promise<boolean> {
    if (!deviceId) {
      console.error('No device ID provided for session clear');
      return false;
    }

    const user = await supabase.auth.getUser();
    
    if (!user.data.user) {
      console.error('User not authenticated');
      return false;
    }

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
  },

  async cleanupOldSessions(): Promise<boolean> {
    const user = await supabase.auth.getUser();
    
    if (!user.data.user) {
      return false;
    }

    // Keep only the 5 most recent sessions per user
    const { error } = await supabase.rpc('cleanup_old_device_sessions');

    if (error) {
      console.error('Error cleaning up old sessions:', error);
      return false;
    }

    return true;
  }
};
