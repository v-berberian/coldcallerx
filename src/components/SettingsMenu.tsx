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
            <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> Email Template</Label>
            <Input
              placeholder="Email subject"
              value={emailTemplateSubject}
              onChange={e => setEmailTemplateSubject(e.target.value)}
              className="text-sm"
            />
            <Textarea
              placeholder="Email body"
              value={emailTemplateBody}
              onChange={e => setEmailTemplateBody(e.target.value)}
              className="text-sm min-h-[80px]"
            />
          </div>
          <Separator />
          {/* Text Template (singular) */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2"><MessageSquare className="h-4 w-4 text-muted-foreground" /> Text Template</Label>
            <Textarea
              placeholder="Text message"
              value={textTemplateMessage}
              onChange={e => setTextTemplateMessage(e.target.value)}
              className="text-sm min-h-[80px]"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SettingsMenu;
