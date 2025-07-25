import React, { useState, useEffect } from 'react';
import { Mail, HelpCircle, ChevronDown, Plus, Edit, Trash2, MessageSquare, Check, Upload, FileText, Sun, Moon, Smartphone, Database, Settings } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import * as Collapsible from '@radix-ui/react-collapsible';
import { clearColdCallerStorage, quickClearColdCallerStorage } from '@/utils/clearStorage';
import { useToast } from '@/hooks/use-toast';
import { useSettingsMenu } from '@/hooks/useSettingsMenu';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

interface TextTemplate {
  id: string;
  name: string;
  message: string;
}

interface SettingsMenuProps {
  children?: (isOpen: boolean) => React.ReactNode;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ children }) => {
  // Use the settings menu hook
  const {
    emailSubject,
    emailBody,
    textMessage,
    handleEmailSubjectChange,
    handleEmailBodyChange,
    handleTextMessageChange
  } = useSettingsMenu();

  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [textOpen, setTextOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [csvGuideOpen, setCsvGuideOpen] = useState(false);
  const [modeOpen, setModeOpen] = useState(false);
  const [storageOpen, setStorageOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isClearingStorage, setIsClearingStorage] = useState(false);
  
  // Theme management
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  // Handle template open/close
  const handleTemplatesOpen = (open: boolean) => {
    setTemplatesOpen(open);
    if (!open) {
      // Close all submenus when templates menu is closed
      setEmailOpen(false);
      setTextOpen(false);
    }
  };

  const handleEmailOpen = (open: boolean) => {
    setEmailOpen(open);
    if (open) setTextOpen(false);
  };

  const handleTextOpen = (open: boolean) => {
    setTextOpen(open);
    if (open) setEmailOpen(false);
  };

  const handleHelpOpen = (open: boolean) => {
    setHelpOpen(open);
    if (!open) {
      // Close all submenus when help menu is closed
      setCsvGuideOpen(false);
    }
  };

  const handleCsvGuideOpen = (open: boolean) => {
    setCsvGuideOpen(open);
  };

  const handleStorageOpen = (open: boolean) => {
    setStorageOpen(open);
  };

  const handleMode = (mode: string) => {
    setTheme(mode);
  };

  const handleClearStorage = async () => {
    if (isClearingStorage) return;
    
    setIsClearingStorage(true);
    try {
      await clearColdCallerStorage();
      toast({
        title: "Storage Cleared",
        description: "All app data has been successfully cleared.",
      });
      // Close the popover after clearing
      setIsPopoverOpen(false);
    } catch (error) {
      console.error('Error clearing storage:', error);
      toast({
        title: "Error",
        description: "Failed to clear storage. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsClearingStorage(false);
    }
  };



  return (
    <Popover onOpenChange={(open) => {
      setIsPopoverOpen(open);
      if (!open) {
        setTemplatesOpen(false);
        setEmailOpen(false);
        setTextOpen(false);
        setHelpOpen(false);
        setCsvGuideOpen(false);
        setModeOpen(false);
        setStorageOpen(false);
      }
    }}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-base focus:bg-transparent active:bg-transparent transition-all duration-300 ease-out rounded-lg no-hover settings-selector-button text-muted-foreground"
          style={{ 
            WebkitTapHighlightColor: 'transparent',
            backgroundColor: isPopoverOpen ? (document.documentElement.classList.contains('dark') ? 'rgba(31, 41, 55, 0.5)' : 'rgba(243, 244, 246, 0.5)') : 'transparent',
            color: 'hsl(var(--muted-foreground))',
            boxShadow: isPopoverOpen ? 'inset 0 2px 4px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.1)' : 'none',
            '--background-color': isPopoverOpen ? (document.documentElement.classList.contains('dark') ? 'rgba(31, 41, 55, 0.5)' : 'rgba(243, 244, 246, 0.5)') : 'transparent',
            '--box-shadow': isPopoverOpen ? 'inset 0 2px 4px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.1)' : 'none',
            '--transform': isPopoverOpen ? 'scale(0.95)' : 'scale(1)',
            '--filter': isPopoverOpen ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' : 'none'
          } as React.CSSProperties}
        >
          <Settings 
            className="h-5 w-5 transition-all duration-300 ease-out"
            style={{
              color: 'hsl(var(--muted-foreground))',
              transform: isPopoverOpen ? 'scale(0.95)' : 'scale(1)',
              filter: isPopoverOpen ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' : 'none'
            }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-screen p-0 border-border/20 shadow-lg max-h-[95vh] overflow-y-auto animate-slide-down"
        sideOffset={5}
        align="center"
        data-settings-menu="true"
      >
          <div className="p-4 space-y-4 pb-8">
            <div className="space-y-4">
              {/* Templates Section */}
              <Collapsible.Root 
                open={templatesOpen} 
                onOpenChange={handleTemplatesOpen}
                className="space-y-2"
              >
                <Collapsible.Trigger asChild>
                  <button className="w-full flex items-center justify-between p-3 rounded-lg border border-border/20 transition-colors">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Templates</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-75 ${templatesOpen ? 'rotate-180' : ''}`} />
                  </button>
                </Collapsible.Trigger>
                <Collapsible.Content 
                  className="space-y-2 data-[state=open]:animate-template-down data-[state=closed]:animate-template-up overflow-hidden"
                >
                  {/* Text Template */}
                  <Collapsible.Root 
                    open={textOpen} 
                    onOpenChange={handleTextOpen}
                    className="space-y-2"
                  >
                    <Collapsible.Trigger asChild>
                      <button className="w-full flex items-center justify-between p-3 pl-8 rounded-lg border border-border/20 transition-colors">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Text Template</span>
                        </div>
                        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-75 ${textOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </Collapsible.Trigger>
                    <Collapsible.Content 
                      className="space-y-3 data-[state=open]:animate-template-down data-[state=closed]:animate-template-up overflow-hidden"
                    >
                      <div className="space-y-2 p-3 pl-8">
                        <Label htmlFor="textMessage">Message</Label>
                        <Textarea
                          id="textMessage"
                                          value={textMessage}
                onChange={(e) => handleTextMessageChange(e.target.value)}
                          placeholder="Enter text message"
                          className="w-full h-32 resize-none"
                        />
                      </div>
                    </Collapsible.Content>
                  </Collapsible.Root>

                  {/* Email Template */}
                  <Collapsible.Root 
                    open={emailOpen} 
                    onOpenChange={handleEmailOpen}
                    className="space-y-2"
                  >
                    <Collapsible.Trigger asChild>
                      <button className="w-full flex items-center justify-between p-3 pl-8 rounded-lg border border-border/20 transition-colors">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Email Template</span>
                        </div>
                        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-75 ${emailOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </Collapsible.Trigger>
                    <Collapsible.Content 
                      className="space-y-3 data-[state=open]:animate-template-down data-[state=closed]:animate-template-up overflow-hidden"
                    >
                      <div className="space-y-2 p-3 pl-8">
                        <Label htmlFor="emailSubject">Subject</Label>
                        <Input
                          id="emailSubject"
                                          value={emailSubject}
                onChange={(e) => handleEmailSubjectChange(e.target.value)}
                          placeholder="Enter email subject"
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2 p-3 pl-8">
                        <Label htmlFor="emailBody">Body</Label>
                        <Textarea
                          id="emailBody"
                                          value={emailBody}
                onChange={(e) => handleEmailBodyChange(e.target.value)}
                          placeholder="Enter email body"
                          className="w-full h-32 resize-none"
                        />
                      </div>
                    </Collapsible.Content>
                  </Collapsible.Root>
                </Collapsible.Content>
              </Collapsible.Root>

              {/* Mode Section */}
              <Collapsible.Root 
                open={modeOpen} 
                onOpenChange={setModeOpen}
                className="space-y-2"
              >
                <Collapsible.Trigger asChild>
                  <button className="w-full flex items-center justify-between p-3 rounded-lg border border-border/20 transition-colors">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Mode</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-75 ${modeOpen ? 'rotate-180' : ''}`} />
                  </button>
                </Collapsible.Trigger>
                <Collapsible.Content 
                  className="space-y-3 data-[state=open]:animate-template-down data-[state=closed]:animate-template-up overflow-hidden"
                >
                  <div className="space-y-2 p-3 pl-8">
                    <div className={`flex items-center justify-between py-3 cursor-pointer ${(theme || 'system') === 'light' ? 'text-primary' : 'text-foreground'}`} onClick={() => handleMode('light')}>
                      <div className="flex items-center gap-3">
                        <Sun className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Light</span>
                      </div>
                      {(theme || 'system') === 'light' && <Check className="h-4 w-4 text-primary" />}
                    </div>
                    <div className={`flex items-center justify-between py-3 cursor-pointer ${(theme || 'system') === 'dark' ? 'text-primary' : 'text-foreground'}`} onClick={() => handleMode('dark')}>
                      <div className="flex items-center gap-3">
                        <Moon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Dark</span>
                      </div>
                      {(theme || 'system') === 'dark' && <Check className="h-4 w-4 text-primary" />}
                    </div>
                    <div className={`flex items-center justify-between py-3 cursor-pointer ${(theme || 'system') === 'system' ? 'text-primary' : 'text-foreground'}`} onClick={() => handleMode('system')}>
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Device</span>
                      </div>
                      {(theme || 'system') === 'system' && <Check className="h-4 w-4 text-primary" />}
                    </div>
                  </div>
                </Collapsible.Content>
              </Collapsible.Root>

              {/* Storage Section */}
              <Collapsible.Root 
                open={storageOpen} 
                onOpenChange={handleStorageOpen}
                className="space-y-2"
              >
                <Collapsible.Trigger asChild>
                  <button className="w-full flex items-center justify-between p-3 rounded-lg border border-border/20 transition-colors">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Storage</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-75 ${storageOpen ? 'rotate-180' : ''}`} />
                  </button>
                </Collapsible.Trigger>
                <Collapsible.Content 
                  className="space-y-3 data-[state=open]:animate-template-down data-[state=closed]:animate-template-up overflow-hidden"
                >
                  <div className="space-y-3 p-3 pl-8">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Clear all stored data including CSV files, call history, and settings.
                      </p>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={handleClearStorage}
                        disabled={isClearingStorage}
                        className="w-full"
                      >
                        {isClearingStorage ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Clearing...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear All Data
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Collapsible.Content>
              </Collapsible.Root>

              {/* Help Section */}
              <Collapsible.Root 
                open={helpOpen} 
                onOpenChange={handleHelpOpen}
                className="space-y-2"
              >
                <Collapsible.Trigger asChild>
                  <button className="w-full flex items-center justify-between p-3 rounded-lg border border-border/20 transition-colors">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Help</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-75 ${helpOpen ? 'rotate-180' : ''}`} />
                  </button>
                </Collapsible.Trigger>
                <Collapsible.Content 
                  className="space-y-2 data-[state=open]:animate-template-down data-[state=closed]:animate-template-up overflow-hidden"
                >
                  {/* CSV Upload Guide */}
                  <Collapsible.Root 
                    open={csvGuideOpen} 
                    onOpenChange={handleCsvGuideOpen}
                    className="space-y-2"
                  >
                    <Collapsible.Trigger asChild>
                      <button className="w-full flex items-center justify-between p-3 pl-8 rounded-lg border border-border/20 transition-colors">
                        <div className="flex items-center gap-2">
                          <Upload className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">CSV Upload Guide</span>
                        </div>
                        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-75 ${csvGuideOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </Collapsible.Trigger>
                    <Collapsible.Content 
                      className="space-y-3 data-[state=open]:animate-template-down data-[state=closed]:animate-template-up overflow-hidden"
                    >
                      <div className="space-y-3 p-3 pl-8 bg-muted/30 rounded-lg">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-foreground">CSV Column Order:</p>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div><span className="font-medium">A:</span> Company (optional, searchable)</div>
                            <div><span className="font-medium">B:</span> Name (required, searchable)</div>
                            <div><span className="font-medium">C:</span> Phone (required, searchable)</div>
                            <div><span className="font-medium">D:</span> Additional Phones (optional, searchable)</div>
                            <div><span className="font-medium">E:</span> Email (optional)</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-foreground">Tips:</p>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div>• Phone numbers should include area code</div>
                            <div>• Additional phones can be separated by spaces or commas</div>
                            <div>• Email addresses should be valid format</div>
                            <div>• First row can be headers (will be skipped)</div>
                            <div>• Use the search bar to find leads by name, company, or phone</div>
                          </div>
                        </div>
                      </div>
                    </Collapsible.Content>
                  </Collapsible.Root>
                </Collapsible.Content>
              </Collapsible.Root>
            </div>
          </div>
        </PopoverContent>
    </Popover>
  );
};

export default SettingsMenu;
