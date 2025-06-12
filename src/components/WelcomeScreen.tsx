
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet } from 'lucide-react';
import CSVImporter from './CSVImporter';
import GoogleSheetsImporter from './GoogleSheetsImporter';
import { Lead } from '@/types/lead';

interface WelcomeScreenProps {
  onLeadsImported: (leads: Lead[], fileName: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onLeadsImported }) => {
  const [showImportOptions, setShowImportOptions] = useState(false);

  if (!showImportOptions) {
    return (
      <div className="h-[100dvh] bg-background overflow-hidden fixed inset-0 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold mb-4">
              <span className="text-blue-500">Cold</span>
              <span className="text-foreground">Caller </span>
              <span className="text-blue-500">X</span>
            </CardTitle>
            <p className="text-muted-foreground">
              Welcome! Let's get started by importing your first lead list.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => setShowImportOptions(true)}
              className="w-full flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Import Lead List</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] bg-background overflow-hidden fixed inset-0 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle>Import Your Lead List</CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose how you'd like to import your leads
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <CSVImporter 
            onLeadsImported={onLeadsImported}
            showAsButton={true}
            buttonText="Upload CSV File"
            buttonIcon={<Upload className="h-4 w-4" />}
          />
          
          <GoogleSheetsImporter 
            onLeadsImported={onLeadsImported}
            showAsButton={true}
            buttonText="Import from Google Sheets"
            buttonIcon={<FileSpreadsheet className="h-4 w-4" />}
          />
          
          <Button 
            variant="outline" 
            onClick={() => setShowImportOptions(false)}
            className="w-full"
          >
            Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeScreen;
