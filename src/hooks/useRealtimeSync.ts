
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';

interface RealtimeSyncProps {
  onSessionUpdate: (sessionData: any) => void;
  onLeadsUpdate: (leadsData: any) => void;
}

export const useRealtimeSync = ({ onSessionUpdate, onLeadsUpdate }: RealtimeSyncProps) => {
  const { user } = useAuth();

  const setupRealtimeSubscription = useCallback(() => {
    if (!user) return null;

    // Subscribe to user session changes
    const sessionChannel = supabase
      .channel('user-session-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_sessions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Session updated from another device:', payload);
          const sessionData = payload.new;
          
          // Parse leads_data if it exists
          if (sessionData.leads_data) {
            try {
              sessionData.leads_data = JSON.parse(sessionData.leads_data);
            } catch (error) {
              console.error('Error parsing leads_data:', error);
            }
          }
          
          onSessionUpdate(sessionData);
        }
      )
      .subscribe();

    // Subscribe to leads changes
    const leadsChannel = supabase
      .channel('leads-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Leads updated from another device:', payload);
          onLeadsUpdate(payload);
        }
      )
      .subscribe();

    return { sessionChannel, leadsChannel };
  }, [user, onSessionUpdate, onLeadsUpdate]);

  useEffect(() => {
    const channels = setupRealtimeSubscription();
    
    return () => {
      if (channels) {
        supabase.removeChannel(channels.sessionChannel);
        supabase.removeChannel(channels.leadsChannel);
      }
    };
  }, [setupRealtimeSubscription]);

  return {
    setupRealtimeSubscription
  };
};
