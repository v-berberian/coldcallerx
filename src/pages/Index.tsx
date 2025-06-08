
import React, { useState, useEffect } from 'react';
import CallingScreen from '@/components/CallingScreen';
import ThemeToggle from '@/components/ThemeToggle';
import CSVImporter from '@/components/CSVImporter';

interface Lead {
  name: string;
  phone: string;
  called?: number;
  lastCalled?: Date;
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
        // Convert lastCalled strings back to Date objects
        const processedLeads = parsedLeads.map((lead: any) => ({
          ...lead,
          lastCalled: lead.lastCalled ? new Date(lead.lastCalled) : undefined
        }));
        setLeads(processedLeads);
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

  const handleLeadsImported = (importedLeads: Lead[], importedFileName?: string) => {
    setLeads(importedLeads);
    if (importedFileName) {
      setFileName(importedFileName);
    }
    
    // Save to localStorage
    localStorage.setItem('coldcaller-leads', JSON.stringify(importedLeads));
    if (importedFileName) {
      localStorage.setItem('coldcaller-filename', importedFileName);
    }
  };

  const handleLeadsUpdated = (updatedLeads: Lead[]) => {
    setLeads(updatedLeads);
    // Save to localStorage
    localStorage.setItem('coldcaller-leads', JSON.stringify(updatedLeads));
  };

  // If no leads, show empty state with proper header
  if (leads.length === 0) {
    return (
      <div className="h-screen h-[100vh] h-[100svh] bg-background overflow-hidden">
        {/* Header with import icon, logo, and theme toggle */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <CSVImporter onLeadsImported={handleLeadsImported} />
          
          <h1 className="text-2xl font-bold">
            <span className="text-blue-500">Cold</span>
            <span className="text-foreground">Caller </span>
            <span className="text-blue-500">X</span>
          </h1>
          
          <ThemeToggle />
        </div>
        
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <p className="text-lg text-muted-foreground">No Leads Imported</p>
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
      onLeadsImported={handleLeadsUpdated}
    />
  );
};

export default Index;
