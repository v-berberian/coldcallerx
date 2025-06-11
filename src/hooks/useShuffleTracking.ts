
import { useState } from 'react';

export const useShuffleTracking = () => {
  const [shownLeadsInShuffle, setShownLeadsInShuffle] = useState<Set<string>>(new Set());

  const resetShownLeads = () => {
    setShownLeadsInShuffle(new Set());
  };

  return {
    shownLeadsInShuffle,
    setShownLeadsInShuffle,
    resetShownLeads
  };
};
