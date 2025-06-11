
import React from 'react';
import CallingScreenLogic from './CallingScreenLogic';

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
  return <CallingScreenLogic {...props} />;
};

export default CallingScreen;
