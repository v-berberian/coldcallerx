
import React from 'react';
import { Button } from '@/components/ui/button';

interface FilterBarProps {
  timezoneFilter: 'ALL' | 'EST_CST' | 'PST';
  callStatusFilter: 'ALL' | 'UNCALLED';
  onTimezoneFilterChange: (filter: 'ALL' | 'EST_CST' | 'PST') => void;
  onCallStatusFilterChange: (filter: 'ALL' | 'UNCALLED') => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  timezoneFilter,
  callStatusFilter,
  onTimezoneFilterChange,
  onCallStatusFilterChange
}) => {
  return (
    <div className="space-y-3">
      {/* Timezone Filter */}
      <div className="flex gap-1">
        <Button
          onClick={() => onTimezoneFilterChange('ALL')}
          variant={timezoneFilter === 'ALL' ? 'default' : 'outline'}
          size="sm"
          className="flex-1 text-xs rounded-xl"
        >
          All States
        </Button>
        <Button
          onClick={() => onTimezoneFilterChange('EST_CST')}
          variant={timezoneFilter === 'EST_CST' ? 'default' : 'outline'}
          size="sm"
          className="flex-1 text-xs rounded-xl"
        >
          EST & CST
        </Button>
        <Button
          onClick={() => onTimezoneFilterChange('PST')}
          variant={timezoneFilter === 'PST' ? 'default' : 'outline'}
          size="sm"
          className="flex-1 text-xs rounded-xl"
        >
          PST
        </Button>
      </div>

      {/* Call Status Filter */}
      <div className="flex gap-1">
        <Button
          onClick={() => onCallStatusFilterChange('ALL')}
          variant={callStatusFilter === 'ALL' ? 'default' : 'outline'}
          size="sm"
          className="flex-1 text-xs rounded-xl"
        >
          All Numbers
        </Button>
        <Button
          onClick={() => onCallStatusFilterChange('UNCALLED')}
          variant={callStatusFilter === 'UNCALLED' ? 'default' : 'outline'}
          size="sm"
          className="flex-1 text-xs rounded-xl"
        >
          Uncalled Numbers
        </Button>
      </div>
    </div>
  );
};

export default FilterBar;
