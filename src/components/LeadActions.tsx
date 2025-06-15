
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Lead } from '@/types/lead';

interface LeadActionsProps {
  lead: Lead;
  onCall: () => void;
  onResetCallCount: () => void;
}

const LeadActions: React.FC<LeadActionsProps> = ({ lead, onCall, onResetCallCount }) => {
  return (
    <div className="space-y-3">
      {/* Last called info with reset button */}
      <div className="relative flex flex-col items-center space-y-4">
        {/* Reserve space for last called text to prevent layout shift */}
        <div className="h-5 flex items-center justify-center">
          {lead.lastCalled && (
            <div className="flex items-center">
              <p className="text-sm text-muted-foreground transition-opacity duration-300 ease-in-out opacity-100 whitespace-nowrap">
                Last called: {lead.lastCalled}
              </p>
              <button
                onClick={onResetCallCount}
                className="ml-2 p-1 bg-muted rounded transition-colors"
                title="Clear last called"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Call Button */}
      <Button 
        onClick={onCall} 
        size="lg" 
        className="w-full h-16 text-lg font-semibold bg-green-600 hover:bg-green-600 text-white rounded-2xl shadow-lg"
      >
        Call
      </Button>
    </div>
  );
};

export default LeadActions;
