import { Lead, TemperatureFilter } from '../types/lead';
import { appStorage } from './storage';

const AREA_CODE_MAP: {
  [key: string]: {
    state: string;
    timezone: string;
  };
} = {
  '201': { state: 'NJ', timezone: 'America/New_York' },
  '202': { state: 'DC', timezone: 'America/New_York' },
  '203': { state: 'CT', timezone: 'America/New_York' },
  '205': { state: 'AL', timezone: 'America/Chicago' },
  '206': { state: 'WA', timezone: 'America/Los_Angeles' },
  '207': { state: 'ME', timezone: 'America/New_York' },
  '208': { state: 'ID', timezone: 'America/Boise' },
  '209': { state: 'CA', timezone: 'America/Los_Angeles' },
  '210': { state: 'TX', timezone: 'America/Chicago' },
  '212': { state: 'NY', timezone: 'America/New_York' },
  '213': { state: 'CA', timezone: 'America/Los_Angeles' },
  '214': { state: 'TX', timezone: 'America/Chicago' },
  '215': { state: 'PA', timezone: 'America/New_York' },
  '216': { state: 'OH', timezone: 'America/New_York' },
  '217': { state: 'IL', timezone: 'America/Chicago' },
  '218': { state: 'MN', timezone: 'America/Chicago' },
  // Northwest Indiana uses Central time
  '219': { state: 'IN', timezone: 'America/Chicago' },
  '224': { state: 'IL', timezone: 'America/Chicago' },
  '225': { state: 'LA', timezone: 'America/Chicago' },
  '228': { state: 'MS', timezone: 'America/Chicago' },
  '229': { state: 'GA', timezone: 'America/New_York' },
  '231': { state: 'MI', timezone: 'America/New_York' },
  '234': { state: 'OH', timezone: 'America/New_York' },
  '239': { state: 'FL', timezone: 'America/New_York' },
  '240': { state: 'MD', timezone: 'America/New_York' },
  '248': { state: 'MI', timezone: 'America/New_York' },
  '251': { state: 'AL', timezone: 'America/Chicago' },
  '252': { state: 'NC', timezone: 'America/New_York' },
  '253': { state: 'WA', timezone: 'America/Los_Angeles' },
  '254': { state: 'TX', timezone: 'America/Chicago' },
  '256': { state: 'AL', timezone: 'America/Chicago' },
  '260': { state: 'IN', timezone: 'America/New_York' },
  '262': { state: 'WI', timezone: 'America/Chicago' },
  '267': { state: 'PA', timezone: 'America/New_York' },
  '269': { state: 'MI', timezone: 'America/New_York' },
  '270': { state: 'KY', timezone: 'America/Chicago' },
  '276': { state: 'VA', timezone: 'America/New_York' },
  '281': { state: 'TX', timezone: 'America/Chicago' },
  '301': { state: 'MD', timezone: 'America/New_York' },
  '302': { state: 'DE', timezone: 'America/New_York' },
  '303': { state: 'CO', timezone: 'America/Denver' },
  '304': { state: 'WV', timezone: 'America/New_York' },
  '305': { state: 'FL', timezone: 'America/New_York' },
  '307': { state: 'WY', timezone: 'America/Denver' },
  '308': { state: 'NE', timezone: 'America/Chicago' },
  '309': { state: 'IL', timezone: 'America/Chicago' },
  '310': { state: 'CA', timezone: 'America/Los_Angeles' },
  '312': { state: 'IL', timezone: 'America/Chicago' },
  '313': { state: 'MI', timezone: 'America/New_York' },
  '314': { state: 'MO', timezone: 'America/Chicago' },
  '315': { state: 'NY', timezone: 'America/New_York' },
  '316': { state: 'KS', timezone: 'America/Chicago' },
  '317': { state: 'IN', timezone: 'America/New_York' },
  '318': { state: 'LA', timezone: 'America/Chicago' },
  '319': { state: 'IA', timezone: 'America/Chicago' },
  '320': { state: 'MN', timezone: 'America/Chicago' },
  '321': { state: 'FL', timezone: 'America/New_York' },
  '323': { state: 'CA', timezone: 'America/Los_Angeles' },
  '330': { state: 'OH', timezone: 'America/New_York' },
  '331': { state: 'IL', timezone: 'America/Chicago' },
  '334': { state: 'AL', timezone: 'America/Chicago' },
  '336': { state: 'NC', timezone: 'America/New_York' },
  '337': { state: 'LA', timezone: 'America/Chicago' },
  '339': { state: 'MA', timezone: 'America/New_York' },
  '346': { state: 'TX', timezone: 'America/Chicago' },
  '347': { state: 'NY', timezone: 'America/New_York' },
  '351': { state: 'MA', timezone: 'America/New_York' },
  '352': { state: 'FL', timezone: 'America/New_York' },
  '360': { state: 'WA', timezone: 'America/Los_Angeles' },
  '361': { state: 'TX', timezone: 'America/Chicago' },
  '386': { state: 'FL', timezone: 'America/New_York' },
  '401': { state: 'RI', timezone: 'America/New_York' },
  '402': { state: 'NE', timezone: 'America/Chicago' },
  '404': { state: 'GA', timezone: 'America/New_York' },
  '405': { state: 'OK', timezone: 'America/Chicago' },
  '406': { state: 'MT', timezone: 'America/Denver' },
  '407': { state: 'FL', timezone: 'America/New_York' },
  '408': { state: 'CA', timezone: 'America/Los_Angeles' },
  '409': { state: 'TX', timezone: 'America/Chicago' },
  '410': { state: 'MD', timezone: 'America/New_York' },
  '412': { state: 'PA', timezone: 'America/New_York' },
  '413': { state: 'MA', timezone: 'America/New_York' },
  '414': { state: 'WI', timezone: 'America/Chicago' },
  '415': { state: 'CA', timezone: 'America/Los_Angeles' },
  '417': { state: 'MO', timezone: 'America/Chicago' },
  '419': { state: 'OH', timezone: 'America/New_York' },
  '423': { state: 'TN', timezone: 'America/New_York' },
  '424': { state: 'CA', timezone: 'America/Los_Angeles' },
  '425': { state: 'WA', timezone: 'America/Los_Angeles' },
  '430': { state: 'TX', timezone: 'America/Chicago' },
  '432': { state: 'TX', timezone: 'America/Chicago' },
  '434': { state: 'VA', timezone: 'America/New_York' },
  '435': { state: 'UT', timezone: 'America/Denver' },
  '440': { state: 'OH', timezone: 'America/New_York' },
  '443': { state: 'MD', timezone: 'America/New_York' },
  '458': { state: 'OR', timezone: 'America/Los_Angeles' },
  '469': { state: 'TX', timezone: 'America/Chicago' },
  '470': { state: 'GA', timezone: 'America/New_York' },
  '475': { state: 'CT', timezone: 'America/New_York' },
  '478': { state: 'GA', timezone: 'America/New_York' },
  '479': { state: 'AR', timezone: 'America/Chicago' },
  '480': { state: 'AZ', timezone: 'America/Phoenix' },
  '484': { state: 'PA', timezone: 'America/New_York' },
  '501': { state: 'AR', timezone: 'America/Chicago' },
  '502': { state: 'KY', timezone: 'America/New_York' },
  '503': { state: 'OR', timezone: 'America/Los_Angeles' },
  '504': { state: 'LA', timezone: 'America/Chicago' },
  '505': { state: 'NM', timezone: 'America/Denver' },
  '507': { state: 'MN', timezone: 'America/Chicago' },
  '508': { state: 'MA', timezone: 'America/New_York' },
  '509': { state: 'WA', timezone: 'America/Los_Angeles' },
  '510': { state: 'CA', timezone: 'America/Los_Angeles' },
  '512': { state: 'TX', timezone: 'America/Chicago' },
  '513': { state: 'OH', timezone: 'America/New_York' },
  '515': { state: 'IA', timezone: 'America/Chicago' },
  '516': { state: 'NY', timezone: 'America/New_York' },
  '517': { state: 'MI', timezone: 'America/New_York' },
  '518': { state: 'NY', timezone: 'America/New_York' },
  '520': { state: 'AZ', timezone: 'America/Phoenix' },
  '530': { state: 'CA', timezone: 'America/Los_Angeles' },
  '540': { state: 'VA', timezone: 'America/New_York' },
  '541': { state: 'OR', timezone: 'America/Los_Angeles' },
  '551': { state: 'NJ', timezone: 'America/New_York' },
  '559': { state: 'CA', timezone: 'America/Los_Angeles' },
  '561': { state: 'FL', timezone: 'America/New_York' },
  '562': { state: 'CA', timezone: 'America/Los_Angeles' },
  '563': { state: 'IA', timezone: 'America/Chicago' },
  '567': { state: 'OH', timezone: 'America/New_York' },
  '570': { state: 'PA', timezone: 'America/New_York' },
  '571': { state: 'VA', timezone: 'America/New_York' },
  '573': { state: 'MO', timezone: 'America/Chicago' },
  '574': { state: 'IN', timezone: 'America/New_York' },
  '575': { state: 'NM', timezone: 'America/Denver' },
  '580': { state: 'OK', timezone: 'America/Chicago' },
  '585': { state: 'NY', timezone: 'America/New_York' },
  '586': { state: 'MI', timezone: 'America/New_York' },
  '601': { state: 'MS', timezone: 'America/Chicago' },
  '602': { state: 'AZ', timezone: 'America/Phoenix' },
  '603': { state: 'NH', timezone: 'America/New_York' },
  '605': { state: 'SD', timezone: 'America/Chicago' },
  '606': { state: 'KY', timezone: 'America/New_York' },
  '607': { state: 'NY', timezone: 'America/New_York' },
  '608': { state: 'WI', timezone: 'America/Chicago' },
  '609': { state: 'NJ', timezone: 'America/New_York' },
  '610': { state: 'PA', timezone: 'America/New_York' },
  '612': { state: 'MN', timezone: 'America/Chicago' },
  '614': { state: 'OH', timezone: 'America/New_York' },
  '615': { state: 'TN', timezone: 'America/Chicago' },
  '616': { state: 'MI', timezone: 'America/New_York' },
  '617': { state: 'MA', timezone: 'America/New_York' },
  '618': { state: 'IL', timezone: 'America/Chicago' },
  '619': { state: 'CA', timezone: 'America/Los_Angeles' },
  '620': { state: 'KS', timezone: 'America/Chicago' },
  '623': { state: 'AZ', timezone: 'America/Phoenix' },
  '626': { state: 'CA', timezone: 'America/Los_Angeles' },
  '630': { state: 'IL', timezone: 'America/Chicago' },
  '631': { state: 'NY', timezone: 'America/New_York' },
  '636': { state: 'MO', timezone: 'America/Chicago' },
  '641': { state: 'IA', timezone: 'America/Chicago' },
  '646': { state: 'NY', timezone: 'America/New_York' },
  '650': { state: 'CA', timezone: 'America/Los_Angeles' },
  '651': { state: 'MN', timezone: 'America/Chicago' },
  '660': { state: 'MO', timezone: 'America/Chicago' },
  '661': { state: 'CA', timezone: 'America/Los_Angeles' },
  '662': { state: 'MS', timezone: 'America/Chicago' },
  '678': { state: 'GA', timezone: 'America/New_York' },
  '682': { state: 'TX', timezone: 'America/Chicago' },
  '701': { state: 'ND', timezone: 'America/Chicago' },
  '702': { state: 'NV', timezone: 'America/Los_Angeles' },
  '703': { state: 'VA', timezone: 'America/New_York' },
  '704': { state: 'NC', timezone: 'America/New_York' },
  '706': { state: 'GA', timezone: 'America/New_York' },
  '707': { state: 'CA', timezone: 'America/Los_Angeles' },
  '708': { state: 'IL', timezone: 'America/Chicago' },
  '712': { state: 'IA', timezone: 'America/Chicago' },
  '713': { state: 'TX', timezone: 'America/Chicago' },
  '714': { state: 'CA', timezone: 'America/Los_Angeles' },
  '715': { state: 'WI', timezone: 'America/Chicago' },
  '716': { state: 'NY', timezone: 'America/New_York' },
  '717': { state: 'PA', timezone: 'America/New_York' },
  '718': { state: 'NY', timezone: 'America/New_York' },
  '719': { state: 'CO', timezone: 'America/Denver' },
  '720': { state: 'CO', timezone: 'America/Denver' },
  '724': { state: 'PA', timezone: 'America/New_York' },
  '727': { state: 'FL', timezone: 'America/New_York' },
  '731': { state: 'TN', timezone: 'America/Chicago' },
  '732': { state: 'NJ', timezone: 'America/New_York' },
  '734': { state: 'MI', timezone: 'America/New_York' },
  '737': { state: 'TX', timezone: 'America/Chicago' },
  '740': { state: 'OH', timezone: 'America/New_York' },
  '757': { state: 'VA', timezone: 'America/New_York' },
  '760': { state: 'CA', timezone: 'America/Los_Angeles' },
  '763': { state: 'MN', timezone: 'America/Chicago' },
  '765': { state: 'IN', timezone: 'America/New_York' },
  '770': { state: 'GA', timezone: 'America/New_York' },
  '772': { state: 'FL', timezone: 'America/New_York' },
  '773': { state: 'IL', timezone: 'America/Chicago' },
  '774': { state: 'MA', timezone: 'America/New_York' },
  '775': { state: 'NV', timezone: 'America/Los_Angeles' },
  '781': { state: 'MA', timezone: 'America/New_York' },
  '785': { state: 'KS', timezone: 'America/Chicago' },
  '786': { state: 'FL', timezone: 'America/New_York' },
  '801': { state: 'UT', timezone: 'America/Denver' },
  '802': { state: 'VT', timezone: 'America/New_York' },
  '803': { state: 'SC', timezone: 'America/New_York' },
  '804': { state: 'VA', timezone: 'America/New_York' },
  '805': { state: 'CA', timezone: 'America/Los_Angeles' },
  '806': { state: 'TX', timezone: 'America/Chicago' },
  '808': { state: 'HI', timezone: 'Pacific/Honolulu' },
  '810': { state: 'MI', timezone: 'America/New_York' },
  '812': { state: 'IN', timezone: 'America/New_York' },
  '813': { state: 'FL', timezone: 'America/New_York' },
  '814': { state: 'PA', timezone: 'America/New_York' },
  '815': { state: 'IL', timezone: 'America/Chicago' },
  '816': { state: 'MO', timezone: 'America/Chicago' },
  '817': { state: 'TX', timezone: 'America/Chicago' },
  '818': { state: 'CA', timezone: 'America/Los_Angeles' },
  '828': { state: 'NC', timezone: 'America/New_York' },
  '830': { state: 'TX', timezone: 'America/Chicago' },
  '831': { state: 'CA', timezone: 'America/Los_Angeles' },
  '832': { state: 'TX', timezone: 'America/Chicago' },
  '843': { state: 'SC', timezone: 'America/New_York' },
  '845': { state: 'NY', timezone: 'America/New_York' },
  '847': { state: 'IL', timezone: 'America/Chicago' },
  '850': { state: 'FL', timezone: 'America/Chicago' },
  '856': { state: 'NJ', timezone: 'America/New_York' },
  '857': { state: 'MA', timezone: 'America/New_York' },
  '858': { state: 'CA', timezone: 'America/Los_Angeles' },
  '859': { state: 'KY', timezone: 'America/New_York' },
  '860': { state: 'CT', timezone: 'America/New_York' },
  '862': { state: 'NJ', timezone: 'America/New_York' },
  '863': { state: 'FL', timezone: 'America/New_York' },
  '864': { state: 'SC', timezone: 'America/New_York' },
  '865': { state: 'TN', timezone: 'America/New_York' },
  '870': { state: 'AR', timezone: 'America/Chicago' },
  '872': { state: 'IL', timezone: 'America/Chicago' },
  '878': { state: 'PA', timezone: 'America/New_York' },
  '901': { state: 'TN', timezone: 'America/Chicago' },
  '903': { state: 'TX', timezone: 'America/Chicago' },
  '904': { state: 'FL', timezone: 'America/New_York' },
  '906': { state: 'MI', timezone: 'America/New_York' },
  '907': { state: 'AK', timezone: 'America/Anchorage' },
  '908': { state: 'NJ', timezone: 'America/New_York' },
  '909': { state: 'CA', timezone: 'America/Los_Angeles' },
  '910': { state: 'NC', timezone: 'America/New_York' },
  '912': { state: 'GA', timezone: 'America/New_York' },
  '913': { state: 'KS', timezone: 'America/Chicago' },
  '914': { state: 'NY', timezone: 'America/New_York' },
  '915': { state: 'TX', timezone: 'America/Denver' },
  '916': { state: 'CA', timezone: 'America/Los_Angeles' },
  '917': { state: 'NY', timezone: 'America/New_York' },
  '918': { state: 'OK', timezone: 'America/Chicago' },
  '919': { state: 'NC', timezone: 'America/New_York' },
  '920': { state: 'WI', timezone: 'America/Chicago' },
  '925': { state: 'CA', timezone: 'America/Los_Angeles' },
  '928': { state: 'AZ', timezone: 'America/Phoenix' },
  '929': { state: 'NY', timezone: 'America/New_York' },
  '931': { state: 'TN', timezone: 'America/Chicago' },
  '936': { state: 'TX', timezone: 'America/Chicago' },
  '937': { state: 'OH', timezone: 'America/New_York' },
  '940': { state: 'TX', timezone: 'America/Chicago' },
  '941': { state: 'FL', timezone: 'America/New_York' },
  '947': { state: 'MI', timezone: 'America/New_York' },
  '949': { state: 'CA', timezone: 'America/Los_Angeles' },
  '951': { state: 'CA', timezone: 'America/Los_Angeles' },
  '952': { state: 'MN', timezone: 'America/Chicago' },
  '954': { state: 'FL', timezone: 'America/New_York' },
  '956': { state: 'TX', timezone: 'America/Chicago' },
  '959': { state: 'CT', timezone: 'America/New_York' },
  '970': { state: 'CO', timezone: 'America/Denver' },
  '971': { state: 'OR', timezone: 'America/Los_Angeles' },
  '972': { state: 'TX', timezone: 'America/Chicago' },
  '973': { state: 'NJ', timezone: 'America/New_York' },
  '978': { state: 'MA', timezone: 'America/New_York' },
  '979': { state: 'TX', timezone: 'America/Chicago' },
  '980': { state: 'NC', timezone: 'America/New_York' },
  '984': { state: 'NC', timezone: 'America/New_York' },
  '985': { state: 'LA', timezone: 'America/Chicago' },
  '989': { state: 'MI', timezone: 'America/New_York' }
};

