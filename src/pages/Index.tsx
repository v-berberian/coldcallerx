
import React, { useState } from 'react';
import CSVImporter from '@/components/CSVImporter';
import CallingScreen from '@/components/CallingScreen';

interface Lead {
  name: string;
  phone: string;
}

const Index = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [showCallingScreen, setShowCallingScreen] = useState(false);

  const handleImport = (importedLeads: Lead[], importedFileName: string) => {
    console.log('Imported leads:', importedLeads);
    console.log('File name:', importedFileName);
    setLeads(importedLeads);
    setFileName(importedFileName);
    setShowCallingScreen(true);
  };

  const handleBack = () => {
    setShowCallingScreen(false);
    setLeads([]);
    setFileName('');
  };

  if (showCallingScreen && leads.length > 0) {
    return (
      <CallingScreen 
        leads={leads} 
        fileName={fileName} 
        onBack={handleBack}
      />
    );
  }

  return <CSVImporter onImport={handleImport} />;
};

export default Index;
