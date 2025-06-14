
import { useState, useEffect } from 'react';

export const useComponentLifecycle = () => {
  const [componentReady, setComponentReady] = useState(false);
  const [leadsInitialized, setLeadsInitialized] = useState(false);

  // Progressive component initialization
  useEffect(() => {
    console.log('ComponentLifecycle: Starting progressive initialization');
    
    const initializeComponent = async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      console.log('ComponentLifecycle: Component ready');
      setComponentReady(true);
    };

    initializeComponent();
  }, []);

  return {
    componentReady,
    setComponentReady,
    leadsInitialized,
    setLeadsInitialized
  };
};
