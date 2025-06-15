
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyLeadCardProps {
  message: string;
}

const EmptyLeadCard: React.FC<EmptyLeadCardProps> = ({ message }) => {
  return (
    <Card className="shadow-2xl border-border/50 rounded-3xl bg-card h-[480px] flex flex-col">
      <CardContent className="p-6 space-y-6 flex-1 flex flex-col justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">{message}</h2>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyLeadCard;
