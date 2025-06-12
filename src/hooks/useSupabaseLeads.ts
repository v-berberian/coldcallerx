
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead';
import { useToast } from '@/hooks/use-toast';

interface LeadList {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export const useSupabaseLeads = (userId: string | undefined) => {
  const [leadLists, setLeadLists] = useState<LeadList[]>([]);
  const [currentListId, setCurrentListId] = useState<string | null>(null);
  const [leadsData, setLeadsData] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load lead lists on mount
  useEffect(() => {
    if (!userId) return;
    loadLeadLists();
  }, [userId]);

  // Load leads when list changes
  useEffect(() => {
    if (!currentListId) return;
    loadLeads(currentListId);
  }, [currentListId]);

  const loadLeadLists = async () => {
    try {
      const { data, error } = await supabase
        .from('lead_lists')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      setLeadLists(data || []);
      
      // Auto-select first list if none selected
      if (data && data.length > 0 && !currentListId) {
        setCurrentListId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading lead lists:', error);
      toast({
        title: "Error",
        description: "Failed to load lead lists",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadLeads = async (listId: string) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('list_id', listId)
        .order('created_at');

      if (error) throw error;
      
      // Transform to match local Lead interface
      const transformedLeads: Lead[] = (data || []).map(lead => ({
        name: lead.name,
        phone: lead.phone,
        called: lead.called || 0,
        lastCalled: lead.last_called ? new Date(lead.last_called).toLocaleString() : undefined
      }));
      
      setLeadsData(transformedLeads);
    } catch (error) {
      console.error('Error loading leads:', error);
      toast({
        title: "Error",
        description: "Failed to load leads",
        variant: "destructive",
      });
    }
  };

  const createLeadList = async (name: string, leads: Lead[]) => {
    if (!userId) return null;

    try {
      // Create lead list
      const { data: listData, error: listError } = await supabase
        .from('lead_lists')
        .insert([{ name, user_id: userId }])
        .select()
        .single();

      if (listError) throw listError;

      // Insert leads
      const leadsToInsert = leads.map(lead => ({
        list_id: listData.id,
        name: lead.name,
        phone: lead.phone,
        called: lead.called || 0,
        last_called: lead.lastCalled ? new Date(lead.lastCalled).toISOString() : null
      }));

      const { error: leadsError } = await supabase
        .from('leads')
        .insert(leadsToInsert);

      if (leadsError) throw leadsError;

      // Refresh lists and switch to new one
      await loadLeadLists();
      setCurrentListId(listData.id);
      
      toast({
        title: "Success",
        description: `Lead list "${name}" created successfully`,
      });

      return listData.id;
    } catch (error) {
      console.error('Error creating lead list:', error);
      toast({
        title: "Error",
        description: "Failed to create lead list",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateLeadCallStatus = async (lead: Lead) => {
    if (!currentListId) return;

    try {
      const { error } = await supabase
        .from('leads')
        .update({
          called: lead.called || 0,
          last_called: lead.lastCalled ? new Date(lead.lastCalled).toISOString() : null
        })
        .eq('list_id', currentListId)
        .eq('name', lead.name)
        .eq('phone', lead.phone);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating lead call status:', error);
    }
  };

  const switchToList = (listId: string) => {
    setCurrentListId(listId);
  };

  const getCurrentListName = () => {
    return leadLists.find(list => list.id === currentListId)?.name || '';
  };

  return {
    leadLists,
    currentListId,
    leadsData,
    loading,
    createLeadList,
    updateLeadCallStatus,
    switchToList,
    getCurrentListName,
    refreshLists: loadLeadLists
  };
};
