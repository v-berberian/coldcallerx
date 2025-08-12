import React from 'react';
import CallingScreenContainer from './CallingScreenContainer';
import { Lead } from '../types/lead';

interface CallingScreenLogicProps {
  leads: Lead[];
  fileName: string;
  onBack: () => void;
  onLeadsImported: (leads: Lead[], fileName: string, csvId: string) => void;
  currentCSVId: string | null;
  onCSVSelect: (csvId: string, leads: Lead[], fileName: string) => void;
  onAllListsDeleted?: () => void;
  refreshTrigger?: number;
}

const CallingScreenLogic: React.FC<CallingScreenLogicProps> = (props) => {
  return <CallingScreenContainer {...props} />;
};

export default CallingScreenLogic;
