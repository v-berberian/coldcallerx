
export interface Lead {
  name: string;
  phone: string;
  additionalPhones?: string[];
  company?: string;
  called?: number;
  lastCalled?: string;
}

export type TimezoneFilter = 'ALL' | 'EST_CST';
export type CallFilter = 'ALL' | 'UNCALLED';
