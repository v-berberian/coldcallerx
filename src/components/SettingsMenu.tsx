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
  const [emailEditOpen, setEmailEditOpen] = useState(false);
  const [textEditOpen, setTextEditOpen] = useState(false);

  // Load templates from localStorage on mount
  useEffect(() => {
    const savedEmailSubject = localStorage.getItem('emailTemplateSubject');
    if (savedEmailSubject) setEmailTemplateSubject(savedEmailSubject);
    const savedEmailBody = localStorage.getItem('emailTemplateBody');
    if (savedEmailBody) setEmailTemplateBody(savedEmailBody);
    const savedTextMessage = localStorage.getItem('textTemplateMessage');
    if (savedTextMessage) setTextTemplateMessage(savedTextMessage);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('emailTemplateSubject', emailTemplateSubject);
  }, [emailTemplateSubject]);
  useEffect(() => {
    localStorage.setItem('emailTemplateBody', emailTemplateBody);
  }, [emailTemplateBody]);
  useEffect(() => {
    localStorage.setItem('textTemplateMessage', textTemplateMessage);
  }, [textTemplateMessage]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-96 p-4" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Settings</h4>
          </div>
          <Separator />
          {/* Email Template Row with Edit Submenu */}
          <div className="space-y-3">
            <Popover>
              <PopoverTrigger asChild>
                <div className="flex items-center justify-between cursor-pointer hover:bg-accent/50 p-2 rounded-md transition-colors">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">Email Template</Label>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input
                      value={emailTemplateSubject}
                      onChange={(e) => setEmailTemplateSubject(e.target.value)}
                      placeholder="Enter email subject"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Body</Label>
                    <Textarea
                      value={emailTemplateBody}
                      onChange={(e) => setEmailTemplateBody(e.target.value)}
                      placeholder="Enter email body"
                      rows={8}
                      className="min-h-[200px]"
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <div className="text-sm text-muted-foreground px-2">
              {emailTemplateSubject || 'No subject set'}
            </div>
          </div>
          <Separator />
          {/* Text Template (singular) */}
          <div className="space-y-3">
            <Popover>
              <PopoverTrigger asChild>
                <div className="flex items-center justify-between cursor-pointer hover:bg-accent/50 p-2 rounded-md transition-colors">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">Text Template</Label>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Message</Label>
                    <Textarea
                      value={textTemplateMessage}
                      onChange={(e) => setTextTemplateMessage(e.target.value)}
                      placeholder="Enter text message"
                      rows={8}
                      className="min-h-[200px]"
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <div className="text-sm text-muted-foreground px-2">
              {textTemplateMessage || 'No message set'}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SettingsMenu;
