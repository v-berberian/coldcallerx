
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useTheme } from 'next-themes';
import { Sun, Moon, Smartphone, LogOut, User, List } from 'lucide-react';
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
  const { theme, setTheme } = useTheme();
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

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'system':
        return <Smartphone className="h-4 w-4" />;
      default:
        return <Sun className="h-4 w-4" />;
    }
  };

  const cycleTheme = () => {
    const themes = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme || 'light');
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
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
        
        <div className="space-y-4">
          {/* User Info */}
          <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Signed in as</p>
              <p className="text-sm text-muted-foreground">{userEmail}</p>
            </div>
          </div>

          <Separator />

          {/* Manage Lead Lists */}
          <Button
            onClick={handleManageLeadLists}
            variant="outline"
            className="w-full flex items-center space-x-2"
          >
            <List className="h-4 w-4" />
            <span>Manage Lead Lists</span>
          </Button>

          <Separator />

          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-xs text-muted-foreground">
                Current: {theme || 'light'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={cycleTheme}
              className="flex items-center space-x-2"
            >
              {getThemeIcon()}
              <span className="capitalize">{theme || 'light'}</span>
            </Button>
          </div>

          <Separator />

          {/* Logout */}
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
