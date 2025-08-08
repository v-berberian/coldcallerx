import React from 'react';
import CallingScreenContainer from './CallingScreenContainer';
import { Lead } from '../types/lead';

interface CallingScreenLogicProps {
  leads: Lead[];
  fileName: string;
  currentCSVId?: string | null;
  onBack: () => void;
  onLeadsImported: (leads: Lead[], fileName: string, csvId: string) => void;
  onCSVSelect?: (csvId: string, leads: Lead[], fileName: string) => void;
}

const CallingScreenLogic: React.FC<CallingScreenLogicProps> = (props) => {
  return <CallingScreenContainer {...props} currentCSVId={props.currentCSVId || null} onCSVSelect={props.onCSVSelect || (() => {})} />;
};

export default CallingScreenLogic;
