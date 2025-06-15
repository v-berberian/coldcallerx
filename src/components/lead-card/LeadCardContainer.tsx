
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Lead } from '@/types/lead';
import { usePhoneSelection } from '../../hooks/usePhoneSelection';
import LeadCardHeader from './LeadCardHeader';
import LeadInfo from './LeadInfo';
import LastCalledBadge from './LastCalledBadge';
import CallButton from './CallButton';
import EmptyLeadCard from './EmptyLeadCard';

interface LeadCardContainerProps {
  lead: Lead;
  currentIndex: number;
  totalCount: number;
  fileName: string;
  onCall: () => void;
  onResetCallCount: () => void;
  noLeadsMessage?: string;
}

const LeadCardContainer: React.FC<LeadCardContainerProps> = ({
  lead,
  currentIndex,
  totalCount,
  fileName,
  onCall,
  onResetCallCount,
  noLeadsMessage
}) => {
  // If we have a noLeadsMessage, show the empty state
  if (noLeadsMessage) {
    return <EmptyLeadCard message={noLeadsMessage} />;
  }

  // Use stable key based on lead data
  const leadKey = `${lead.name}-${lead.phone}`;

  // Phone selection logic
  const {
    selectedPhone,
    hasAdditionalPhones,
    allPhones,
    handlePhoneSelect
  } = usePhoneSelection(lead.phone, lead.additionalPhones, lead.name);

  // Modified onCall to use selected phone
  const handleCall = () => {
    console.log('Making call to selected phone:', selectedPhone);
    onCall();
  };

  return (
    <Card className="shadow-2xl border-border/50 rounded-3xl bg-card h-[480px] flex flex-col relative">
      <CardContent className="p-6 space-y-6 flex-1 flex flex-col">
        <LeadCardHeader
          currentIndex={currentIndex}
          totalCount={totalCount}
          fileName={fileName}
        />

        <LeadInfo
          lead={lead}
          selectedPhone={selectedPhone}
          hasAdditionalPhones={hasAdditionalPhones}
          allPhones={allPhones}
          onPhoneSelect={handlePhoneSelect}
          leadKey={leadKey}
        />

        {lead.lastCalled && (
          <LastCalledBadge
            lastCalled={lead.lastCalled}
            onResetCallCount={onResetCallCount}
          />
        )}

        <CallButton onCall={handleCall} />
      </CardContent>
    </Card>
  );
};

export default LeadCardContainer;
