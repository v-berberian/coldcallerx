
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
    <div 
      className="bg-white/10 backdrop-blur-xl border-t border-white/20 p-2 flex-shrink-0"
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)'
      }}
    >
      <div className="w-full max-w-sm mx-auto space-y-1">
        <div className="flex items-center justify-between text-sm text-white/70">
          <span>Daily Goal</span>
          <div className="flex items-center space-x-2">
            <span>{dailyCallCount}/{dailyGoal} calls</span>
            <button
              onClick={onResetDailyCount}
              className="p-1 hover:bg-white/10 rounded-lg border border-white/20 transition-all duration-200 bg-white/5 backdrop-blur-sm"
              title="Reset daily call count"
            >
              <X className="h-3 w-3 text-white/70 hover:text-white" />
            </button>
          </div>
        </div>
        <Progress value={progressPercentage} className="w-full h-2" />
      </div>
    </div>
  );
};

export default DailyProgress;
