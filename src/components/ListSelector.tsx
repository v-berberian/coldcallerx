
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Upload, FileSpreadsheet, X, Trash2 } from 'lucide-react';
import CSVImporter from './CSVImporter';
import GoogleSheetsImporter from './GoogleSheetsImporter';
import { Lead } from '@/types/lead';
import { useToast } from '@/hooks/use-toast';

interface LeadList {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface ListSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  leadLists: LeadList[];
  currentListId: string | null;
  onSelectList: (listId: string) => void;
  onCreateList: (name: string, leads: Lead[]) => void;
  onDeleteList: (listId: string) => void;
}

const ListSelector: React.FC<ListSelectorProps> = ({
  isOpen,
  onClose,
  leadLists,
  currentListId,
  onSelectList,
  onCreateList,
  onDeleteList
}) => {
  const [showImportOptions, setShowImportOptions] = useState(false);
  const { toast } = useToast();

  const handleListSelect = (listId: string) => {
    onSelectList(listId);
    onClose();
  };

  const handleCSVImport = (leads: Lead[], fileName: string) => {
    onCreateList(fileName, leads);
    setShowImportOptions(false);
    onClose();
  };

  const handleGoogleSheetsImport = (leads: Lead[], sheetName: string) => {
    onCreateList(sheetName, leads);
    setShowImportOptions(false);
    onClose();
  };

  const handleDeleteList = async (listId: string, listName: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (leadLists.length === 1) {
      toast({
        title: "Cannot delete",
        description: "You must have at least one lead list",
        variant: "destructive",
      });
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${listName}"? This action cannot be undone.`)) {
      try {
        await onDeleteList(listId);
        toast({
          title: "List deleted",
          description: `"${listName}" has been deleted successfully`,
        });
      } catch (error) {
        toast({
          title: "Delete failed",
          description: "Failed to delete the lead list",
          variant: "destructive",
        });
      }
    }
  };

  if (showImportOptions) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import New List</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-3">
              <CSVImporter 
                onLeadsImported={handleCSVImport}
                showAsButton={true}
                buttonText="Import CSV File"
                buttonIcon={<Upload className="h-4 w-4" />}
              />
              
              <GoogleSheetsImporter 
                onLeadsImported={handleGoogleSheetsImport}
                showAsButton={true}
                buttonText="Import Google Sheets"
                buttonIcon={<FileSpreadsheet className="h-4 w-4" />}
              />
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => setShowImportOptions(false)}
              className="w-full"
            >
              Back to Lists
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Lead Lists</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Existing Lists */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {leadLists.map((list) => (
              <div
                key={list.id}
                className="flex items-center space-x-2"
              >
                <Button
                  variant={currentListId === list.id ? "default" : "outline"}
                  onClick={() => handleListSelect(list.id)}
                  className="flex-1 justify-start"
                >
                  {list.name}
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleDeleteList(list.id, list.name, e)}
                  className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  title={`Delete ${list.name}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            {leadLists.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No lead lists found
              </p>
            )}
          </div>
          
          {/* Import New List Button */}
          <Button 
            onClick={() => setShowImportOptions(true)}
            className="w-full flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Import New List</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ListSelector;
