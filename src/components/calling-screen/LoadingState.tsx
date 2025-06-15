
import React from 'react';

const LoadingState: React.FC = () => {
  return (
    <div className="h-[100dvh] bg-background flex items-center justify-center">
      <div className="text-center space-y-2">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-muted-foreground">Loading caller...</p>
      </div>
    </div>
  );
};

export default LoadingState;
