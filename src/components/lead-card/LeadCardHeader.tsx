
import React from 'react';

interface LeadCardHeaderProps {
  currentIndex: number;
  totalCount: number;
  fileName: string;
}

const LeadCardHeader: React.FC<LeadCardHeaderProps> = ({ currentIndex, totalCount, fileName }) => {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground opacity-40">
        {currentIndex + 1}/{totalCount}
      </p>
      <p className="text-sm text-muted-foreground opacity-40">
        {fileName}
      </p>
    </div>
  );
};

export default LeadCardHeader;
