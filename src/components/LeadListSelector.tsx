
import React from 'react';
import { ChevronDown, Trash2 } from 'lucide-react';
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
  onLeadListDelete?: (leadListId: string) => void;
}

const LeadListSelector: React.FC<LeadListSelectorProps> = ({
  currentFileName,
  leadLists,
  onLeadListSelect,
  onLeadListDelete
}) => {
  // Ensure leadLists is always an array
  const safeLeadLists = leadLists || [];

  const handleDelete = (e: React.MouseEvent, leadListId: string) => {
    e.stopPropagation();
    if (onLeadListDelete) {
      onLeadListDelete(leadListId);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-sm text-muted-foreground opacity-40 hover:opacity-100 transition-opacity px-0">
          {currentFileName}
          <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Switch Lead List</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {safeLeadLists.length === 0 ? (
          <DropdownMenuItem disabled>
            No other lists available
          </DropdownMenuItem>
        ) : (
          safeLeadLists.map((leadList) => (
            <DropdownMenuItem
              key={leadList.id}
              onClick={() => onLeadListSelect(leadList)}
              className={`${leadList.name === currentFileName ? 'bg-accent' : ''} cursor-pointer`}
            >
              <div className="flex justify-between items-center w-full">
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-medium truncate">{leadList.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {leadList.total_leads} leads
                  </span>
                </div>
                {onLeadListDelete && (
                  <button
                    onClick={(e) => handleDelete(e, leadList.id)}
                    className="ml-2 p-1 rounded hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    title="Delete lead list"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LeadListSelector;
