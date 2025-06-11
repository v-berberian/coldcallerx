
import { useState } from 'react';

export const useCallDelay = () => {
  const [callDelay, setCallDelay] = useState(15); // Start with random delay (15 represents random)
  
  // Delay options: 15 = random (15-22s), 0 = no delay, 5 = 5 seconds
  const delayOptions = [15, 0, 5];
  
  const toggleCallDelay = () => {
    const currentIndex = delayOptions.indexOf(callDelay);
    const nextIndex = (currentIndex + 1) % delayOptions.length;
    setCallDelay(delayOptions[nextIndex]);
  };

  const resetCallDelay = () => {
    setCallDelay(15); // Reset to timer mode
  };

  const getDelayDisplayType = () => {
    if (callDelay === 0) return 'rocket';
    if (callDelay === 5) return '5s';
    return 'timer';
  };

  return {
    callDelay,
    toggleCallDelay,
    resetCallDelay,
    getDelayDisplayType
  };
};
