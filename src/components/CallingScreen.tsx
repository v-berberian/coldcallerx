
import React from 'react';
import CallingScreenLogic from './CallingScreenLogic';
import { SessionState } from '@/services/sessionService';

interface Lead {
  name: string;
  phone: string;
  called?: number;
  lastCalled?: string;
}

interface CallingScreenProps {
  leads: Lead[];
  fileName: string;
  onBack: () => void;
  onLeadsImported: (leads: Lead[], fileName: string) => void;
  markLeadAsCalled?: (lead: Lead) => Promise<boolean>;
  resetCallCount?: (lead: Lead) => void;
  resetAllCallCounts?: () => void;
  sessionState?: SessionState;
  updateSessionState?: (updates: Partial<SessionState>) => Promise<boolean>;
}

const CallingScreen: React.FC<CallingScreenProps> = (props) => {
  return <CallingScreenLogic {...props} />;
};

export default CallingScreen;
