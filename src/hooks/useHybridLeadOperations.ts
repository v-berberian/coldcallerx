
import { useState, useEffect } from 'react';
import { Lead } from '../types/lead';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useHybridLeadOperations = () => {
  const { user } = useAuth();
  const [currentLeadList, setCurrentLeadList] = useState<any>(null);
  const [leadsData, setLeadsData] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load existing data on mount
  useEffect(() => {
    if (user) {
      loadExistingData();
    }
  }, [user]);

  const loadExistingData = async () => {
    if (!user) return;

    try {
      // Try to load from server first
      if (isOnline) {
        const { data: leadLists } = await supabase
          .from('lead_lists')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (leadLists && leadLists.length > 0) {
          const latestList = leadLists[0];
          setCurrentLeadList(latestList);
          
          // Load leads for this list
          const { data: leads } = await supabase
            .from('leads')
            .select('*')
            .eq('lead_list_id', latestList.id)
            .eq('user_id', user.id);

          if (leads) {
            const formattedLeads = leads.map(lead => ({
              name: lead.name,
              phone: lead.phone,
              company: lead.company || undefined,
              email: lead.email || undefined,
              called: lead.called_count || 0,
              lastCalled: lead.last_called || undefined
            }));
            setLeadsData(formattedLeads);
            
            // Save to localStorage as backup
            localStorage.setItem('currentLeadList', JSON.stringify(latestList));
            localStorage.setItem('leadsData', JSON.stringify(formattedLeads));
            return;
          }
        }
      }
      
      // Fallback to localStorage
      const savedLeads = localStorage.getItem('leadsData');
      const savedLeadList = localStorage.getItem('currentLeadList');
      
      if (savedLeads && savedLeadList) {
        setLeadsData(JSON.parse(savedLeads));
        setCurrentLeadList(JSON.parse(savedLeadList));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback to localStorage on any error
      const savedLeads = localStorage.getItem('leadsData');
      const savedLeadList = localStorage.getItem('currentLeadList');
      
      if (savedLeads && savedLeadList) {
        setLeadsData(JSON.parse(savedLeads));
        setCurrentLeadList(JSON.parse(savedLeadList));
      }
    }
  };

  const importLeadsFromCSV = async (leads: Lead[], fileName: string): Promise<boolean> => {
    setLoading(true);
    try {
      const leadList = { 
        id: Date.now().toString(), 
        name: fileName,
        file_name: fileName + '.csv',
        total_leads: leads.length
      };

      // Always save to localStorage immediately
      setCurrentLeadList(leadList);
      setLeadsData(leads);
      localStorage.setItem('currentLeadList', JSON.stringify(leadList));
      localStorage.setItem('leadsData', JSON.stringify(leads));

      // Try to sync with server if online and authenticated
      if (isOnline && user) {
        try {
          // Create lead list in database
          const { data: serverLeadList, error: listError } = await supabase
            .from('lead_lists')
            .insert({
              user_id: user.id,
              name: fileName,
              file_name: fileName + '.csv',
              total_leads: leads.length
            })
            .select()
            .single();

          if (listError) throw listError;

          if (serverLeadList) {
            // Update local state with server ID
            const updatedLeadList = { ...leadList, id: serverLeadList.id };
            setCurrentLeadList(updatedLeadList);
            localStorage.setItem('currentLeadList', JSON.stringify(updatedLeadList));

            // Insert all leads
            const leadsToInsert = leads.map(lead => ({
              user_id: user.id,
              lead_list_id: serverLeadList.id,
              name: lead.name,
              phone: lead.phone,
              company: lead.company || null,
              email: lead.email || null,
              called_count: lead.called || 0,
              last_called: lead.lastCalled || null
            }));

            const { error: leadsError } = await supabase
              .from('leads')
              .insert(leadsToInsert);

            if (leadsError) throw leadsError;
            
            console.log('Successfully synced leads to server');
          }
        } catch (serverError) {
          console.warn('Failed to sync with server, using local storage:', serverError);
        }
      }

      return true;
    } catch (error) {
      console.error('Error importing leads:', error);
    } finally {
      setLoading(false);
    }
    return false;
  };

  const updateLeadCallCount = async (lead: Lead): Promise<boolean> => {
    try {
      const now = new Date();
      const dateString = now.toLocaleDateString();
      const timeString = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      const lastCalledString = `${dateString} at ${timeString}`;
      const newCallCount = (lead.called || 0) + 1;

      // Update local state immediately
      const updatedLeads = leadsData.map(l => 
        l.name === lead.name && l.phone === lead.phone ? {
          ...l,
          called: newCallCount,
          lastCalled: lastCalledString
        } : l
      );
      setLeadsData(updatedLeads);
      localStorage.setItem('leadsData', JSON.stringify(updatedLeads));

      // Try to sync with server if online and authenticated
      if (isOnline && user && currentLeadList?.id) {
        try {
          const { error } = await supabase
            .from('leads')
            .update({
              called_count: newCallCount,
              last_called: lastCalledString,
              last_called_at: now.toISOString()
            })
            .eq('user_id', user.id)
            .eq('lead_list_id', currentLeadList.id)
            .eq('name', lead.name)
            .eq('phone', lead.phone);

          if (error) throw error;
        } catch (serverError) {
          console.warn('Failed to sync call count with server:', serverError);
        }
      }

      return true;
    } catch (error) {
      console.error('Error updating call count:', error);
      return false;
    }
  };

  const resetCallCount = async (lead: Lead): Promise<boolean> => {
    try {
      // Update local state immediately
      const updatedLeads = leadsData.map(l => 
        l.name === lead.name && l.phone === lead.phone 
          ? { ...l, called: 0, lastCalled: undefined }
          : l
      );
      setLeadsData(updatedLeads);
      localStorage.setItem('leadsData', JSON.stringify(updatedLeads));

      // Try to sync with server if online and authenticated
      if (isOnline && user && currentLeadList?.id) {
        try {
          const { error } = await supabase
            .from('leads')
            .update({
              called_count: 0,
              last_called: null,
              last_called_at: null
            })
            .eq('user_id', user.id)
            .eq('lead_list_id', currentLeadList.id)
            .eq('name', lead.name)
            .eq('phone', lead.phone);

          if (error) throw error;
        } catch (serverError) {
          console.warn('Failed to sync reset with server:', serverError);
        }
      }

      return true;
    } catch (error) {
      console.error('Error resetting call count:', error);
      return false;
    }
  };

  const resetAllCallCounts = async (): Promise<boolean> => {
    try {
      // Update local state immediately
      const updatedLeads = leadsData.map(l => ({
        ...l,
        called: 0,
        lastCalled: undefined
      }));
      setLeadsData(updatedLeads);
      localStorage.setItem('leadsData', JSON.stringify(updatedLeads));

      // Try to sync with server if online and authenticated
      if (isOnline && user && currentLeadList?.id) {
        try {
          const { error } = await supabase
            .from('leads')
            .update({
              called_count: 0,
              last_called: null,
              last_called_at: null
            })
            .eq('user_id', user.id)
            .eq('lead_list_id', currentLeadList.id);

          if (error) throw error;
        } catch (serverError) {
          console.warn('Failed to sync reset all with server:', serverError);
        }
      }

      return true;
    } catch (error) {
      console.error('Error resetting all call counts:', error);
      return false;
    }
  };

  const deleteLeadList = async (leadListId: string): Promise<boolean> => {
    try {
      // If we deleted the current list, clear it
      if (currentLeadList?.id === leadListId) {
        setCurrentLeadList(null);
        setLeadsData([]);
        localStorage.removeItem('currentLeadList');
        localStorage.removeItem('leadsData');
      }

      // Try to delete from server if online and authenticated
      if (isOnline && user) {
        try {
          const { error } = await supabase
            .from('lead_lists')
            .delete()
            .eq('id', leadListId)
            .eq('user_id', user.id);

          if (error) throw error;
        } catch (serverError) {
          console.warn('Failed to delete from server:', serverError);
        }
      }

      return true;
    } catch (error) {
      console.error('Error deleting lead list:', error);
      return false;
    }
  };

  return {
    currentLeadList,
    leadsData,
    loading,
    isOnline,
    setCurrentLeadList,
    setLeadsData,
    setLoading,
    importLeadsFromCSV,
    updateLeadCallCount,
    resetCallCount,
    resetAllCallCounts,
    deleteLeadList,
    loadExistingData
  };
};
