
import React from 'react';
import { Cloud, Loader2 } from 'lucide-react';

interface CloudSyncIndicatorProps {
  isLoading: boolean;
  lastSyncTime?: Date;
}

const CloudSyncIndicator: React.FC<CloudSyncIndicatorProps> = ({ isLoading, lastSyncTime }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-2">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-2" title={`Last synced: ${lastSyncTime?.toLocaleTimeString() || 'Never'}`}>
      <Cloud className="h-4 w-4 text-green-500" />
    </div>
  );
};

export default CloudSyncIndicator;
