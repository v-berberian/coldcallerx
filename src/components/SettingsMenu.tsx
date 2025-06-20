import React, { useState, useEffect } from 'react';
import { Mail, HelpCircle, ChevronDown, Plus, Edit, Trash2, MessageSquare, Check, Upload, FileText, Sun, Moon, Smartphone } from 'lucide-react';
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
import * as Collapsible from '@radix-ui/react-collapsible';

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
  children: React.ReactNode;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ children }) => {
  const [emailTemplateSubject, setEmailTemplateSubject] = useState('');
  const [emailTemplateBody, setEmailTemplateBody] = useState('');
  const [textTemplateMessage, setTextTemplateMessage] = useState('');
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [textOpen, setTextOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [csvGuideOpen, setCsvGuideOpen] = useState(false);
  const [modeOpen, setModeOpen] = useState(false);
  
  // Theme management
  const { theme, setTheme } = useTheme();

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

  const handleMode = (mode: string) => {
    setTheme(mode);
  };

  // Load templates from localStorage on mount
  useEffect(() => {
    const savedEmailSubject = localStorage.getItem('emailTemplateSubject');
    if (savedEmailSubject) setEmailTemplateSubject(savedEmailSubject);
    const savedEmailBody = localStorage.getItem('emailTemplateBody');
    if (savedEmailBody) setEmailTemplateBody(savedEmailBody);
    const savedTextMessage = localStorage.getItem('textTemplateMessage');
    if (savedTextMessage) setTextTemplateMessage(savedTextMessage);
  }, []);

  // Save email template changes
  useEffect(() => {
    localStorage.setItem('emailTemplateSubject', emailTemplateSubject);
    localStorage.setItem('emailTemplateBody', emailTemplateBody);
  }, [emailTemplateSubject, emailTemplateBody]);

  // Save text template changes
  useEffect(() => {
    localStorage.setItem('textTemplateMessage', textTemplateMessage);
  }, [textTemplateMessage]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        className="w-screen p-0 border-border/20 shadow-lg"
        sideOffset={5}
        align="center"
        data-settings-menu="true"
      >
        <div className="p-4 space-y-4">
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
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-20 ${templatesOpen ? 'rotate-180' : ''}`} />
                </button>
              </Collapsible.Trigger>
              <Collapsible.Content 
                className="space-y-2 data-[state=open]:animate-template-down data-[state=closed]:animate-template-up overflow-hidden"
              >
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
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-20 ${emailOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </Collapsible.Trigger>
                  <Collapsible.Content 
                    className="space-y-3 data-[state=open]:animate-template-down data-[state=closed]:animate-template-up overflow-hidden"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="emailSubject">Subject</Label>
                      <Input
                        id="emailSubject"
                        value={emailTemplateSubject}
                        onChange={(e) => setEmailTemplateSubject(e.target.value)}
                        placeholder="Enter email subject"
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emailBody">Body</Label>
                      <Textarea
                        id="emailBody"
                        value={emailTemplateBody}
                        onChange={(e) => setEmailTemplateBody(e.target.value)}
                        placeholder="Enter email body"
                        className="w-full h-32 resize-none"
                      />
                    </div>
                  </Collapsible.Content>
                </Collapsible.Root>

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
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-20 ${textOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </Collapsible.Trigger>
                  <Collapsible.Content 
                    className="space-y-3 data-[state=open]:animate-template-down data-[state=closed]:animate-template-up overflow-hidden"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="textMessage">Message</Label>
                      <Textarea
                        id="textMessage"
                        value={textTemplateMessage}
                        onChange={(e) => setTextTemplateMessage(e.target.value)}
                        placeholder="Enter text message"
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
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-20 ${modeOpen ? 'rotate-180' : ''}`} />
                </button>
              </Collapsible.Trigger>
              <Collapsible.Content 
                className="space-y-3 data-[state=open]:animate-template-down data-[state=closed]:animate-template-up overflow-hidden"
              >
                <div className="space-y-3 p-3 pl-8">
                  <RadioGroup 
                    value={theme || 'light'} 
                    onValueChange={handleMode}
                    className="space-y-1"
                  >
                    <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-muted/50 cursor-pointer ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-border/20'}`} onClick={() => handleMode('light')}>
                      <div className="flex items-center gap-3">
                        <Sun className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Light</span>
                      </div>
                      <RadioGroupItem value="light" id="light" className="sr-only" />
                      {theme === 'light' && <Check className="h-4 w-4 text-primary" />}
                    </div>
                    <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-muted/50 cursor-pointer ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border/20'}`} onClick={() => handleMode('dark')}>
                      <div className="flex items-center gap-3">
                        <Moon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Dark</span>
                      </div>
                      <RadioGroupItem value="dark" id="dark" className="sr-only" />
                      {theme === 'dark' && <Check className="h-4 w-4 text-primary" />}
                    </div>
                    <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-muted/50 cursor-pointer ${theme === 'system' ? 'border-primary bg-primary/5' : 'border-border/20'}`} onClick={() => handleMode('system')}>
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Device</span>
                      </div>
                      <RadioGroupItem value="system" id="system" className="sr-only" />
                      {theme === 'system' && <Check className="h-4 w-4 text-primary" />}
                    </div>
                  </RadioGroup>
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
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-20 ${helpOpen ? 'rotate-180' : ''}`} />
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
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-20 ${csvGuideOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </Collapsible.Trigger>
                  <Collapsible.Content 
                    className="space-y-3 data-[state=open]:animate-template-down data-[state=closed]:animate-template-up overflow-hidden"
                  >
                    <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">CSV Column Order:</p>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div><span className="font-medium">A:</span> Company (optional)</div>
                          <div><span className="font-medium">B:</span> Name (required)</div>
                          <div><span className="font-medium">C:</span> Phone (required)</div>
                          <div><span className="font-medium">D:</span> Additional Phones (optional)</div>
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
