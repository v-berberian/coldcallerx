
import { useState } from 'react';

export const useCallDelay = () => {
  const [callDelay, setCallDelay] = useState(15);
  
  const delayOptions = [15, 20, 5, 10, 0];
  
  const toggleCallDelay = () => {
    const currentIndex = delayOptions.indexOf(callDelay);
    const nextIndex = (currentIndex + 1) % delayOptions.length;
    setCallDelay(delayOptions[nextIndex]);
  };

  return {
    callDelay,
    toggleCallDelay
  };
};
