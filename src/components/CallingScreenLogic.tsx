
import React from 'react';
import CallingScreenContainer from './CallingScreenContainer';
import { SessionState } from '@/services/sessionService';
import { Lead } from '../types/lead';

interface CallingScreenLogicProps {
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

const CallingScreenLogic: React.FC<CallingScreenLogicProps> = (props) => {
  return <CallingScreenContainer {...props} />;
};

export default CallingScreenLogic;
