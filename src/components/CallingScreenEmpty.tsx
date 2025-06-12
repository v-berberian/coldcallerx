
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface CallingScreenEmptyProps {
  type: 'no-leads' | 'no-filtered-leads';
  onBack?: () => void;
  onClearFilters?: () => void;
}

const CallingScreenEmpty: React.FC<CallingScreenEmptyProps> = ({
  type,
  onBack,
  onClearFilters
}) => {
  if (type === 'no-leads') {
    return (
      <div className="h-[100dvh] bg-background overflow-hidden fixed inset-0">
        <div className="bg-background border-b border-border p-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold">
                <span className="text-blue-500">Cold</span>
                <span className="text-foreground">Caller </span> 
                <span className="text-blue-500">X</span>
              </h1>
            </div>
          </div>
        </div>
        <div className="p-6 text-center">
          <p className="text-lg text-muted-foreground">No leads imported</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] bg-background flex items-center justify-center p-4 overflow-hidden fixed inset-0">
      <Card className="w-full max-w-md shadow-lg rounded-2xl">
        <CardContent className="p-8 text-center">
          <p className="text-lg">No leads found with current filters</p>
          <div className="mt-4 space-y-2">
            {onClearFilters && (
              <Button 
                onClick={onClearFilters}
                className="w-full rounded-xl"
              >
                Clear All Filters
              </Button>
            )}
            {onBack && (
              <Button onClick={onBack} variant="outline" className="w-full rounded-xl">
                Back to Import
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CallingScreenEmpty;
