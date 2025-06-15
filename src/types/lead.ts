
export interface Lead {
  name: string;
  phone: string;
  company?: string;
  email?: string;
  lastCalled?: string;
}

export type TimezoneFilter = 'ALL' | 'EST_CST';
export type CallFilter = 'ALL' | 'UNCALLED';
