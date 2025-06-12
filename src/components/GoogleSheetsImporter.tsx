
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileSpreadsheet, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Lead } from '@/types/lead';

interface GoogleSheetsImporterProps {
  onLeadsImported: (leads: Lead[], sheetName: string) => void;
  showAsButton?: boolean;
  buttonText?: string;
  buttonIcon?: React.ReactNode;
}

const GoogleSheetsImporter: React.FC<GoogleSheetsImporterProps> = ({ 
  onLeadsImported, 
  showAsButton = false,
  buttonText = "Connect Google Sheets",
  buttonIcon = <FileSpreadsheet className="h-5 w-5" />
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleImport = async () => {
    if (!sheetUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Google Sheets URL",
        variant: "destructive",
      });
      return;
    }

    // Extract sheet ID from URL
    const sheetIdMatch = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!sheetIdMatch) {
      toast({
        title: "Error", 
        description: "Invalid Google Sheets URL",
        variant: "destructive",
      });
      return;
    }

    const sheetId = sheetIdMatch[1];
    setIsLoading(true);

    try {
      // Convert to CSV export URL
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;
      
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch sheet data. Make sure the sheet is publicly accessible.');
      }

      const csvText = await response.text();
      
      // Parse CSV data
      const lines = csvText.split('\n').filter(line => line.trim());
      const leads: Lead[] = [];
      
      // Skip header row and process data
      for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(',').map(col => col.replace(/"/g, '').trim());
        
        if (columns.length >= 2 && columns[0] && columns[1]) {
          leads.push({
            name: columns[0],
            phone: columns[1],
            called: 0,
            lastCalled: undefined
          });
        }
      }

      if (leads.length === 0) {
        throw new Error('No valid lead data found in the sheet');
      }

      // Extract sheet name from URL or use default
      const sheetName = `Google Sheet Import - ${new Date().toLocaleDateString()}`;
      
      onLeadsImported(leads, sheetName);
      setIsOpen(false);
      setSheetUrl('');
      
      toast({
        title: "Success",
        description: `Imported ${leads.length} leads from Google Sheets`,
      });
      
    } catch (error) {
      console.error('Error importing from Google Sheets:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import from Google Sheets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const ImportButton = () => (
    <Button 
      onClick={() => setIsOpen(true)} 
      variant={showAsButton ? "outline" : "ghost"}
      size={showAsButton ? "default" : "sm"}
      className={showAsButton ? "w-full flex items-center space-x-2" : "p-2"}
      title="Import from Google Sheets"
    >
      {buttonIcon}
      {showAsButton && <span>{buttonText}</span>}
    </Button>
  );

  return (
    <>
      <ImportButton />
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileSpreadsheet className="h-5 w-5" />
              <span>Import from Google Sheets</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sheet-url">Google Sheets URL</Label>
              <Input
                id="sheet-url"
                type="url"
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Make sure your sheet is publicly accessible. First column should be names, second column should be phone numbers.
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={handleImport} 
                disabled={isLoading || !sheetUrl.trim()}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Download className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Import
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GoogleSheetsImporter;
