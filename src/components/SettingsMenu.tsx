
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
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [textTemplates, setTextTemplates] = useState<TextTemplate[]>([]);
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState<string>('');
  const [selectedTextTemplate, setSelectedTextTemplate] = useState<string>('');
  const [editingEmailTemplate, setEditingEmailTemplate] = useState<EmailTemplate | null>(null);
  const [editingTextTemplate, setEditingTextTemplate] = useState<TextTemplate | null>(null);
  const [isCreatingEmail, setIsCreatingEmail] = useState(false);
  const [isCreatingText, setIsCreatingText] = useState(false);
  const [emailTemplateName, setEmailTemplateName] = useState('');
  const [emailTemplateSubject, setEmailTemplateSubject] = useState('');
  const [emailTemplateBody, setEmailTemplateBody] = useState('');
  const [textTemplateName, setTextTemplateName] = useState('');
  const [textTemplateMessage, setTextTemplateMessage] = useState('');
  const [emailDropdownOpen, setEmailDropdownOpen] = useState(false);
  const [textDropdownOpen, setTextDropdownOpen] = useState(false);

  // Load templates and selections from localStorage on mount
  useEffect(() => {
    const savedEmailTemplates = localStorage.getItem('emailTemplates');
    if (savedEmailTemplates) {
      setEmailTemplates(JSON.parse(savedEmailTemplates));
    }

    const savedTextTemplates = localStorage.getItem('textTemplates');
    if (savedTextTemplates) {
      setTextTemplates(JSON.parse(savedTextTemplates));
    }

    const savedSelectedEmailTemplate = localStorage.getItem('selectedEmailTemplate');
    if (savedSelectedEmailTemplate) {
      setSelectedEmailTemplate(savedSelectedEmailTemplate);
    }

    const savedSelectedTextTemplate = localStorage.getItem('selectedTextTemplate');
    if (savedSelectedTextTemplate) {
      setSelectedTextTemplate(savedSelectedTextTemplate);
    }
  }, []);

  // Save email templates to localStorage
  const saveEmailTemplates = (templates: EmailTemplate[]) => {
    localStorage.setItem('emailTemplates', JSON.stringify(templates));
    setEmailTemplates(templates);
  };

  // Save text templates to localStorage
  const saveTextTemplates = (templates: TextTemplate[]) => {
    localStorage.setItem('textTemplates', JSON.stringify(templates));
    setTextTemplates(templates);
  };

  // Save selected email template
  const saveSelectedEmailTemplate = (templateId: string) => {
    localStorage.setItem('selectedEmailTemplate', templateId);
    setSelectedEmailTemplate(templateId);
  };

  // Save selected text template
  const saveSelectedTextTemplate = (templateId: string) => {
    localStorage.setItem('selectedTextTemplate', templateId);
    setSelectedTextTemplate(templateId);
  };

  const handleCreateEmailTemplate = () => {
    if (!emailTemplateName.trim() || !emailTemplateSubject.trim()) return;
    
    const newTemplate: EmailTemplate = {
      id: Date.now().toString(),
      name: emailTemplateName,
      subject: emailTemplateSubject,
      body: emailTemplateBody
    };
    
    const updatedTemplates = [...emailTemplates, newTemplate];
    saveEmailTemplates(updatedTemplates);
    
    // Reset form
    setEmailTemplateName('');
    setEmailTemplateSubject('');
    setEmailTemplateBody('');
    setIsCreatingEmail(false);
  };

  const handleCreateTextTemplate = () => {
    if (!textTemplateName.trim() || !textTemplateMessage.trim()) return;
    
    const newTemplate: TextTemplate = {
      id: Date.now().toString(),
      name: textTemplateName,
      message: textTemplateMessage
    };
    
    const updatedTemplates = [...textTemplates, newTemplate];
    saveTextTemplates(updatedTemplates);
    
    // Reset form
    setTextTemplateName('');
    setTextTemplateMessage('');
    setIsCreatingText(false);
  };

  const handleEditEmailTemplate = (template: EmailTemplate) => {
    setEditingEmailTemplate(template);
    setEmailTemplateName(template.name);
    setEmailTemplateSubject(template.subject);
    setEmailTemplateBody(template.body);
    setIsCreatingEmail(true);
  };

  const handleEditTextTemplate = (template: TextTemplate) => {
    setEditingTextTemplate(template);
    setTextTemplateName(template.name);
    setTextTemplateMessage(template.message);
    setIsCreatingText(true);
  };

  const handleUpdateEmailTemplate = () => {
    if (!editingEmailTemplate || !emailTemplateName.trim() || !emailTemplateSubject.trim()) return;
    
    const updatedTemplates = emailTemplates.map(t => 
      t.id === editingEmailTemplate.id 
        ? { ...editingEmailTemplate, name: emailTemplateName, subject: emailTemplateSubject, body: emailTemplateBody }
        : t
    );
    
    saveEmailTemplates(updatedTemplates);
    
    // Reset form
    setEmailTemplateName('');
    setEmailTemplateSubject('');
    setEmailTemplateBody('');
    setIsCreatingEmail(false);
    setEditingEmailTemplate(null);
  };

  const handleUpdateTextTemplate = () => {
    if (!editingTextTemplate || !textTemplateName.trim() || !textTemplateMessage.trim()) return;
    
    const updatedTemplates = textTemplates.map(t => 
      t.id === editingTextTemplate.id 
        ? { ...editingTextTemplate, name: textTemplateName, message: textTemplateMessage }
        : t
    );
    
    saveTextTemplates(updatedTemplates);
    
    // Reset form
    setTextTemplateName('');
    setTextTemplateMessage('');
    setIsCreatingText(false);
    setEditingTextTemplate(null);
  };

  const handleDeleteEmailTemplate = (templateId: string) => {
    const updatedTemplates = emailTemplates.filter(t => t.id !== templateId);
    saveEmailTemplates(updatedTemplates);
    
    // Clear selection if deleted template was selected
    if (selectedEmailTemplate === templateId) {
      saveSelectedEmailTemplate('');
    }
  };

  const handleDeleteTextTemplate = (templateId: string) => {
    const updatedTemplates = textTemplates.filter(t => t.id !== templateId);
    saveTextTemplates(updatedTemplates);
    
    // Clear selection if deleted template was selected
    if (selectedTextTemplate === templateId) {
      saveSelectedTextTemplate('');
    }
  };

  const cancelEmailEditing = () => {
    setEmailTemplateName('');
    setEmailTemplateSubject('');
    setEmailTemplateBody('');
    setIsCreatingEmail(false);
    setEditingEmailTemplate(null);
  };

  const cancelTextEditing = () => {
    setTextTemplateName('');
    setTextTemplateMessage('');
    setIsCreatingText(false);
    setEditingTextTemplate(null);
  };

  // Get selected template names for display
  const selectedEmailTemplateName = emailTemplates.find(t => t.id === selectedEmailTemplate)?.name || 'None selected';
  const selectedTextTemplateName = textTemplates.find(t => t.id === selectedTextTemplate)?.name || 'None selected';

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
          
          {/* Email Templates Submenu */}
          <div className="space-y-3">
            <DropdownMenu onOpenChange={setEmailDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between h-auto p-3 border border-border/20 hover:bg-muted/30"
                >
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Email Templates</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${emailDropdownOpen ? 'rotate-180' : ''}`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-96 p-4" align="start">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Email Templates</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCreatingEmail(true)}
                      className="h-8 px-3"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>

                  {/* Template Selection */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Default Template</Label>
                    <div className="space-y-1">
                      <div 
                        className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-muted/50 ${selectedEmailTemplate === '' ? 'bg-muted' : ''}`}
                        onClick={() => saveSelectedEmailTemplate('')}
                      >
                        <span className="text-sm">None (Manual email)</span>
                        {selectedEmailTemplate === '' && <Check className="h-4 w-4 text-foreground" />}
                      </div>
                      {emailTemplates.map((template) => (
                        <div 
                          key={template.id}
                          className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-muted/50 ${selectedEmailTemplate === template.id ? 'bg-muted' : ''}`}
                          onClick={() => saveSelectedEmailTemplate(template.id)}
                        >
                          <span className="text-sm">{template.name}</span>
                          {selectedEmailTemplate === template.id && <Check className="h-4 w-4 text-foreground" />}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Email Template Creation/Edit Form */}
                  {isCreatingEmail && (
                    <div className="bg-muted/30 rounded-lg p-3 space-y-3">
                      <Input
                        placeholder="Template name"
                        value={emailTemplateName}
                        onChange={(e) => setEmailTemplateName(e.target.value)}
                        className="text-sm"
                      />
                      <Input
                        placeholder="Email subject"
                        value={emailTemplateSubject}
                        onChange={(e) => setEmailTemplateSubject(e.target.value)}
                        className="text-sm"
                      />
                      <Textarea
                        placeholder="Email body"
                        value={emailTemplateBody}
                        onChange={(e) => setEmailTemplateBody(e.target.value)}
                        className="text-sm min-h-[80px]"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={editingEmailTemplate ? handleUpdateEmailTemplate : handleCreateEmailTemplate}
                          className="flex-1"
                        >
                          {editingEmailTemplate ? 'Update' : 'Save'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEmailEditing}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Email Templates List */}
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {emailTemplates.map((template) => (
                      <div key={template.id} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{template.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{template.subject}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditEmailTemplate(template)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteEmailTemplate(template.id)}
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {emailTemplates.length === 0 && !isCreatingEmail && (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        No email templates created yet
                      </p>
                    )}
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Text Templates Submenu */}
          <div className="space-y-3">
            <DropdownMenu onOpenChange={setTextDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between h-auto p-3 border border-border/20 hover:bg-muted/30"
                >
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Text Templates</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${textDropdownOpen ? 'rotate-180' : ''}`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-96 p-4" align="start">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Text Templates</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCreatingText(true)}
                      className="h-8 px-3"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>

                  {/* Template Selection */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Default Template</Label>
                    <div className="space-y-1">
                      <div 
                        className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-muted/50 ${selectedTextTemplate === '' ? 'bg-muted' : ''}`}
                        onClick={() => saveSelectedTextTemplate('')}
                      >
                        <span className="text-sm">None (Manual text)</span>
                        {selectedTextTemplate === '' && <Check className="h-4 w-4 text-foreground" />}
                      </div>
                      {textTemplates.map((template) => (
                        <div 
                          key={template.id}
                          className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-muted/50 ${selectedTextTemplate === template.id ? 'bg-muted' : ''}`}
                          onClick={() => saveSelectedTextTemplate(template.id)}
                        >
                          <span className="text-sm">{template.name}</span>
                          {selectedTextTemplate === template.id && <Check className="h-4 w-4 text-foreground" />}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Text Template Creation/Edit Form */}
                  {isCreatingText && (
                    <div className="bg-muted/30 rounded-lg p-3 space-y-3">
                      <Input
                        placeholder="Template name"
                        value={textTemplateName}
                        onChange={(e) => setTextTemplateName(e.target.value)}
                        className="text-sm"
                      />
                      <Textarea
                        placeholder="Text message"
                        value={textTemplateMessage}
                        onChange={(e) => setTextTemplateMessage(e.target.value)}
                        className="text-sm min-h-[80px]"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={editingTextTemplate ? handleUpdateTextTemplate : handleCreateTextTemplate}
                          className="flex-1"
                        >
                          {editingTextTemplate ? 'Update' : 'Save'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelTextEditing}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Text Templates List */}
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {textTemplates.map((template) => (
                      <div key={template.id} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{template.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{template.message}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditTextTemplate(template)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteTextTemplate(template.id)}
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {textTemplates.length === 0 && !isCreatingText && (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        No text templates created yet
                      </p>
                    )}
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
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
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-96 p-4" align="start">
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
