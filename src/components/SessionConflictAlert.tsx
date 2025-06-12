
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, X } from 'lucide-react';

interface SessionConflictAlertProps {
  isVisible: boolean;
  lastRemoteUpdate: string | null;
  onSyncFromRemote: () => void;
  onDismiss: () => void;
}

const SessionConflictAlert: React.FC<SessionConflictAlertProps> = ({
  isVisible,
  lastRemoteUpdate,
  onSyncFromRemote,
  onDismiss
}) => {
  if (!isVisible) return null;

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="fixed top-20 left-4 right-4 z-50 max-w-sm mx-auto">
      <Alert className="border-orange-200 bg-orange-50">
        <RefreshCw className="h-4 w-4 text-orange-600" />
        <AlertTitle className="text-orange-800">Session Updated on Another Device</AlertTitle>
        <AlertDescription className="text-orange-700 text-sm">
          {lastRemoteUpdate && (
            <p className="mb-2">
              Last updated at {formatTime(lastRemoteUpdate)} from another device.
            </p>
          )}
          <div className="flex gap-2 mt-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onSyncFromRemote}
              className="text-orange-700 border-orange-300 hover:bg-orange-100"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Sync
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={onDismiss}
              className="text-orange-700 hover:bg-orange-100"
            >
              <X className="h-3 w-3 mr-1" />
              Keep Current
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default SessionConflictAlert;
