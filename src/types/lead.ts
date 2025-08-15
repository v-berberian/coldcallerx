export interface Lead {
  name: string;
  phone: string;
  company?: string;
  email?: string; // Explicitly ensure this is always a string, not an object
  lastCalled?: string;
  additionalPhones?: string;
  notes?: string;
}

export type TimezoneFilter = 'ALL' | 'EST_CST';
export type CallFilter = 'ALL' | 'UNCALLED';
export type TemperatureFilter = 'ALL' | 'COLD' | 'WARM' | 'HOT';
