import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';

const PWAInstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed or running in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const hasBeenDismissed = localStorage.getItem('pwa-install-dismissed');

    if (!isStandalone && !hasBeenDismissed && (deferredPrompt || isIOS)) {
      setTimeout(() => setShowPrompt(true), 3000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [deferredPrompt]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 rounded-xl p-4 shadow-lg" style={{ background: '#E6F6FD', border: '1px solid #B3E4FA' }}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Download className="h-5 w-5" style={{ color: '#6EC6F1' }} />
            <h3 className="font-medium" style={{ color: '#1B4B5A' }}>Install ColdCall X</h3>
          </div>
          <p className="text-sm mb-3" style={{ color: '#6EC6F1' }}>
            Add to your home screen for the best experience and to avoid browser bars.
          </p>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              onClick={handleInstall}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Install
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleDismiss}
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              Maybe Later
            </Button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="ml-2 p-1 hover:opacity-80"
          style={{ color: '#6EC6F1' }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
