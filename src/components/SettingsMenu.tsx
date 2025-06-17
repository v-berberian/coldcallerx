
import React, { useState, useEffect } from 'react';
import { Mail, HelpCircle, ChevronDown, MessageSquare } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import * as Collapsible from '@radix-ui/react-collapsible';
import { useTemplate } from '../contexts/TemplateContext';

interface SettingsMenuProps {
  children: React.ReactNode;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ children }) => {
  const {
    emailSubject,
    emailBody,
    textMessage,
    setEmailSubject,
    setEmailBody,
    setTextMessage,
  } = useTemplate();

  const [emailTemplateSubject, setEmailTemplateSubject] = useState(emailSubject);
  const [emailTemplateBody, setEmailTemplateBody] = useState(emailBody);
  const [textTemplateMessage, setTextTemplateMessage] = useState(textMessage);
  const [emailOpen, setEmailOpen] = useState(false);
  const [textOpen, setTextOpen] = useState(false);
  const [mainMenu, setMainMenu] = useState<'templates' | 'help' | null>(null);

  useEffect(() => {
    setEmailTemplateSubject(emailSubject);
  }, [emailSubject]);
  useEffect(() => {
    setEmailTemplateBody(emailBody);
  }, [emailBody]);
  useEffect(() => {
    setTextTemplateMessage(textMessage);
  }, [textMessage]);

  const handleUpdateEmail = () => {
    setEmailSubject(emailTemplateSubject);
    setEmailBody(emailTemplateBody);
  };

  const handleUpdateText = () => {
    setTextMessage(textTemplateMessage);
  };

  const handleShareEmail = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: emailTemplateSubject,
          text: emailTemplateBody,
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(`${emailTemplateSubject}\n\n${emailTemplateBody}`);
        console.log('Email template copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing email:', error);
    }
  };

  const handleShareSMS = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          text: textTemplateMessage,
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(textTemplateMessage);
        console.log('Text template copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing SMS:', error);
    }
  };

  // Ensure only one submenu is open at a time
  const handleEmailOpen = (open: boolean) => {
    setEmailOpen(open);
    if (open) setTextOpen(false);
  };
  const handleTextOpen = (open: boolean) => {
    setTextOpen(open);
    if (open) setEmailOpen(false);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        className="w-[calc(100vw-2rem)] sm:w-[400px] p-4 border-border/20 shadow-lg"
        sideOffset={5}
        align="end"
      >
        <div className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Templates</h3>
              <p className="text-xs text-muted-foreground">Customize your email and text templates</p>
            </div>

            {/* Templates Category as menu */}
            <Collapsible.Root open={mainMenu === 'templates'} onOpenChange={open => setMainMenu(open ? 'templates' : null)} className="space-y-2 w-full">
              <Collapsible.Trigger asChild>
                <button className="w-full flex items-center justify-between p-3 rounded-lg border border-border/20 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Templates</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${mainMenu === 'templates' ? 'rotate-180' : ''}`} />
                </button>
              </Collapsible.Trigger>
              <Collapsible.Content className="space-y-4 data-[state=open]:animate-template-down data-[state=closed]:animate-template-up overflow-hidden">
                <div className="space-y-4">
                  {/* Email Template */}
                  <Collapsible.Root open={emailOpen} onOpenChange={setEmailOpen} className="space-y-2">
                    <Collapsible.Trigger asChild>
                      <button className="w-full flex items-center justify-between p-3 rounded-lg border border-border/20 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Email Template</span>
                        </div>
                        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${emailOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </Collapsible.Trigger>
                    <Collapsible.Content className="space-y-3 data-[state=open]:animate-template-down data-[state=closed]:animate-template-up overflow-hidden">
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
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleUpdateEmail}
                          className="w-full rounded-lg active:scale-95 transition-transform duration-100"
                        >
                          Update
                        </Button>
                      </div>
                    </Collapsible.Content>
                  </Collapsible.Root>
                  {/* Text Template */}
                  <Collapsible.Root open={textOpen} onOpenChange={setTextOpen} className="space-y-2">
                    <Collapsible.Trigger asChild>
                      <button className="w-full flex items-center justify-between p-3 rounded-lg border border-border/20 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Text Template</span>
                        </div>
                        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${textOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </Collapsible.Trigger>
                    <Collapsible.Content className="space-y-3 data-[state=open]:animate-template-down data-[state=closed]:animate-template-up overflow-hidden">
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
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleUpdateText}
                          className="w-full rounded-lg active:scale-95 transition-transform duration-100"
                        >
                          Update
                        </Button>
                      </div>
                    </Collapsible.Content>
                  </Collapsible.Root>
                </div>
              </Collapsible.Content>
            </Collapsible.Root>
            {/* Help Category as menu */}
            <Collapsible.Root open={mainMenu === 'help'} onOpenChange={open => setMainMenu(open ? 'help' : null)} className="space-y-2 w-full">
              <Collapsible.Trigger asChild>
                <button className="w-full flex items-center justify-between p-3 rounded-lg border border-border/20 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Help</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${mainMenu === 'help' ? 'rotate-180' : ''}`} />
                </button>
              </Collapsible.Trigger>
              <Collapsible.Content className="space-y-4 data-[state=open]:animate-template-down data-[state=closed]:animate-template-up overflow-hidden">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Find answers and CSV upload instructions</p>
                  <Collapsible.Root className="space-y-2 w-full">
                    <Collapsible.Trigger asChild>
                      <button className="w-full flex items-center justify-between p-3 rounded-lg border border-border/20 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2">
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">CSV Upload Guide</span>
                        </div>
                        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200`} />
                      </button>
                    </Collapsible.Trigger>
                    <Collapsible.Content className="space-y-3 data-[state=open]:animate-template-down data-[state=closed]:animate-template-up overflow-hidden">
                      <div className="bg-muted/30 rounded-lg p-4 space-y-3 mx-auto max-w-xs">
                        <p className="text-sm font-medium text-foreground text-center">CSV Upload Guide</p>
                        <div className="text-xs text-muted-foreground space-y-1 text-center">
                          <div><span className="font-medium">A:</span> Company (optional)</div>
                          <div><span className="font-medium">B:</span> Name (required)</div>
                          <div><span className="font-medium">C:</span> Phone (required)</div>
                          <div><span className="font-medium">D:</span> Additional Phones (optional)</div>
                          <div><span className="font-medium">E:</span> Email (optional)</div>
                        </div>
                      </div>
                    </Collapsible.Content>
                  </Collapsible.Root>
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
