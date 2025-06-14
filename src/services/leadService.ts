import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead';

export interface LeadList {
  id: string;
  name: string;
  file_name: string;
  total_leads: number;
  created_at: string;
  updated_at: string;
}

export interface CloudLead {
  id: string;
  lead_list_id: string;
  name: string;
  phone: string;
  called_count: number;
  last_called_at: string | null;
  created_at: string;
  updated_at: string;
}

export const leadService = {
  async createLeadList(name: string, fileName: string): Promise<LeadList | null> {
    const user = await supabase.auth.getUser();
    
    if (!user.data.user) {
      console.error('User not authenticated');
      return null;
    }

    const { data, error } = await supabase
      .from('lead_lists')
      .insert({
        user_id: user.data.user.id,
        name,
        file_name: fileName,
        total_leads: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating lead list:', error);
      return null;
    }

    return data;
  },

  async uploadCSVFile(file: File, userId: string): Promise<string | null> {
    const fileName = `${userId}/${Date.now()}_${file.name}`;
    
    const { error } = await supabase.storage
      .from('csv-uploads')
      .upload(fileName, file);

    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }

    return fileName;
  },

  async saveLeads(leadListId: string, leads: Lead[]): Promise<boolean> {
    const user = await supabase.auth.getUser();
    
    if (!user.data.user) {
      console.error('User not authenticated');
      return false;
    }

    const leadsData = leads.map(lead => {
      let lastCalledAt = null;
      
      // Handle lastCalled date conversion with proper validation
      if (lead.lastCalled) {
        try {
          const date = new Date(lead.lastCalled);
          if (!isNaN(date.getTime())) {
            lastCalledAt = date.toISOString();
          } else {
            console.warn('Invalid lastCalled date for lead:', lead.name, lead.lastCalled);
          }
        } catch (error) {
          console.warn('Error parsing lastCalled date for lead:', lead.name, error);
        }
      }

      return {
        user_id: user.data.user.id,
        lead_list_id: leadListId,
        name: lead.name,
        phone: lead.phone,
        called_count: 0,
        last_called_at: lastCalledAt
      };
    });

    const { error } = await supabase
      .from('leads')
      .insert(leadsData);

    if (error) {
      console.error('Error saving leads:', error);
      return false;
    }

    // Update total leads count
    await supabase
      .from('lead_lists')
      .update({ total_leads: leads.length })
      .eq('id', leadListId);

    return true;
  },

  async getLeadLists(): Promise<LeadList[]> {
    const { data, error } = await supabase
      .from('lead_lists')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching lead lists:', error);
      return [];
    }

    return data || [];
  },

  async getLeads(leadListId: string): Promise<Lead[]> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('lead_list_id', leadListId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching leads:', error);
      return [];
    }

    return data.map(lead => ({
      name: lead.name,
      phone: lead.phone,
      lastCalled: lead.last_called_at ? new Date(lead.last_called_at).toLocaleString() : undefined
    }));
  },

  async deleteLeadList(leadListId: string): Promise<boolean> {
    // First delete all leads in the list
    const { error: leadsError } = await supabase
      .from('leads')
      .delete()
      .eq('lead_list_id', leadListId);

    if (leadsError) {
      console.error('Error deleting leads:', leadsError);
      return false;
    }

    // Then delete the lead list
    const { error: listError } = await supabase
      .from('lead_lists')
      .delete()
      .eq('id', leadListId);

    if (listError) {
      console.error('Error deleting lead list:', listError);
      return false;
    }

    return true;
  },

  async updateLeadCallCount(leadListId: string, leadName: string, leadPhone: string, calledCount: number, lastCalled?: string): Promise<boolean> {
    let lastCalledAt = null;
    
    // Handle lastCalled date conversion with proper validation
    if (lastCalled) {
      try {
        const date = new Date(lastCalled);
        if (!isNaN(date.getTime())) {
          lastCalledAt = date.toISOString();
        } else {
          console.warn('Invalid lastCalled date for updateLeadCallCount:', lastCalled);
        }
      } catch (error) {
        console.warn('Error parsing lastCalled date for updateLeadCallCount:', error);
      }
    }

    const { error } = await supabase
      .from('leads')
      .update({
        called_count: calledCount,
        last_called_at: lastCalledAt
      })
      .eq('lead_list_id', leadListId)
      .eq('name', leadName)
      .eq('phone', leadPhone);

    if (error) {
      console.error('Error updating lead call count:', error);
      return false;
    }

    return true;
  },

  async resetLeadCallCount(leadListId: string, leadName: string, leadPhone: string): Promise<boolean> {
    const { error } = await supabase
      .from('leads')
      .update({
        called_count: 0,
        last_called_at: null
      })
      .eq('lead_list_id', leadListId)
      .eq('name', leadName)
      .eq('phone', leadPhone);

    if (error) {
      console.error('Error resetting lead call count:', error);
      return false;
    }

    return true;
  },

  async resetAllCallCounts(leadListId: string): Promise<boolean> {
    const { error } = await supabase
      .from('leads')
      .update({
        called_count: 0,
        last_called_at: null
      })
      .eq('lead_list_id', leadListId);

    if (error) {
      console.error('Error resetting all call counts:', error);
      return false;
    }

    return true;
  }
};
