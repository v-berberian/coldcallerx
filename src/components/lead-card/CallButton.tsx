
import React from 'react';
import { Button } from '@/components/ui/button';

interface CallButtonProps {
  onCall: () => void;
}

const CallButton: React.FC<CallButtonProps> = ({ onCall }) => {
  return (
    <div className="mt-auto pt-3">
      <Button 
        onClick={onCall} 
        size="lg" 
        className="w-full h-16 text-lg font-semibold bg-green-600 hover:bg-green-600 text-white rounded-2xl shadow-lg"
      >
        Call
      </Button>
    </div>
  );
};

export default CallButton;
