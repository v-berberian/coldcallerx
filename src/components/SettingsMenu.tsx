import React, { useState, useEffect, useRef } from 'react';
import { Mail, HelpCircle, ChevronDown, Plus, Edit, Trash2, MessageSquare, Check, Upload, FileText } from 'lucide-react';
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
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  
  // Auto-collapse timer
  const autoCollapseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Reset auto-collapse timer
  const resetAutoCollapseTimer = () => {
    lastActivityRef.current = Date.now();
    
    if (autoCollapseTimerRef.current) {
      clearTimeout(autoCollapseTimerRef.current);
    }
    
    if (isPopoverOpen) {
      autoCollapseTimerRef.current = setTimeout(() => {
        // Close all menus after 5 seconds of inactivity
        setTemplatesOpen(false);
        setEmailOpen(false);
        setTextOpen(false);
        setHelpOpen(false);
        setCsvGuideOpen(false);
      }, 5000); // 5 seconds
    }
  };

  // Handle popover open/close
  const handlePopoverOpenChange = (open: boolean) => {
    setIsPopoverOpen(open);
    
    if (open) {
      resetAutoCollapseTimer();
    } else {
      // Clear timer when popover closes
      if (autoCollapseTimerRef.current) {
        clearTimeout(autoCollapseTimerRef.current);
        autoCollapseTimerRef.current = null;
      }
      // Close all menus when popover closes
      setTemplatesOpen(false);
      setEmailOpen(false);
      setTextOpen(false);
      setHelpOpen(false);
      setCsvGuideOpen(false);
    }
  };

  // Handle template open/close
  const handleTemplatesOpen = (open: boolean) => {
    setTemplatesOpen(open);
    resetAutoCollapseTimer(); // Reset timer on any interaction
    
    if (!open) {
      // Close all submenus when templates menu is closed
      setEmailOpen(false);
      setTextOpen(false);
    }
  };

  const handleEmailOpen = (open: boolean) => {
    setEmailOpen(open);
    resetAutoCollapseTimer(); // Reset timer on any interaction
    
    if (open) setTextOpen(false);
  };

  const handleTextOpen = (open: boolean) => {
    setTextOpen(open);
    resetAutoCollapseTimer(); // Reset timer on any interaction
    
    if (open) setEmailOpen(false);
  };

  const handleHelpOpen = (open: boolean) => {
    setHelpOpen(open);
    resetAutoCollapseTimer(); // Reset timer on any interaction
    
    if (!open) {
      // Close all submenus when help menu is closed
      setCsvGuideOpen(false);
    }
  };

  const handleCsvGuideOpen = (open: boolean) => {
    setCsvGuideOpen(open);
    resetAutoCollapseTimer(); // Reset timer on any interaction
  };

  // Handle input changes to reset timer
  const handleEmailSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailTemplateSubject(e.target.value);
    resetAutoCollapseTimer();
  };

  const handleEmailBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEmailTemplateBody(e.target.value);
    resetAutoCollapseTimer();
  };

  const handleTextMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextTemplateMessage(e.target.value);
    resetAutoCollapseTimer();
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoCollapseTimerRef.current) {
        clearTimeout(autoCollapseTimerRef.current);
      }
    };
  }, []);

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
    <Popover open={isPopoverOpen} onOpenChange={handlePopoverOpenChange}>
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
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${templatesOpen ? 'rotate-180' : ''}`} />
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
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${emailOpen ? 'rotate-180' : ''}`} />
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
                        onChange={handleEmailSubjectChange}
                        placeholder="Enter email subject"
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emailBody">Body</Label>
                      <Textarea
                        id="emailBody"
                        value={emailTemplateBody}
                        onChange={handleEmailBodyChange}
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
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${textOpen ? 'rotate-180' : ''}`} />
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
                        onChange={handleTextMessageChange}
                        placeholder="Enter text message"
                        className="w-full h-32 resize-none"
                      />
                    </div>
                  </Collapsible.Content>
                </Collapsible.Root>
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
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${helpOpen ? 'rotate-180' : ''}`} />
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
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${csvGuideOpen ? 'rotate-180' : ''}`} />
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
