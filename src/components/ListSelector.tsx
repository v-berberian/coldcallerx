import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Upload, FileSpreadsheet } from 'lucide-react';
import CSVImporter from './CSVImporter';
import GoogleSheetsImporter from './GoogleSheetsImporter';
import { Lead } from '@/types/lead';

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
}

const ListSelector: React.FC<ListSelectorProps> = ({
  isOpen,
  onClose,
  leadLists,
  currentListId,
  onSelectList,
  onCreateList
}) => {
  const [showImportOptions, setShowImportOptions] = useState(false);

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
          <DialogTitle>Select Lead List</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Existing Lists */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {leadLists.map((list) => (
              <Button
                key={list.id}
                variant={currentListId === list.id ? "default" : "outline"}
                onClick={() => handleListSelect(list.id)}
                className="w-full justify-start"
              >
                {list.name}
              </Button>
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
