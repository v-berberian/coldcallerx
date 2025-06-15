
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

const getRandomUserAgent = () => {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
};

const createRealisticHeaders = (userAgent: string, referer?: string, cookie?: string) => {
  const headers: Record<string, string> = {
    'User-Agent': userAgent,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'DNT': '1'
  };
  
  if (referer) {
    headers['Referer'] = referer;
    headers['Sec-Fetch-Site'] = 'same-origin';
  }
  
  if (cookie) {
    headers['Cookie'] = cookie;
  }
  
  return headers;
};

const scrapeNYSCEF = async (businessName: string): Promise<NYSCEFResult[]> => {
  const userAgent = getRandomUserAgent();
  let sessionCookie = '';
  
  try {
    console.log(`Starting NYSCEF search for: ${businessName}`);
    
    // Add longer initial delay
    await delay(2000 + Math.random() * 3000);
    
    const baseUrl = 'https://iapps.courts.state.ny.us';
    const searchUrl = `${baseUrl}/nyscef/CaseSearch`;
    
    // Step 1: Visit homepage first to establish session
    console.log('Establishing session...');
    const homeResponse = await fetch(baseUrl, {
      method: 'GET',
      headers: createRealisticHeaders(userAgent),
    });

    if (!homeResponse.ok) {
      throw new Error(`Failed to establish session: ${homeResponse.status}`);
    }

    // Extract session cookies
    const setCookieHeaders = homeResponse.headers.get('set-cookie');
    if (setCookieHeaders) {
      sessionCookie = setCookieHeaders.split(';')[0];
      console.log('Session established with cookies');
    }

    // Longer delay before accessing search page
    await delay(3000 + Math.random() * 4000);
    
    // Step 2: Get the search form page with session
    console.log('Fetching search form page...');
    const formResponse = await fetch(searchUrl, {
      method: 'GET',
      headers: createRealisticHeaders(userAgent, baseUrl, sessionCookie),
    });

    console.log(`Form page response status: ${formResponse.status}`);
    
    if (!formResponse.ok) {
      if (formResponse.status === 403 || formResponse.status === 429) {
        throw new Error('Rate limited or blocked by NYSCEF - please try again later');
      }
      throw new Error(`Failed to load search form: ${formResponse.status}`);
    }

    const formHtml = await formResponse.text();
    console.log(`Form HTML length: ${formHtml.length}`);
    
    // More thorough blocking detection
    const blockingIndicators = [
      'access denied', 'blocked', 'captcha', 'robot', 'security',
      'unauthorized', 'forbidden', 'too many requests', 'rate limit'
    ];
    
    const htmlLower = formHtml.toLowerCase();
    for (const indicator of blockingIndicators) {
      if (htmlLower.includes(indicator)) {
        throw new Error(`Access restriction detected: ${indicator}`);
      }
    }
    
    const formDoc = new DOMParser().parseFromString(formHtml, 'text/html');
    
    if (!formDoc) {
      throw new Error('Failed to parse form HTML');
    }
    
    // Extract form tokens with better selectors
    const viewStateElement = formDoc.querySelector('input[name="__VIEWSTATE"]');
    const viewStateValue = viewStateElement?.getAttribute('value') || '';
    
    const eventValidationElement = formDoc.querySelector('input[name="__EVENTVALIDATION"]');
    const eventValidationValue = eventValidationElement?.getAttribute('value') || '';
    
    const viewStateGeneratorElement = formDoc.querySelector('input[name="__VIEWSTATEGENERATOR"]');
    const viewStateGeneratorValue = viewStateGeneratorElement?.getAttribute('value') || '';
    
    console.log(`Extracted tokens - ViewState: ${viewStateValue.length > 0 ? 'present' : 'missing'}, EventValidation: ${eventValidationValue.length > 0 ? 'present' : 'missing'}`);
    
    if (!viewStateValue || !eventValidationValue) {
      console.log('Missing required form tokens - page structure may have changed');
      // Try to continue anyway
    }
    
    // Much longer delay before submitting search
    await delay(4000 + Math.random() * 5000);
    
    // Step 3: Submit the search with all tokens
    console.log('Submitting search request...');
    
    const formData = new URLSearchParams();
    formData.append('__VIEWSTATE', viewStateValue);
    formData.append('__VIEWSTATEGENERATOR', viewStateGeneratorValue);
    formData.append('__EVENTVALIDATION', eventValidationValue);
    formData.append('ctl00$MainContent$txtCaseName', businessName);
    formData.append('ctl00$MainContent$btnSearch', 'Search');
    
    const searchResponse = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        ...createRealisticHeaders(userAgent, searchUrl, sessionCookie),
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': baseUrl,
      },
      body: formData.toString(),
    });

    console.log(`Search response status: ${searchResponse.status}`);

    if (!searchResponse.ok) {
      if (searchResponse.status === 403 || searchResponse.status === 429) {
        throw new Error('Search blocked or rate limited by NYSCEF');
      }
      throw new Error(`Search request failed: ${searchResponse.status}`);
    }

    const resultsHtml = await searchResponse.text();
    console.log(`Results HTML length: ${resultsHtml.length}`);
    
    // Check for blocking in results
    const resultsLower = resultsHtml.toLowerCase();
    for (const indicator of blockingIndicators) {
      if (resultsLower.includes(indicator)) {
        throw new Error(`Access restriction in results: ${indicator}`);
      }
    }
    
    const resultsDoc = new DOMParser().parseFromString(resultsHtml, 'text/html');
    
    if (!resultsDoc) {
      throw new Error('Failed to parse results HTML');
    }
    
    const results: NYSCEFResult[] = [];
    
    // Try multiple selectors for the results table
    const possibleSelectors = [
      'table#ctl00_MainContent_gvResults tr',
      'table[id*="gvResults"] tr',
      'table.GridView tr',
      'table[id*="GridView"] tr',
      'table[class*="grid"] tr',
      '.results-table tr',
      'table tr'
    ];
    
    let resultRows = null;
    for (const selector of possibleSelectors) {
      resultRows = resultsDoc.querySelectorAll(selector);
      if (resultRows && resultRows.length > 1) {
        console.log(`Found results table with selector: ${selector}, rows: ${resultRows.length}`);
        break;
      }
    }
    
    if (!resultRows || resultRows.length <= 1) {
      console.log('No results table found - checking for messages');
      
      // Check for "no results" or other messages
      const messageSelectors = [
        '.no-results', '.message', '.alert', 
        '[id*="Label"]', '[id*="Message"]',
        '.info', '.warning'
      ];
      
      for (const selector of messageSelectors) {
        const messageElement = resultsDoc.querySelector(selector);
        if (messageElement) {
          const messageText = messageElement.textContent?.toLowerCase() || '';
          console.log(`Found message: ${messageText}`);
          if (messageText.includes('no cases found') || 
              messageText.includes('no results') || 
              messageText.includes('0 records')) {
            return results; // Return empty array for no results
          }
        }
      }
      
      console.log('Could not determine results status - returning empty array');
      return results;
    }
    
    console.log(`Processing ${resultRows.length - 1} result rows`);
    
    // Process results (skip header row)
    for (let i = 1; i < resultRows.length && i <= 11; i++) {
      const row = resultRows[i];
      const cells = row.querySelectorAll('td');
      
      if (cells.length >= 2) {
        try {
          const caseNumberCell = cells[0];
          const caseNameCell = cells[1];
          const courtCell = cells.length > 2 ? cells[2] : null;
          const filingDateCell = cells.length > 3 ? cells[3] : null;
          
          // Extract case number and link
          const caseLink = caseNumberCell.querySelector('a');
          const caseNumber = (caseLink?.textContent || caseNumberCell.textContent || '').trim();
          const caseHref = caseLink?.getAttribute('href') || '';
          
          let caseUrl = '';
          if (caseHref) {
            caseUrl = caseHref.startsWith('http') ? caseHref : `${baseUrl}${caseHref.startsWith('/') ? '' : '/'}${caseHref}`;
          }
          
          const caseName = (caseNameCell.textContent || '').trim();
          const court = courtCell ? (courtCell.textContent || '').trim() : 'New York Supreme Court';
          const filingDate = filingDateCell ? (filingDateCell.textContent || '').trim() : '';
          
          if (caseNumber && caseName) {
            results.push({
              caseNumber,
              caseName,
              court,
              filingDate,
              caseUrl,
              snippet: caseName.length > 200 ? `${caseName.substring(0, 200)}...` : caseName
            });
            
            console.log(`Parsed case: ${caseNumber} - ${caseName.substring(0, 50)}${caseName.length > 50 ? '...' : ''}`);
          }
        } catch (parseError) {
          console.error('Error parsing row:', parseError);
          continue;
        }
      }
    }
    
    console.log(`Successfully parsed ${results.length} court records`);
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

    // Check for cached results
    const { data: existingRecords } = await supabase
      .from('court_records')
      .select('*')
      .eq('user_id', user.id)
      .eq('business_name', businessName)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
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
    
    for (const result of nyscefResults.slice(0, 10)) {
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
    
    // Return specific error messages
    let errorMessage = 'Internal server error';
    let statusCode = 500;
    
    if (error.message.includes('Rate limited') || 
        error.message.includes('blocked') || 
        error.message.includes('restriction')) {
      errorMessage = 'Court records service temporarily unavailable. The website may be blocking automated requests. Please try again in a few minutes.';
      statusCode = 503;
    } else if (error.message.includes('Failed to establish session') || 
               error.message.includes('Failed to load')) {
      errorMessage = 'Unable to connect to court records service. Please try again later.';
      statusCode = 503;
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: statusCode, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
