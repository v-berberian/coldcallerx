
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
  return <CallingScreenContainer {...props} />;
};

export default CallingScreen;
