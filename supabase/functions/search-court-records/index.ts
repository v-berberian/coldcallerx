
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NYSCEFResult {
  caseNumber: string;
  caseName: string;
  court: string;
  filingDate: string;
  caseUrl: string;
  snippet?: string;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const scrapeNYSCEF = async (businessName: string): Promise<NYSCEFResult[]> => {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0'
  ];
  
  const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
  
  try {
    console.log(`Starting NYSCEF search for: ${businessName}`);
    
    // First, get the search form page to extract any required tokens
    const formResponse = await fetch('https://iapps.courts.state.ny.us/nyscef/CaseSearch', {
      headers: {
        'User-Agent': randomUserAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    if (!formResponse.ok) {
      throw new Error(`Failed to load search form: ${formResponse.status}`);
    }

    const formHtml = await formResponse.text();
    const formDoc = new DOMParser().parseFromString(formHtml, 'text/html');
    
    // Extract any form tokens or required fields
    const viewStateElement = formDoc?.querySelector('input[name="__VIEWSTATE"]');
    const viewStateValue = viewStateElement?.getAttribute('value') || '';
    
    const eventValidationElement = formDoc?.querySelector('input[name="__EVENTVALIDATION"]');
    const eventValidationValue = eventValidationElement?.getAttribute('value') || '';
    
    console.log('Extracted form tokens, preparing search request');
    
    // Add delay to be respectful
    await delay(2000 + Math.random() * 1000);
    
    // Prepare search form data
    const formData = new URLSearchParams();
    formData.append('__VIEWSTATE', viewStateValue);
    formData.append('__EVENTVALIDATION', eventValidationValue);
    formData.append('ctl00$MainContent$txtCaseName', businessName);
    formData.append('ctl00$MainContent$btnSearch', 'Search');
    
    // Submit the search
    const searchResponse = await fetch('https://iapps.courts.state.ny.us/nyscef/CaseSearch', {
      method: 'POST',
      headers: {
        'User-Agent': randomUserAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Connection': 'keep-alive',
        'Referer': 'https://iapps.courts.state.ny.us/nyscef/CaseSearch',
        'Upgrade-Insecure-Requests': '1',
      },
      body: formData.toString(),
    });

    if (!searchResponse.ok) {
      throw new Error(`Search request failed: ${searchResponse.status}`);
    }

    const resultsHtml = await searchResponse.text();
    console.log('Received search results, parsing HTML');
    
    // Check for CAPTCHA or blocking
    if (resultsHtml.includes('captcha') || resultsHtml.includes('blocked') || resultsHtml.includes('robot')) {
      throw new Error('CAPTCHA or access restriction detected');
    }
    
    const resultsDoc = new DOMParser().parseFromString(resultsHtml, 'text/html');
    const results: NYSCEFResult[] = [];
    
    // Parse the results table
    const resultRows = resultsDoc?.querySelectorAll('table.GridView tr');
    
    if (!resultRows || resultRows.length <= 1) {
      console.log('No results found in the table');
      return results;
    }
    
    // Skip header row (index 0)
    for (let i = 1; i < resultRows.length; i++) {
      const row = resultRows[i];
      const cells = row.querySelectorAll('td');
      
      if (cells.length >= 4) {
        try {
          const caseNumberCell = cells[0];
          const caseNameCell = cells[1];
          const courtCell = cells[2];
          const filingDateCell = cells[3];
          
          // Extract case number and link
          const caseLink = caseNumberCell.querySelector('a');
          const caseNumber = caseLink?.textContent?.trim() || caseNumberCell.textContent?.trim() || '';
          const caseHref = caseLink?.getAttribute('href') || '';
          const caseUrl = caseHref.startsWith('http') ? caseHref : `https://iapps.courts.state.ny.us/nyscef/${caseHref}`;
          
          const caseName = caseNameCell.textContent?.trim() || '';
          const court = courtCell.textContent?.trim() || '';
          const filingDate = filingDateCell.textContent?.trim() || '';
          
          if (caseNumber && caseName) {
            results.push({
              caseNumber,
              caseName,
              court,
              filingDate,
              caseUrl,
              snippet: `${caseName.substring(0, 200)}${caseName.length > 200 ? '...' : ''}`
            });
          }
        } catch (parseError) {
          console.error('Error parsing row:', parseError);
          continue;
        }
      }
    }
    
    console.log(`Successfully parsed ${results.length} results`);
    return results;
    
  } catch (error) {
    console.error('NYSCEF scraping error:', error);
    throw error;
  }
};

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

    // Scrape NYSCEF for new results
    const nyscefResults = await scrapeNYSCEF(businessName);
    
    console.log(`Found ${nyscefResults.length} results from NYSCEF`);

    // Process and store results
    const courtRecords = [];
    
    for (const result of nyscefResults.slice(0, 10)) { // Limit to first 10 results
      const recordData = {
        user_id: user.id,
        business_name: businessName,
        case_name: result.caseName,
        case_number: result.caseNumber,
        court_name: result.court,
        case_date: result.filingDate ? new Date(result.filingDate).toISOString().split('T')[0] : null,
        case_url: result.caseUrl,
        case_summary: result.snippet || null,
        search_query: businessName,
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
        totalFound: nyscefResults.length,
        cached: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in search-court-records function:', error);
    
    // Return a more specific error message
    let errorMessage = 'Internal server error';
    if (error.message.includes('CAPTCHA')) {
      errorMessage = 'Access temporarily restricted. Please try again later.';
    } else if (error.message.includes('Failed to load')) {
      errorMessage = 'Court records service temporarily unavailable.';
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
