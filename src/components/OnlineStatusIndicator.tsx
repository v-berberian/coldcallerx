
import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';

interface OnlineStatusIndicatorProps {
  isOnline: boolean;
}

const OnlineStatusIndicator: React.FC<OnlineStatusIndicatorProps> = ({ isOnline }) => {
  return (
    <div className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full ${
      isOnline 
        ? 'text-green-600 bg-green-100/20' 
        : 'text-orange-600 bg-orange-100/20'
    }`}>
      {isOnline ? (
        <Wifi className="h-3 w-3" />
      ) : (
        <WifiOff className="h-3 w-3" />
      )}
      <span>{isOnline ? 'Online' : 'Offline'}</span>
    </div>
  );
};

export default OnlineStatusIndicator;
