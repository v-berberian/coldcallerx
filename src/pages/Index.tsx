import React, { useState, useEffect } from 'react';
import CallingScreen from '@/components/CallingScreen';
import ThemeToggle from '@/components/ThemeToggle';
import CSVImporter from '@/components/CSVImporter';

interface Lead {
  name: string;
  phone: string;
  called?: number;
  lastCalled?: string;
}

const Index = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [fileName, setFileName] = useState<string>('');

  // Set status bar color to white for mobile apps
  useEffect(() => {
    const metaTag = document.querySelector('meta[name="theme-color"]');
    if (metaTag) {
      metaTag.setAttribute('content', '#ffffff');
    } else {
      const newMetaTag = document.createElement('meta');
      newMetaTag.setAttribute('name', 'theme-color');
      newMetaTag.setAttribute('content', '#ffffff');
      document.head.appendChild(newMetaTag);
    }
  }, []);

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

  const handleLeadsImported = (importedLeads: Lead[], importedFileName: string) => {
    setLeads(importedLeads);
    setFileName(importedFileName);
    
    // Save to localStorage
    localStorage.setItem('coldcaller-leads', JSON.stringify(importedLeads));
    localStorage.setItem('coldcaller-filename', importedFileName);
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
      onLeadsImported={handleLeadsImported}
    />
  );
};

export default Index;
