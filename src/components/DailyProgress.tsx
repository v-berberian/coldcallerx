
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { X } from 'lucide-react';

interface DailyProgressProps {
  dailyCallCount: number;
  onResetDailyCount: () => void;
}

const DailyProgress: React.FC<DailyProgressProps> = ({
  dailyCallCount,
  onResetDailyCount
}) => {
  const dailyGoal = 500;
  const progressPercentage = Math.min((dailyCallCount / dailyGoal) * 100, 100);

  return (
    <div className="bg-background border-t border-border p-2 flex-shrink-0">
      <div className="w-full max-w-sm mx-auto space-y-1">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Daily Goal</span>
          <div className="flex items-center space-x-2">
            <span>{dailyCallCount}/{dailyGoal} calls</span>
            <button
              onClick={onResetDailyCount}
              className="p-1 hover:bg-muted rounded transition-colors"
              title="Reset daily call count"
            >
              <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
        </div>
        <Progress value={progressPercentage} className="w-full h-2" />
      </div>
    </div>
  );
};

export default DailyProgress;
