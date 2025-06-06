
import React, { useState, useEffect } from 'react';
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

  // Load saved data on component mount
  useEffect(() => {
    const savedLeads = localStorage.getItem('coldcaller-leads');
    const savedFileName = localStorage.getItem('coldcaller-filename');
    
    if (savedLeads && savedFileName) {
      try {
        const parsedLeads = JSON.parse(savedLeads);
        setLeads(parsedLeads);
        setFileName(savedFileName);
      } catch (error) {
        console.error('Error parsing saved leads:', error);
        // Clear corrupted data
        localStorage.removeItem('coldcaller-leads');
        localStorage.removeItem('coldcaller-filename');
      }
    }
  }, []);

  const handleBack = () => {
    // Clear saved data when going back
    localStorage.removeItem('coldcaller-leads');
    localStorage.removeItem('coldcaller-filename');
    
    setLeads([]);
    setFileName('');
  };

  // If no leads, show empty state
  if (leads.length === 0) {
    return (
      <div className="h-screen h-[100vh] h-[100svh] bg-background overflow-hidden">
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">
              <span className="text-blue-500">Cold</span>
              <span className="text-foreground">Caller </span>
              <span className="text-blue-500">X</span>
            </h1>
            <p className="text-lg text-muted-foreground">No leads available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <CallingScreen 
      leads={leads} 
      fileName={fileName} 
      onBack={handleBack}
    />
  );
};

export default Index;
