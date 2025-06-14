
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
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      console.log('Index: No user found, redirecting to auth');
      navigate('/auth', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Progressive loading - only start after auth is settled
  useEffect(() => {
    if (user && !authLoading) {
      console.log('Index: User authenticated, starting progressive loading');
      
      // Defer initialization to prevent blocking
      const initializeApp = async () => {
        // Small delay to ensure auth state is fully settled
        await new Promise(resolve => setTimeout(resolve, 100));
        
        try {
          await loadLocalDataAsync();
          console.log('Index: App initialization complete');
          setAppReady(true);
        } catch (error) {
          console.error('Index: Error during initialization:', error);
          setAppReady(true); // Still mark as ready to prevent infinite loading
        }
      };

      initializeApp();
    }
  }, [user, authLoading]);

  const loadLocalDataAsync = async () => {
    return new Promise<void>((resolve) => {
      // Use setTimeout to make localStorage operations non-blocking
      setTimeout(() => {
        try {
          const savedLeads = localStorage.getItem('coldcaller-leads');
          const savedFileName = localStorage.getItem('coldcaller-filename');
          
          if (savedLeads) {
            const leads = JSON.parse(savedLeads);
            setLeadsData(leads);
            console.log('Index: Loaded leads from localStorage:', leads.length);
          }
          
          if (savedFileName) {
            setFileName(savedFileName);
          }
        } catch (error) {
          console.error('Index: Error loading from localStorage:', error);
        }
        resolve();
      }, 0);
    });
  };

  const handleLeadsImported = (importedLeads: Lead[], importedFileName: string) => {
    console.log('Index: Importing new leads:', importedLeads.length);
    setLeadsData(importedLeads);
    setFileName(importedFileName);
    
    // Save to localStorage with non-blocking approach
    setTimeout(() => {
      localStorage.setItem('coldcaller-leads', JSON.stringify(importedLeads));
      localStorage.setItem('coldcaller-filename', importedFileName);
      localStorage.setItem('coldcaller-current-index', '0');
    }, 0);
  };

  const handleBack = async () => {
    console.log('Index: Signing out from main app');
    await signOut();
  };

  // Show loading until both auth and app are ready
  if (authLoading || (user && !appReady)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">
            {authLoading ? 'Loading...' : 'Initializing app...'}
          </p>
        </div>
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
