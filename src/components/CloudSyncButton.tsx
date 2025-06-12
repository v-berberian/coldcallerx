
import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

interface CloudSyncButtonProps {
  status?: SyncStatus;
  onSync?: () => void;
}

const CloudSyncButton: React.FC<CloudSyncButtonProps> = ({ 
  status = 'idle', 
  onSync 
}) => {
  const [showStatus, setShowStatus] = useState(false);

  // Show status feedback for 2 seconds when sync completes
  useEffect(() => {
    if (status === 'success' || status === 'error') {
      setShowStatus(true);
      const timer = setTimeout(() => setShowStatus(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const getIcon = () => {
    if (status === 'syncing') {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    
    if (showStatus) {
      if (status === 'success') {
        return <Check className="h-4 w-4 text-green-600" />;
      }
      if (status === 'error') {
        return <X className="h-4 w-4 text-red-600" />;
      }
    }
    
    return <Cloud className="h-4 w-4" />;
  };

  const getTitle = () => {
    switch (status) {
      case 'syncing':
        return 'Syncing to cloud...';
      case 'success':
        return 'Synced successfully';
      case 'error':
        return 'Sync failed - click to retry';
      default:
        return 'Cloud sync';
    }
  };

  const getButtonColor = () => {
    if (showStatus) {
      if (status === 'success') return 'text-green-600';
      if (status === 'error') return 'text-red-600';
    }
    if (status === 'syncing') return 'text-blue-600';
    return 'text-muted-foreground';
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onSync}
      disabled={status === 'syncing'}
      className={`h-8 w-8 rounded-full transition-colors duration-200 ${getButtonColor()}`}
      title={getTitle()}
    >
      <div className="flex items-center justify-center">
        {getIcon()}
      </div>
    </Button>
  );
};

export default CloudSyncButton;
