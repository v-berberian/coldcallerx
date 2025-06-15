
import React from 'react';
import { Moon, Sun, Monitor, HelpCircle, ChevronRight } from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface SettingsMenuProps {
  children: React.ReactNode;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ children }) => {
  const { theme, setTheme } = useTheme();

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'system':
        return <Monitor className="h-4 w-4" />;
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

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Settings</h4>
            <p className="text-sm text-muted-foreground">
              Manage your app preferences
            </p>
          </div>
          
          <Separator />
          
          {/* Theme Control */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="theme-mode" className="text-sm font-medium">
                Theme Mode
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={cycleTheme}
                className="h-8 px-3"
              >
                {getThemeIcon()}
                <span className="ml-2 capitalize">{theme || 'light'}</span>
              </Button>
            </div>
          </div>
          
          <Separator />
          
          {/* CSV Upload Help Submenu */}
          <div className="space-y-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between h-auto p-3 border border-border/20 hover:bg-muted/30"
                >
                  <div className="flex items-center space-x-2">
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">CSV Upload Help</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 p-4" align="start">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm">CSV Upload Guide</h5>
                    <p className="text-xs text-muted-foreground">
                      Follow this column order for successful imports
                    </p>
                  </div>
                  
                  <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                    <p className="text-xs font-medium text-foreground">Required Column Order:</p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div><span className="font-medium">1. Company:</span> optional</div>
                      <div><span className="font-medium">2. Name:</span> required</div>
                      <div><span className="font-medium">3. Phone:</span> required</div>
                      <div><span className="font-medium">4. Additional Phones:</span> optional</div>
                      <div><span className="font-medium">5. Email:</span> optional</div>
                    </div>
                    <div className="border-t border-border/50 pt-2 mt-2">
                      <p className="text-xs text-muted-foreground italic">
                        💡 Tip: Use commas for empty columns to maintain proper structure
                      </p>
                    </div>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SettingsMenu;
