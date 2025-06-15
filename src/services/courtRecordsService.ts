
import { supabase } from '@/integrations/supabase/client';

export interface CourtRecord {
  id: string;
  business_name: string;
  case_name: string;
  case_number: string;
  court_name: string;
  case_date: string;
  case_url: string;
  case_summary?: string;
  search_query: string;
  created_at: string;
  updated_at: string;
}

export interface SearchCourtRecordsResponse {
  success: boolean;
  records: CourtRecord[];
  totalFound: number;
  cached: boolean;
  error?: string;
}

export const searchCourtRecords = async (businessName: string): Promise<SearchCourtRecordsResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('search-court-records', {
      body: { businessName }
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error calling court records function:', error);
    throw new Error('Failed to search court records');
  }
};

export const getUserCourtRecords = async (userId: string): Promise<CourtRecord[]> => {
  const { data, error } = await supabase
    .from('court_records')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching court records:', error);
    throw new Error('Failed to fetch court records');
  }

  return data || [];
};

export const deleteCourtRecord = async (recordId: string): Promise<void> => {
  const { error } = await supabase
    .from('court_records')
    .delete()
    .eq('id', recordId);

  if (error) {
    console.error('Error deleting court record:', error);
    throw new Error('Failed to delete court record');
  }
};
