
import React from 'react';
import { X } from 'lucide-react';

interface LastCalledBadgeProps {
  lastCalled: string;
  onResetCallCount: () => void;
}

const LastCalledBadge: React.FC<LastCalledBadgeProps> = ({ lastCalled, onResetCallCount }) => {
  return (
    <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
      <div className="flex items-center bg-muted/20 backdrop-blur-sm rounded-lg px-3 py-1">
        <p className="text-xs text-muted-foreground whitespace-nowrap">
          Last called: {lastCalled}
        </p>
        <button
          onClick={onResetCallCount}
          className="ml-2 p-1 bg-muted rounded transition-colors"
          title="Clear last called"
        >
          <X className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

export default LastCalledBadge;
