
import React from 'react';
import CSVImporter from '@/components/CSVImporter';
import ThemeToggle from '@/components/ThemeToggle';
import { ArrowLeft } from 'lucide-react';

interface Lead {
  name: string;
  phone: string;
}

interface CallingScreenHeaderProps {
  fileName: string;
  onBack: () => void;
  onLeadsImported: (leads: Lead[], fileName: string) => void;
}

const CallingScreenHeader: React.FC<CallingScreenHeaderProps> = ({
  fileName,
  onBack,
  onLeadsImported
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="flex items-center space-x-3">
        <CSVImporter onLeadsImported={onLeadsImported} />
        <button 
          onClick={onBack}
          className="p-2 rounded-lg transition-none text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>
      
      <h1 className="text-xl font-bold">
        <span className="text-blue-500">Cold</span>
        <span className="text-foreground">Caller </span>
        <span className="text-blue-500">X</span>
      </h1>
      
      <ThemeToggle />
    </div>
  );
};

export default CallingScreenHeader;
