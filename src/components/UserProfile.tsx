
import React from 'react';
import { User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfileProps {
  syncStatus?: 'synced' | 'syncing' | 'not-synced';
}

const UserProfile: React.FC<UserProfileProps> = ({ syncStatus = 'synced' }) => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const getSyncStatusColor = () => {
    switch (syncStatus) {
      case 'synced':
        return 'bg-green-500';
      case 'syncing':
        return 'bg-orange-500';
      case 'not-synced':
        return 'bg-gray-400';
      default:
        return 'bg-green-500';
    }
  };

  const getSyncStatusText = () => {
    switch (syncStatus) {
      case 'synced':
        return 'Synced';
      case 'syncing':
        return 'Syncing...';
      case 'not-synced':
        return 'Not synced';
      default:
        return 'Synced';
    }
  };

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full">
            <User className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">Account</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${getSyncStatusColor()}`} />
                <p className="text-xs text-muted-foreground">{getSyncStatusText()}</p>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Status dot in top right corner */}
      <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getSyncStatusColor()}`} />
    </div>
  );
};

export default UserProfile;
