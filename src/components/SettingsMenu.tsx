import React, { useState, useEffect } from 'react';
import { Mail, HelpCircle, ChevronDown, Plus, Edit, Trash2, MessageSquare, Check } from 'lucide-react';
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
  const [emailOpen, setEmailOpen] = useState(false);
  const [textOpen, setTextOpen] = useState(false);

  // Handle template open/close
  const handleEmailOpen = (open: boolean) => {
    setEmailOpen(open);
    if (open) setTextOpen(false);
  };

  const handleTextOpen = (open: boolean) => {
    setTextOpen(open);
    if (open) setEmailOpen(false);
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
        className="w-[calc(100vw-2rem)] sm:w-[400px] p-0 border-border/20 shadow-lg"
        sideOffset={5}
        align="end"
      >
        <div className="p-4 space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Templates</h3>
              <p className="text-xs text-muted-foreground">Customize your email and text templates</p>
            </div>

            {/* Email Template */}
            <Collapsible.Root 
              open={emailOpen} 
              onOpenChange={handleEmailOpen}
              className="space-y-2"
            >
              <Collapsible.Trigger asChild>
                <button className="w-full flex items-center justify-between p-3 rounded-lg border border-border/20 hover:bg-muted/50 transition-colors">
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
                <button className="w-full flex items-center justify-between p-3 rounded-lg border border-border/20 hover:bg-muted/50 transition-colors">
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
                    onChange={(e) => setTextTemplateMessage(e.target.value)}
                    placeholder="Enter text message"
                    className="w-full h-32 resize-none"
                  />
                </div>
              </Collapsible.Content>
            </Collapsible.Root>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SettingsMenu;
