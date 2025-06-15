
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CourtListenerResponse {
  count: number;
  results: Array<{
    id: number;
    case_name: string;
    docket_number: string;
    court: {
      full_name: string;
    };
    date_filed: string;
    absolute_url: string;
    snippet?: string;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessName } = await req.json();
    
    if (!businessName) {
      return new Response(
        JSON.stringify({ error: 'Business name is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Searching court records for: ${businessName}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if we already have recent results for this business name
    const { data: existingRecords } = await supabase
      .from('court_records')
      .select('*')
      .eq('user_id', user.id)
      .eq('business_name', businessName)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // 24 hours ago
      .order('created_at', { ascending: false });

    if (existingRecords && existingRecords.length > 0) {
      console.log(`Returning cached results for ${businessName}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          records: existingRecords,
          cached: true 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Search CourtListener API
    const searchQuery = encodeURIComponent(`"${businessName}"`);
    const courtListenerUrl = `https://www.courtlistener.com/api/rest/v3/search/?type=o&q=${searchQuery}&court=nysd,nyed,nynd,nywd,nysupct&format=json`;
    
    console.log(`Searching CourtListener: ${courtListenerUrl}`);
    
    const response = await fetch(courtListenerUrl, {
      headers: {
        'User-Agent': 'ColdCaller-App/1.0 (Legal Research Tool)',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`CourtListener API error: ${response.status}`);
      return new Response(
        JSON.stringify({ error: 'Court records service unavailable' }),
        { 
          status: 503, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data: CourtListenerResponse = await response.json();
    console.log(`Found ${data.count} results from CourtListener`);

    // Process and store results
    const courtRecords = [];
    
    for (const result of data.results.slice(0, 10)) { // Limit to first 10 results
      const recordData = {
        user_id: user.id,
        business_name: businessName,
        case_name: result.case_name,
        case_number: result.docket_number,
        court_name: result.court.full_name,
        case_date: result.date_filed ? new Date(result.date_filed).toISOString().split('T')[0] : null,
        case_url: `https://www.courtlistener.com${result.absolute_url}`,
        case_summary: result.snippet || null,
        search_query: searchQuery,
      };

      // Insert into database
      const { data: insertedRecord, error: insertError } = await supabase
        .from('court_records')
        .insert(recordData)
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting court record:', insertError);
      } else {
        courtRecords.push(insertedRecord);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        records: courtRecords,
        totalFound: data.count,
        cached: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in search-court-records function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
