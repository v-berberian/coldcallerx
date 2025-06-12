
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LogOut, User, List } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  onManageLeadLists: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  userEmail,
  onManageLeadLists 
}) => {
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "An error occurred while logging out",
        variant: "destructive",
      });
    }
  };

  const handleManageLeadLists = () => {
    onManageLeadLists();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* User Info */}
          <div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-lg border">
            <User className="h-6 w-6 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Signed in as</p>
              <p className="text-sm text-muted-foreground break-all">{userEmail}</p>
            </div>
          </div>

          <Separator />

          {/* Lead Lists Management */}
          <Button
            onClick={handleManageLeadLists}
            variant="outline"
            className="w-full flex items-center justify-start space-x-3 h-12"
          >
            <List className="h-5 w-5" />
            <span>Manage Lead Lists</span>
          </Button>

          <Separator />

          {/* Logout */}
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full flex items-center justify-start space-x-3 h-12"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
