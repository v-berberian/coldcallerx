
import { useState, useEffect } from 'react';

export const useTimerDisplay = (autoCall: boolean) => {
  const [showTimerIcon, setShowTimerIcon] = useState(autoCall);

  useEffect(() => {
    setShowTimerIcon(autoCall);
  }, [autoCall]);

  return {
    showTimerIcon,
    setShowTimerIcon
  };
};
