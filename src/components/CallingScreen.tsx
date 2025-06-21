import React from 'react';
import CallingScreenContainer from './CallingScreenContainer';

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
}

const CallingScreen: React.FC<CallingScreenProps> = (props) => {
  console.log('CallingScreen: Rendering with', props.leads.length, 'leads');
  return <CallingScreenContainer {...props} />;
};

export default CallingScreen;
