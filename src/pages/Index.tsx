
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
  const [appReady, setAppReady] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [leadsData, setLeadsData] = useState<Lead[]>([]);
  const [currentLeadList, setCurrentLeadList] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      console.log('Index: No user found, redirecting to auth');
      navigate('/auth', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Load saved data from localStorage when user is ready
  useEffect(() => {
    if (user && !authLoading) {
      console.log('Index: Loading saved data from localStorage');
      
      // Load from localStorage
      const savedLeads = localStorage.getItem('leadsData');
      const savedLeadList = localStorage.getItem('currentLeadList');
      
      if (savedLeads && savedLeadList) {
        try {
          const parsedLeads = JSON.parse(savedLeads);
          const parsedLeadList = JSON.parse(savedLeadList);
          console.log('Index: Loaded', parsedLeads.length, 'leads from localStorage');
          setLeadsData(parsedLeads);
          setCurrentLeadList(parsedLeadList);
        } catch (error) {
          console.error('Index: Error parsing saved data:', error);
          // Clear corrupted data
          localStorage.removeItem('leadsData');
          localStorage.removeItem('currentLeadList');
        }
      } else {
        console.log('Index: No saved data found in localStorage');
      }
      
      // Initialize app
      const initializeApp = async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
        console.log('Index: App initialization complete');
        setAppReady(true);
        
        // Add fade-in effect
        setTimeout(() => {
          setShowContent(true);
        }, 50);
      };

      initializeApp();
    }
  }, [user, authLoading]);

  const handleLeadsImported = async (importedLeads: Lead[], fileName: string) => {
    console.log('Index: Importing new leads locally:', importedLeads.length);
    console.log('Index: Sample lead:', importedLeads[0]);
    
    const leadList = { 
      id: Date.now().toString(), 
      name: fileName,
      file_name: fileName + '.csv',
      total_leads: importedLeads.length
    };

    // Save to localStorage first
    try {
      localStorage.setItem('currentLeadList', JSON.stringify(leadList));
      localStorage.setItem('leadsData', JSON.stringify(importedLeads));
      console.log('Index: Successfully saved to localStorage');
    } catch (error) {
      console.error('Index: Error saving to localStorage:', error);
      return;
    }

    // Then update state
    setCurrentLeadList(leadList);
    setLeadsData(importedLeads);
    
    console.log('Index: State updated with', importedLeads.length, 'leads');
  };

  const handleBack = async () => {
    console.log('Index: Signing out from main app');
    await signOut();
  };

  // Show loading until everything is ready
  if (authLoading || (user && !appReady)) {
    return (
      <div className="h-[100vh] h-[100dvh] h-[100svh] bg-background flex items-center justify-center fixed inset-0 overflow-hidden">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-500" />
          <p className="text-lg text-muted-foreground">
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
      <div className={`h-[100vh] h-[100dvh] h-[100svh] bg-background overflow-hidden fixed inset-0 transition-opacity duration-300 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Header with user info and import */}
        <div className="flex items-center justify-between p-4 border-b border-border pt-safe" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
          <CSVImporter onLeadsImported={handleLeadsImported} />
          
          <h1 className="text-2xl font-bold">
            <span className="text-blue-500">ColdCall </span>
            <span className="text-blue-500">X</span>
          </h1>
          
          <UserProfile />
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
    <div className={`transition-opacity duration-300 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
      <CallingScreen 
        leads={leadsData} 
        fileName={currentLeadList?.name || 'Imported Leads'}
        onBack={handleBack}
        onLeadsImported={handleLeadsImported}
      />
    </div>
  );
};

export default Index;
