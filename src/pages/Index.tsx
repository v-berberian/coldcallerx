
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

  // Load saved data on component mount
  useEffect(() => {
    const savedLeads = localStorage.getItem('coldcaller-leads');
    const savedFileName = localStorage.getItem('coldcaller-filename');
    
    console.log('Loading data from localStorage...');
    
    if (savedLeads && savedFileName) {
      try {
        const parsedLeads = JSON.parse(savedLeads);
        console.log('Loaded', parsedLeads.length, 'leads from localStorage');
        
        // Ensure all leads have the required properties
        const formattedLeads = parsedLeads.map((lead: Lead) => ({
          ...lead,
          called: lead.called || 0,
          lastCalled: lead.lastCalled || undefined
        }));
        
        setLeads(formattedLeads);
        setFileName(savedFileName);
        console.log('Successfully restored leads with call tracking data');
      } catch (error) {
        console.error('Error parsing saved leads:', error);
        // Clear corrupted data
        localStorage.removeItem('coldcaller-leads');
        localStorage.removeItem('coldcaller-filename');
      }
    } else {
      console.log('No saved data found in localStorage');
    }
  }, []);

  const handleBack = () => {
    // Clear saved data when going back
    localStorage.removeItem('coldcaller-leads');
    localStorage.removeItem('coldcaller-filename');
    console.log('Cleared localStorage data');
    
    setLeads([]);
    setFileName('');
  };

  const handleLeadsImported = (importedLeads: Lead[], importedFileName: string) => {
    // Check if we have existing data for these leads in localStorage
    const savedLeads = localStorage.getItem('coldcaller-leads');
    let mergedLeads = importedLeads;
    
    if (savedLeads) {
      try {
        const existingLeads = JSON.parse(savedLeads);
        console.log('Merging new import with existing call tracking data...');
        
        // Merge call tracking data from existing leads
        mergedLeads = importedLeads.map(newLead => {
          const existingLead = existingLeads.find((l: Lead) => 
            l.name === newLead.name && l.phone === newLead.phone
          );
          
          return {
            ...newLead,
            called: existingLead?.called || 0,
            lastCalled: existingLead?.lastCalled || undefined
          };
        });
        
        console.log('Merged call tracking data for', mergedLeads.length, 'leads');
      } catch (error) {
        console.error('Error merging with existing data:', error);
      }
    }
    
    setLeads(mergedLeads);
    setFileName(importedFileName);
    
    // Save to localStorage immediately
    localStorage.setItem('coldcaller-leads', JSON.stringify(mergedLeads));
    localStorage.setItem('coldcaller-filename', importedFileName);
    console.log('Saved imported leads to localStorage');
  };

  // If no leads, show empty state with proper header
  if (leads.length === 0) {
    return (
      <div className="h-screen h-[100vh] h-[100svh] bg-background overflow-hidden">
        {/* Header with import icon, logo, and theme toggle - with safe area padding */}
        <div className="flex items-center justify-between p-4 border-b border-border pt-safe" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
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
