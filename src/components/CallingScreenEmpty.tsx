
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface CallingScreenEmptyProps {
  onClearFilters: () => void;
  onBack: () => void;
}

const CallingScreenEmpty: React.FC<CallingScreenEmptyProps> = ({
  onClearFilters,
  onBack
}) => {
  return (
    <div className="h-screen h-[100vh] h-[100svh] bg-background flex items-center justify-center p-4 overflow-hidden">
      <Card className="w-full max-w-md shadow-lg rounded-2xl">
        <CardContent className="p-8 text-center">
          <p className="text-lg">No leads found with current filters</p>
          <div className="mt-4 space-y-2">
            <Button 
              onClick={onClearFilters} 
              className="w-full rounded-xl"
            >
              Clear All Filters
            </Button>
            <Button onClick={onBack} variant="outline" className="w-full rounded-xl">
              Back to Import
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CallingScreenEmpty;
