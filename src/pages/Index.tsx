
import React, { useState, useEffect } from 'react';
import CallingScreen from '@/components/CallingScreen';
import ThemeToggle from '@/components/ThemeToggle';
import CSVImporter from '@/components/CSVImporter';
import GoogleSheetsImporter from '@/components/GoogleSheetsImporter';
import { useAuth } from '@/hooks/useAuth';

interface Lead {
  name: string;
  phone: string;
  called?: number;
  lastCalled?: string;
}

const Index = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [fileName, setFileName] = useState<string>('');

  // Only load from localStorage if not authenticated (fallback mode)
  useEffect(() => {
    if (!user) {
      const savedLeads = localStorage.getItem('coldcaller-leads');
      const savedFileName = localStorage.getItem('coldcaller-filename');
      
      if (savedLeads && savedFileName) {
        try {
          const parsedLeads = JSON.parse(savedLeads);
          const formattedLeads = parsedLeads.map((lead: Lead) => ({
            ...lead,
            called: lead.called || 0,
            lastCalled: lead.lastCalled || undefined
          }));
          
          setLeads(formattedLeads);
          setFileName(savedFileName);
        } catch (error) {
          console.error('Error parsing saved leads:', error);
          localStorage.removeItem('coldcaller-leads');
          localStorage.removeItem('coldcaller-filename');
        }
      }
    }
  }, [user]);

  const handleBack = () => {
    if (!user) {
      // Clear localStorage for non-authenticated users
      localStorage.removeItem('coldcaller-leads');
      localStorage.removeItem('coldcaller-filename');
    }
    
    setLeads([]);
    setFileName('');
  };

  const handleLeadsImported = (importedLeads: Lead[], importedFileName: string) => {
    setLeads(importedLeads);
    setFileName(importedFileName);
    
    // Only save to localStorage for non-authenticated users
    if (!user) {
      localStorage.setItem('coldcaller-leads', JSON.stringify(importedLeads));
      localStorage.setItem('coldcaller-filename', importedFileName);
    }
  };

  // For authenticated users, show the calling screen directly (it will handle loading from Supabase)
  if (user) {
    return (
      <CallingScreen 
        leads={leads} 
        fileName={fileName} 
        onBack={handleBack}
        onLeadsImported={handleLeadsImported}
      />
    );
  }

  // For non-authenticated users, show the import interface if no leads
  if (leads.length === 0) {
    return (
      <div className="h-screen h-[100vh] h-[100svh] bg-background overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border pt-safe" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
          <div className="flex items-center space-x-4">
            <CSVImporter onLeadsImported={handleLeadsImported} />
            <GoogleSheetsImporter onLeadsImported={handleLeadsImported} />
          </div>
          
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
            <p className="text-sm text-muted-foreground">Import from CSV or Google Sheets to get started</p>
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
