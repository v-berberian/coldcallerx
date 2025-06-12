
import React, { useState, useEffect } from 'react';
import CallingScreen from '@/components/CallingScreen';
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
      localStorage.removeItem('coldcaller-leads');
      localStorage.removeItem('coldcaller-filename');
    }
    
    setLeads([]);
    setFileName('');
  };

  const handleLeadsImported = (importedLeads: Lead[], importedFileName: string) => {
    setLeads(importedLeads);
    setFileName(importedFileName);
    
    if (!user) {
      localStorage.setItem('coldcaller-leads', JSON.stringify(importedLeads));
      localStorage.setItem('coldcaller-filename', importedFileName);
    }
  };

  // For authenticated users, show the calling screen directly (it will handle loading from Supabase)
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
