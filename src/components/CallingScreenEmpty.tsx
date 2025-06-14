
import React from 'react';

interface CallingScreenEmptyProps {
  onBack: () => void;
}

const CallingScreenEmpty: React.FC<CallingScreenEmptyProps> = ({ onBack }) => {
  return (
    <div className="h-[100dvh] bg-background overflow-hidden fixed inset-0">
      <div className="bg-background border-b border-border p-4">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold">
              <span className="text-blue-500">ColdCall </span>
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
};

export default CallingScreenEmpty;