// Cache for timezone groups to avoid recalculation
const timezoneGroupCache = new Map<string, 'EST' | 'CST' | 'OTHER'>();

export const getStateFromAreaCode = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 3) {
    const areaCode = digits.slice(0, 3);
    const info = AREA_CODE_MAP[areaCode];
    if (info) {
      const now = new Date();
      const timeInZone = new Date(now.toLocaleString("en-US", {
        timeZone: info.timezone
      }));
      const timeString = timeInZone.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      return `${info.state} (${timeString})`;
    }
  }
  return '';
};

export const getTimezoneGroup = (phone: string): 'EST' | 'CST' | 'OTHER' => {
  // Check cache first
  if (timezoneGroupCache.has(phone)) {
    return timezoneGroupCache.get(phone)!;
  }

  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 3) {
    const areaCode = digits.slice(0, 3);
    const info = AREA_CODE_MAP[areaCode];
    if (info) {
      if (info.timezone === 'America/New_York') {
        timezoneGroupCache.set(phone, 'EST');
        return 'EST';
      }
      if (info.timezone === 'America/Chicago') {
        timezoneGroupCache.set(phone, 'CST');
        return 'CST';
      }
      // Note: CDT is effectively the same as CST (Chicago timezone), just different seasons
      // The Chicago timezone automatically handles daylight saving time
    }
  }
  
  timezoneGroupCache.set(phone, 'OTHER');
  return 'OTHER';
};

