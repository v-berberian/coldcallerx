import React from 'react';
import CallingScreenContainer from './CallingScreenContainer';
import { Lead } from '../types/lead';

interface CallingScreenLogicProps {
  leads: Lead[];
  fileName: string;
  onBack: () => void;
  onLeadsImported: (leads: Lead[], fileName: string, csvId: string) => void;
}

const CallingScreenLogic: React.FC<CallingScreenLogicProps> = (props) => {
  return <CallingScreenContainer {...props} />;
};

export default CallingScreenLogic;
