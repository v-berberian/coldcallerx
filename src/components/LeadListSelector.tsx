
import React from 'react';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { LeadList } from '@/services/leadService';

interface LeadListSelectorProps {
  currentFileName: string;
  leadLists: LeadList[];
  onLeadListSelect: (leadList: LeadList) => void;
}

const LeadListSelector: React.FC<LeadListSelectorProps> = ({
  currentFileName,
  leadLists,
  onLeadListSelect
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-sm text-muted-foreground opacity-40 hover:opacity-100 transition-opacity">
          {currentFileName}
          <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Switch Lead List</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {leadLists.map((leadList) => (
          <DropdownMenuItem
            key={leadList.id}
            onClick={() => onLeadListSelect(leadList)}
            className={leadList.name === currentFileName ? 'bg-accent' : ''}
          >
            <div className="flex flex-col">
              <span className="font-medium">{leadList.name}</span>
              <span className="text-xs text-muted-foreground">
                {leadList.total_leads} leads
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LeadListSelector;
