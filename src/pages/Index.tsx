
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Phone } from 'lucide-react';
import CSVImporter from '@/components/CSVImporter';
import CallingScreen from '@/components/CallingScreen';
import ThemeToggle from '@/components/ThemeToggle';

interface Lead {
  name: string;
  phone: string;
  called?: number;
  lastCalled?: string;
}

const Index = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [showCallingScreen, setShowCallingScreen] = useState(false);

  // Load saved data on component mount
  useEffect(() => {
    const savedLeads = localStorage.getItem('coldcaller-leads');
    const savedFileName = localStorage.getItem('coldcaller-filename');
    
    if (savedLeads && savedFileName) {
      try {
        const parsedLeads = JSON.parse(savedLeads);
        setLeads(parsedLeads);
        setFileName(savedFileName);
        setShowCallingScreen(true);
      } catch (error) {
        console.error('Error parsing saved leads:', error);
        // Clear corrupted data
        localStorage.removeItem('coldcaller-leads');
        localStorage.removeItem('coldcaller-filename');
      }
    }
  }, []);

  const handleImport = (importedLeads: Lead[], importedFileName: string) => {
    console.log('Imported leads:', importedLeads);
    console.log('File name:', importedFileName);
    
    // Save to localStorage
    localStorage.setItem('coldcaller-leads', JSON.stringify(importedLeads));
    localStorage.setItem('coldcaller-filename', importedFileName);
    
    setLeads(importedLeads);
    setFileName(importedFileName);
    setShowCallingScreen(true);
  };

  const handleBack = () => {
    setShowCallingScreen(false);
    
    // Clear saved data when going back to import
    localStorage.removeItem('coldcaller-leads');
    localStorage.removeItem('coldcaller-filename');
    
    setLeads([]);
    setFileName('');
  };

  if (showCallingScreen) {
    return (
      <CallingScreen 
        leads={leads} 
        fileName={fileName} 
        onBack={handleBack}
        onImport={handleImport}
      />
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Theme toggle in top right corner */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      
      <CSVImporter onImport={handleImport} />
    </div>
  );
};

export default Index;
