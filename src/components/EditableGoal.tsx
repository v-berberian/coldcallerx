
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X, Edit } from 'lucide-react';

interface EditableGoalProps {
  currentGoal: number;
  onGoalChange: (newGoal: number) => void;
}

const EditableGoal: React.FC<EditableGoalProps> = ({
  currentGoal,
  onGoalChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempGoal, setTempGoal] = useState(currentGoal.toString());

  const handleSave = () => {
    const newGoal = parseInt(tempGoal, 10);
    if (!isNaN(newGoal) && newGoal > 0) {
      onGoalChange(newGoal);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setTempGoal(currentGoal.toString());
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center space-x-2 bg-muted p-2 rounded">
        <Input
          value={tempGoal}
          onChange={(e) => setTempGoal(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Enter goal"
          className="w-20 h-8 text-sm"
          type="number"
          min="1"
          autoFocus
        />
        <Button size="sm" onClick={handleSave} className="h-8 w-8 p-0">
          <Check className="h-3 w-3" />
        </Button>
        <Button size="sm" variant="outline" onClick={handleCancel} className="h-8 w-8 p-0">
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="flex items-center space-x-1 hover:bg-muted p-1 rounded transition-colors group"
      title="Click to edit goal"
    >
      <span>{currentGoal}</span>
      <Edit className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
    </button>
  );
};

export default EditableGoal;