export const filterLeadsByTimezone = (leads: Lead[], timezoneFilter: 'ALL' | 'EST_CST'): Lead[] => {
  if (timezoneFilter === 'ALL') return leads;
  
  // For large lists, use a more efficient approach
  if (leads.length > 1000) {
    const results: Lead[] = [];
    for (const lead of leads) {
      const timezoneGroup = getTimezoneGroup(lead.phone);
      if (timezoneGroup === 'EST' || timezoneGroup === 'CST') {
        results.push(lead);
      }
    }
    return results;
  }
  
  // For smaller lists, use filter method
  return leads.filter(lead => {
    const timezoneGroup = getTimezoneGroup(lead.phone);
    return timezoneGroup === 'EST' || timezoneGroup === 'CST';
  });
};

export const filterLeadsByTemperature = async (
  leads: Lead[], 
  temperatureFilter: TemperatureFilter,
  csvId: string
): Promise<Lead[]> => {
  if (temperatureFilter === 'ALL') return leads;
  
  try {
    const leadTags = await appStorage.getCSVLeadTags(csvId);
    
    // For large lists, use a more efficient approach
    if (leads.length > 1000) {
      const results: Lead[] = [];
      for (const lead of leads) {
        const leadKey = `${lead.name}__${lead.phone}`;
        const leadTag = leadTags[leadKey];
        if (leadTag === temperatureFilter.toLowerCase()) {
          results.push(lead);
        }
      }
      return results;
    }
    
    // For smaller lists, use filter method
    return leads.filter(lead => {
      const leadKey = `${lead.name}__${lead.phone}`;
      const leadTag = leadTags[leadKey];
      return leadTag === temperatureFilter.toLowerCase();
    });
  } catch (error) {
    console.error('Error filtering leads by temperature:', error);
    return leads; // Return unfiltered leads on error
  }
};
