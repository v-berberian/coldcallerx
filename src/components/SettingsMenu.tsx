
import React, { useState, useEffect } from 'react';
import { Mail, HelpCircle, ChevronRight, Plus, Edit, Trash2 } from 'lucide-react';
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

interface SettingsMenuProps {
  children: React.ReactNode;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ children }) => {
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateBody, setTemplateBody] = useState('');

  // Load templates from localStorage on mount
  useEffect(() => {
    const savedTemplates = localStorage.getItem('emailTemplates');
    if (savedTemplates) {
      setEmailTemplates(JSON.parse(savedTemplates));
    }
  }, []);

  // Save templates to localStorage
  const saveTemplates = (templates: EmailTemplate[]) => {
    localStorage.setItem('emailTemplates', JSON.stringify(templates));
    setEmailTemplates(templates);
  };

  const handleCreateTemplate = () => {
    if (!templateName.trim() || !templateSubject.trim()) return;
    
    const newTemplate: EmailTemplate = {
      id: Date.now().toString(),
      name: templateName,
      subject: templateSubject,
      body: templateBody
    };
    
    const updatedTemplates = [...emailTemplates, newTemplate];
    saveTemplates(updatedTemplates);
    
    // Reset form
    setTemplateName('');
    setTemplateSubject('');
    setTemplateBody('');
    setIsCreating(false);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setTemplateSubject(template.subject);
    setTemplateBody(template.body);
    setIsCreating(true);
  };

  const handleUpdateTemplate = () => {
    if (!editingTemplate || !templateName.trim() || !templateSubject.trim()) return;
    
    const updatedTemplates = emailTemplates.map(t => 
      t.id === editingTemplate.id 
        ? { ...editingTemplate, name: templateName, subject: templateSubject, body: templateBody }
        : t
    );
    
    saveTemplates(updatedTemplates);
    
    // Reset form
    setTemplateName('');
    setTemplateSubject('');
    setTemplateBody('');
    setIsCreating(false);
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (templateId: string) => {
    const updatedTemplates = emailTemplates.filter(t => t.id !== templateId);
    saveTemplates(updatedTemplates);
  };

  const cancelEditing = () => {
    setTemplateName('');
    setTemplateSubject('');
    setTemplateBody('');
    setIsCreating(false);
    setEditingTemplate(null);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-96 p-4" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Settings</h4>
            <p className="text-sm text-muted-foreground">
              Manage your app preferences
            </p>
          </div>
          
          <Separator />
          
          {/* Email Templates */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Email Templates</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreating(true)}
                className="h-8 px-3"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            
            {/* Template Creation/Edit Form */}
            {isCreating && (
              <div className="bg-muted/30 rounded-lg p-3 space-y-3">
                <Input
                  placeholder="Template name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="text-sm"
                />
                <Input
                  placeholder="Email subject"
                  value={templateSubject}
                  onChange={(e) => setTemplateSubject(e.target.value)}
                  className="text-sm"
                />
                <Textarea
                  placeholder="Email body"
                  value={templateBody}
                  onChange={(e) => setTemplateBody(e.target.value)}
                  className="text-sm min-h-[80px]"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
                    className="flex-1"
                  >
                    {editingTemplate ? 'Update' : 'Save'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={cancelEditing}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            
            {/* Templates List */}
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
                      onClick={() => handleEditTemplate(template)}
                      className="h-6 w-6 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              {emailTemplates.length === 0 && !isCreating && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No email templates created yet
                </p>
              )}
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
