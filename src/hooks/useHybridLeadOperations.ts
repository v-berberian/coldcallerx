
import { useState, useEffect } from 'react';
import { Lead } from '../types/lead';

export const useHybridLeadOperations = () => {
  const [currentLeadList, setCurrentLeadList] = useState<Lead[]>([]);
  const [leadsData, setLeadsData] = useState<Lead[]>([]);
  const [isOnline] = useState(true); // Simplified for now

  const updateLeadCallCount = async (lead: Lead) => {
    try {
      // Update local storage for now
      const now = new Date();
      const dateString = now.toLocaleDateString();
      const timeString = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      const lastCalledString = `${dateString} at ${timeString}`;

      const updatedLeads = leadsData.map(l => 
        l.name === lead.name && l.phone === lead.phone ? {
          ...l,
          lastCalled: lastCalledString
        } : l
      );
      
      setLeadsData(updatedLeads);
      return true;
    } catch (error) {
      console.error('Error updating lead call count:', error);
      return false;
    }
  };

  const resetCallCount = async (lead: Lead) => {
    try {
      const updatedLeads = leadsData.map(l => 
        l.name === lead.name && l.phone === lead.phone 
          ? { ...l, lastCalled: undefined }
          : l
      );
      setLeadsData(updatedLeads);
      return true;
    } catch (error) {
      console.error('Error resetting call count:', error);
      return false;
    }
  };

  const resetAllCallCounts = async () => {
    try {
      const updatedLeads = leadsData.map(l => ({
        ...l,
        lastCalled: undefined
      }));
      setLeadsData(updatedLeads);
      return true;
    } catch (error) {
      console.error('Error resetting all call counts:', error);
      return false;
    }
  };

  return {
    currentLeadList,
    leadsData,
    isOnline,
    updateLeadCallCount,
    resetCallCount,
    resetAllCallCounts
  };
};
