
import { useEffect } from 'react';
import { Lead } from '../types/lead';

interface UseComponentInitializationProps {
  componentReady: boolean;
  leadsInitialized: boolean;
  setLeadsInitialized: (initialized: boolean) => void;
  leads: Lead[];
  memoizedResetLeadsData: (leads: Lead[]) => void;
}

export const useComponentInitialization = ({
  componentReady,
  leadsInitialized,
  setLeadsInitialized,
  leads,
  memoizedResetLeadsData
}: UseComponentInitializationProps) => {
  // Handle new CSV imports by resetting the leads data - only when leads actually change
  useEffect(() => {
    if (componentReady && !leadsInitialized) {
      console.log('ComponentInitialization: Initializing leads data for first time');
      memoizedResetLeadsData(leads);
      setLeadsInitialized(true);
    }
  }, [componentReady, leadsInitialized, leads.length, memoizedResetLeadsData, setLeadsInitialized]);
};
