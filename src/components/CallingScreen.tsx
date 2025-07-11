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
  onLeadsImported: (leads: Lead[], fileName: string, csvId: string) => void;
  currentCSVId: string | null;
  onCSVSelect: (csvId: string, leads: Lead[], fileName: string) => void;
  onAllListsDeleted?: () => void;
  refreshTrigger?: number;
}

const CallingScreen: React.FC<CallingScreenProps> = ({ 
  leads, 
  fileName, 
  onBack, 
  onLeadsImported,
  currentCSVId,
  onCSVSelect,
  onAllListsDeleted,
  refreshTrigger = 0
}) => {
  return (
    <CallingScreenContainer 
      leads={leads} 
      fileName={fileName} 
      onBack={onBack} 
      onLeadsImported={onLeadsImported}
      currentCSVId={currentCSVId}
      onCSVSelect={onCSVSelect}
      onAllListsDeleted={onAllListsDeleted}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default CallingScreen;
