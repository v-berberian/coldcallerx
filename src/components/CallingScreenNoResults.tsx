
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface CallingScreenNoResultsProps {
  onClearFilters: () => void;
  onBack: () => void;
}

const CallingScreenNoResults: React.FC<CallingScreenNoResultsProps> = ({
  onClearFilters,
  onBack
}) => {
  return (
    <div className="h-[100dvh] bg-background flex items-center justify-center p-4 overflow-hidden fixed inset-0">
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

export default CallingScreenNoResults;
