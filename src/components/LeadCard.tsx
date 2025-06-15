
import React from 'react';
import { Lead } from '@/types/lead';
import LeadCardContainer from './lead-card/LeadCardContainer';

interface LeadCardProps {
  lead: Lead;
  currentIndex: number;
  totalCount: number;
  fileName: string;
  onCall: () => void;
  onResetCallCount: () => void;
  noLeadsMessage?: string;
}

const LeadCard: React.FC<LeadCardProps> = (props) => {
  return <LeadCardContainer {...props} />;
};

export default LeadCard;
