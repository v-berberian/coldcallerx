import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Target, Edit2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface DailyProgressProps {
  dailyCallCount: number;
}

const DailyProgress: React.FC<DailyProgressProps> = ({
  dailyCallCount
}) => {
  const [dailyCallGoal, setDailyCallGoal] = useState(500);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [editValue, setEditValue] = useState('500');
  
  const callProgressPercentage = Math.min((dailyCallCount / dailyCallGoal) * 100, 100);

  // Load goal from localStorage on mount
  useEffect(() => {
    const savedGoal = localStorage.getItem('dailyCallGoal');
    if (savedGoal) {
      const goal = parseInt(savedGoal, 10);
      if (!isNaN(goal) && goal > 0) {
        setDailyCallGoal(goal);
        setEditValue(goal.toString());
      }
    }
  }, []);

  // Save goal to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('dailyCallGoal', dailyCallGoal.toString());
  }, [dailyCallGoal]);

  const handleGoalClick = () => {
    setIsEditingGoal(true);
    setEditValue(dailyCallGoal.toString());
  };

  const handleGoalSave = () => {
    const newGoal = parseInt(editValue, 10);
    if (!isNaN(newGoal) && newGoal > 0) {
      setDailyCallGoal(newGoal);
    } else {
      setEditValue(dailyCallGoal.toString());
    }
    setIsEditingGoal(false);
  };

  const handleGoalCancel = () => {
    setEditValue(dailyCallGoal.toString());
    setIsEditingGoal(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGoalSave();
    } else if (e.key === 'Escape') {
      handleGoalCancel();
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-1">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Target className="h-4 w-4" style={{ color: '#6EC6F1' }} />
          <span className="font-medium bg-gradient-to-r from-muted-foreground to-muted-foreground/95 bg-clip-text text-transparent dark:bg-none dark:text-muted-foreground">Calls</span>
        </div>
        <div className="flex items-center">
          <span className="text-sm font-medium bg-gradient-to-r from-foreground to-foreground/95 bg-clip-text text-transparent dark:bg-none dark:text-foreground">{dailyCallCount} </span>
          <span className="text-sm font-medium bg-gradient-to-r from-foreground to-foreground/95 bg-clip-text text-transparent dark:bg-none dark:text-foreground">/</span>
          {isEditingGoal ? (
            <div className="flex items-center space-x-1">
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleGoalSave}
                onKeyDown={handleKeyPress}
                className="w-16 h-6 text-sm text-center p-1 ml-1"
                autoFocus
              />
              <button
                onClick={handleGoalSave}
                className="p-1 hover:bg-muted rounded transition-colors duration-200 touch-manipulation"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <Edit2 className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoalClick}
              className="text-sm font-medium hover:text-primary transition-colors duration-200 touch-manipulation ml-1 bg-gradient-to-r from-foreground to-foreground/95 bg-clip-text text-transparent dark:bg-none dark:text-foreground"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {dailyCallGoal}
            </button>
          )}
        </div>
      </div>
      <Progress 
        value={callProgressPercentage} 
        className="w-full h-2 bg-muted" 
      />
    </div>
  );
};

export default DailyProgress;
