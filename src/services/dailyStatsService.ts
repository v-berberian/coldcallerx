
import { supabase } from '@/integrations/supabase/client';

export interface DailyStats {
  id: string;
  date: string;
  call_count: number;
  goal: number;
  created_at: string;
  updated_at: string;
}

export const dailyStatsService = {
  async getTodaysStats(): Promise<DailyStats | null> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('daily_call_stats')
      .select('*')
      .eq('date', today)
      .maybeSingle();

    if (error) {
      console.error('Error fetching daily stats:', error);
      return null;
    }

    return data;
  },

  async incrementDailyCallCount(): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];
    
    // Try to get existing record
    const { data: existing } = await supabase
      .from('daily_call_stats')
      .select('*')
      .eq('date', today)
      .maybeSingle();

    if (existing) {
      // Update existing record
      const { error } = await supabase
        .from('daily_call_stats')
        .update({ call_count: existing.call_count + 1 })
        .eq('id', existing.id);

      if (error) {
        console.error('Error updating daily call count:', error);
        return false;
      }
    } else {
      // Create new record
      const { error } = await supabase
        .from('daily_call_stats')
        .insert({
          date: today,
          call_count: 1,
          goal: 500
        });

      if (error) {
        console.error('Error creating daily call record:', error);
        return false;
      }
    }

    return true;
  },

  async resetDailyCallCount(): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];
    
    const { error } = await supabase
      .from('daily_call_stats')
      .update({ call_count: 0 })
      .eq('date', today);

    if (error) {
      console.error('Error resetting daily call count:', error);
      return false;
    }

    return true;
  },

  async updateDailyGoal(goal: number): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];
    
    // Update both the daily stats and the user profile
    const { error: dailyError } = await supabase
      .from('daily_call_stats')
      .upsert({
        date: today,
        goal: goal,
        call_count: 0
      });

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ daily_goal: goal })
      .eq('id', (await supabase.auth.getUser()).data.user?.id);

    if (dailyError || profileError) {
      console.error('Error updating daily goal:', dailyError || profileError);
      return false;
    }

    return true;
  }
};
