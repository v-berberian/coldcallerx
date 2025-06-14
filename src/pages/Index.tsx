
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import CallingScreen from '@/components/CallingScreen';
import UserProfile from '@/components/UserProfile';
import CSVImporter from '@/components/CSVImporter';
import { Lead } from '@/types/lead';

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [leadsData, setLeadsData] = useState<Lead[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      console.log('No user found, redirecting to auth');
      navigate('/auth', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Load data from localStorage on mount
  useEffect(() => {
    if (user && !authLoading) {
      console.log('User authenticated, loading local data');
      // Add small delay to ensure auth state is fully settled
      setTimeout(() => {
        loadLocalData();
      }, 100);
    }
  }, [user, authLoading]);

  const loadLocalData = () => {
    try {
      const savedLeads = localStorage.getItem('coldcaller-leads');
      const savedFileName = localStorage.getItem('coldcaller-filename');
      
      if (savedLeads) {
        const leads = JSON.parse(savedLeads);
        setLeadsData(leads);
        console.log('Loaded leads from localStorage:', leads.length);
      }
      
      if (savedFileName) {
        setFileName(savedFileName);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeadsImported = (importedLeads: Lead[], importedFileName: string) => {
    setLeadsData(importedLeads);
    setFileName(importedFileName);
    
    // Save to localStorage
    localStorage.setItem('coldcaller-leads', JSON.stringify(importedLeads));
    localStorage.setItem('coldcaller-filename', importedFileName);
    localStorage.setItem('coldcaller-current-index', '0');
  };

  const handleBack = async () => {
    console.log('Signing out from main app');
    await signOut();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  // If no leads, show empty state with proper header
  if (leadsData.length === 0) {
    return (
      <div className="h-screen h-[100vh] h-[100svh] bg-background overflow-hidden">
        {/* Header with user info and sign out */}
        <div className="flex items-center justify-between p-4 border-b border-border pt-safe" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
          <CSVImporter onLeadsImported={handleLeadsImported} />
          
          <h1 className="text-2xl font-bold">
            <span className="text-blue-500">ColdCall </span>
            <span className="text-blue-500">X</span>
          </h1>
          
          <div className="flex items-center space-x-2">
            <UserProfile />
          </div>
        </div>
        
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <p className="text-lg text-muted-foreground">No Leads Imported</p>
            <p className="text-sm text-muted-foreground">Click the upload icon above to import a CSV file</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <CallingScreen 
      leads={leadsData} 
      fileName={fileName} 
      onBack={handleBack}
      onLeadsImported={handleLeadsImported}
    />
  );
};

export default Index;
