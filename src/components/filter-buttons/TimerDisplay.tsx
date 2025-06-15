
import React from 'react';
import { Timer, Rocket } from 'lucide-react';

interface TimerDisplayProps {
  isCountdownActive: boolean;
  countdownTime: number;
  getDelayDisplayType?: () => 'timer' | 'rocket' | '5s' | '10s';
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({
  isCountdownActive,
  countdownTime,
  getDelayDisplayType
}) => {
  if (isCountdownActive) {
    return <>{countdownTime}</>;
  }

  if (!getDelayDisplayType) {
    return <Timer size={14} />;
  }

  const displayType = getDelayDisplayType();
  switch (displayType) {
    case 'rocket':
      return <Rocket size={14} />;
    case '5s':
      return <>5s</>;
    case '10s':
      return <>10s</>;
    default:
      return <Timer size={14} />;
  }
};

export default TimerDisplay;
