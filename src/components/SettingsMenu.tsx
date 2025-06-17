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
      <PopoverContent className="w-80 p-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Templates</h4>
            <p className="text-sm text-muted-foreground">Customize your email and text templates</p>
          </div>

          <Separator />

          {/* Email Template Section */}
          <Collapsible.Root 
            open={emailOpen} 
            onOpenChange={setEmailOpen}
            className="space-y-2"
          >
            <Collapsible.Trigger className="flex w-full items-center justify-between rounded-md p-2 hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Email Template</span>
              </div>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${emailOpen ? 'rotate-180' : ''}`} />
            </Collapsible.Trigger>
            <Collapsible.Content className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={emailTemplateSubject}
                  onChange={(e) => setEmailTemplateSubject(e.target.value)}
                  placeholder="Enter email subject"
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Body</Label>
                <Textarea
                  value={emailTemplateBody}
                  onChange={(e) => setEmailTemplateBody(e.target.value)}
                  placeholder="Enter email body"
                  rows={8}
                  className="min-h-[200px] bg-background/50"
                />
              </div>
            </Collapsible.Content>
          </Collapsible.Root>

          <Separator />

          {/* Text Template Section */}
          <Collapsible.Root 
            open={textOpen} 
            onOpenChange={setTextOpen}
            className="space-y-2"
          >
            <Collapsible.Trigger className="flex w-full items-center justify-between rounded-md p-2 hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Text Template</span>
              </div>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${textOpen ? 'rotate-180' : ''}`} />
            </Collapsible.Trigger>
            <Collapsible.Content className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  value={textTemplateMessage}
                  onChange={(e) => setTextTemplateMessage(e.target.value)}
                  placeholder="Enter text message"
                  rows={8}
                  className="min-h-[200px] bg-background/50"
                />
              </div>
            </Collapsible.Content>
          </Collapsible.Root>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SettingsMenu;
