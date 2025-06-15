
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, Calendar, Building, FileText, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CourtRecord {
  id: string;
  case_name: string;
  case_number: string;
  court_name: string;
  case_date: string;
  case_url: string;
  case_summary?: string;
  created_at: string;
}

interface CourtRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessName: string;
  companyName?: string;
}

const CourtRecordsModal: React.FC<CourtRecordsModalProps> = ({
  isOpen,
  onClose,
  businessName,
  companyName
}) => {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<CourtRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [totalFound, setTotalFound] = useState(0);
  const [cached, setCached] = useState(false);
  const { session } = useAuth();

  const searchCourtRecords = async () => {
    if (!session) {
      setError('You must be logged in to search court records');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const { data, error: functionError } = await supabase.functions.invoke('search-court-records', {
        body: { businessName: companyName || businessName },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (functionError) {
        throw functionError;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setRecords(data.records || []);
      setTotalFound(data.totalFound || 0);
      setCached(data.cached || false);
      setSearched(true);
    } catch (err) {
      console.error('Error searching court records:', err);
      setError(err instanceof Error ? err.message : 'Failed to search court records');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const handleClose = () => {
    setRecords([]);
    setError(null);
    setSearched(false);
    setLoading(false);
    setCached(false);
    setTotalFound(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Court Records for {companyName || businessName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!searched && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Search New York court records for mentions of this business.
              </p>
              <Button onClick={searchCourtRecords} disabled={loading}>
                {loading ? 'Searching...' : 'Search Court Records'}
              </Button>
            </div>
          )}

          {loading && (
            <div className="space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                Searching New York court databases...
              </div>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <span className="text-destructive">{error}</span>
            </div>
          )}

          {searched && !loading && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Found {records.length} record{records.length !== 1 ? 's' : ''}
                  {totalFound > records.length && ` (showing first ${records.length} of ${totalFound})`}
                </span>
                {cached && (
                  <span className="text-blue-600">
                    Cached results (last 24 hours)
                  </span>
                )}
              </div>

              {records.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No court records found for this business name.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {records.map((record) => (
                    <div key={record.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="font-medium text-sm leading-tight">
                            {record.case_name}
                          </h3>
                          {record.case_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(record.case_url, '_blank')}
                              className="h-8 px-2"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            Case #{record.case_number}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(record.case_date)}
                          </div>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          <Building className="h-3 w-3 inline mr-1" />
                          {record.court_name}
                        </div>
                        
                        {record.case_summary && (
                          <div className="text-sm bg-muted/50 rounded p-2 mt-2">
                            {record.case_summary}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-center pt-4">
                <Button variant="outline" onClick={searchCourtRecords} disabled={loading}>
                  Search Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CourtRecordsModal;
