import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Settings, ChevronDown, ChevronRight, Plus, Trash2, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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

const SettingsMenu = () => {
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [textTemplates, setTextTemplates] = useState<TextTemplate[]>([]);
  const [newEmailTemplate, setNewEmailTemplate] = useState<EmailTemplate>({ id: '', name: '', subject: '', body: '' });
  const [newTextTemplate, setNewTextTemplate] = useState<TextTemplate>({ id: '', name: '', message: '' });
  const [editingEmailTemplate, setEditingEmailTemplate] = useState<EmailTemplate | null>(null);
  const [editingTextTemplate, setEditingTextTemplate] = useState<TextTemplate | null>(null);
  const [selectedEmailTemplateId, setSelectedEmailTemplateId] = useState<string>('');
  const [selectedTextTemplateId, setSelectedTextTemplateId] = useState<string>('');
  const [emailSubmenuOpen, setEmailSubmenuOpen] = useState(false);
  const [textSubmenuOpen, setTextSubmenuOpen] = useState(false);

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
      setSelectedEmailTemplateId(savedSelectedEmailTemplate);
    }

    const savedSelectedTextTemplate = localStorage.getItem('selectedTextTemplate');
    if (savedSelectedTextTemplate) {
      setSelectedTextTemplateId(savedSelectedTextTemplate);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('emailTemplates', JSON.stringify(emailTemplates));
  }, [emailTemplates]);

  useEffect(() => {
    localStorage.setItem('textTemplates', JSON.stringify(textTemplates));
  }, [textTemplates]);

  useEffect(() => {
    localStorage.setItem('selectedEmailTemplate', selectedEmailTemplateId);
  }, [selectedEmailTemplateId]);

  useEffect(() => {
    localStorage.setItem('selectedTextTemplate', selectedTextTemplateId);
  }, [selectedTextTemplateId]);

  const saveEmailTemplate = () => {
    if (newEmailTemplate.name && newEmailTemplate.subject && newEmailTemplate.body) {
      const newTemplate = { ...newEmailTemplate, id: Date.now().toString() };
      setEmailTemplates([...emailTemplates, newTemplate]);
      setNewEmailTemplate({ id: '', name: '', subject: '', body: '' });
    }
  };

  const saveTextTemplate = () => {
    if (newTextTemplate.name && newTextTemplate.message) {
      const newTemplate = { ...newTextTemplate, id: Date.now().toString() };
      setTextTemplates([...textTemplates, newTemplate]);
      setNewTextTemplate({ id: '', name: '', message: '' });
    }
  };

  const updateEmailTemplate = (id: string) => {
    if (editingEmailTemplate && editingEmailTemplate.name && editingEmailTemplate.subject && editingEmailTemplate.body) {
      setEmailTemplates(emailTemplates.map(template =>
        template.id === id ? editingEmailTemplate : template
      ));
      setEditingEmailTemplate(null);
    }
  };

  const updateTextTemplate = (id: string) => {
    if (editingTextTemplate && editingTextTemplate.name && editingTextTemplate.message) {
      setTextTemplates(textTemplates.map(template =>
        template.id === id ? editingTextTemplate : template
      ));
      setEditingTextTemplate(null);
    }
  };

  const deleteEmailTemplate = (id: string) => {
    setEmailTemplates(emailTemplates.filter(template => template.id !== id));
  };

  const deleteTextTemplate = (id: string) => {
    setTextTemplates(textTemplates.filter(template => template.id !== id));
  };

  const handleEmailTemplateSelect = (templateId: string) => {
    setSelectedEmailTemplateId(templateId);
  };

  const handleTextTemplateSelect = (templateId: string) => {
    setSelectedTextTemplateId(templateId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {/* Email Templates Submenu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full flex items-center justify-between px-2 py-1.5 text-sm hover:bg-accent rounded-sm">
            <span>Email Templates</span>
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${emailSubmenuOpen ? 'rotate-180' : ''}`} />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="left" align="start" className="w-64">
            <div className="p-2">
              <p className="text-xs text-muted-foreground mb-2">Select default template:</p>
              <DropdownMenu>
                <DropdownMenuTrigger className="w-full flex items-center justify-between px-2 py-1.5 text-sm border rounded hover:bg-accent">
                  <span className="truncate">
                    {selectedEmailTemplateId 
                      ? emailTemplates.find(t => t.id === selectedEmailTemplateId)?.name || 'Select template'
                      : 'No template selected'
                    }
                  </span>
                  <ChevronDown className="h-4 w-4 flex-shrink-0" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64">
                  <DropdownMenuItem onClick={() => handleEmailTemplateSelect('')}>
                    <div className="flex items-center justify-between w-full">
                      <span>No template</span>
                      {!selectedEmailTemplateId && <Check className="h-4 w-4" />}
                    </div>
                  </DropdownMenuItem>
                  {emailTemplates.map((template) => (
                    <DropdownMenuItem key={template.id} onClick={() => handleEmailTemplateSelect(template.id)}>
                      <div className="flex items-center justify-between w-full">
                        <span className="truncate">{template.name}</span>
                        {selectedEmailTemplateId === template.id && <Check className="h-4 w-4" />}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="border-t pt-2">
              {emailTemplates.map((template) => (
                <div key={template.id} className="flex items-center justify-between px-2 py-1.5 hover:bg-accent">
                  <span className="text-sm truncate flex-1">{template.name}</span>
                  <div className="flex gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Settings className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Email Template</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="edit-email-name">Template Name</Label>
                            <Input
                              id="edit-email-name"
                              value={editingEmailTemplate?.name || ''}
                              onChange={(e) => setEditingEmailTemplate(prev => prev ? {...prev, name: e.target.value} : null)}
                              onFocus={() => setEditingEmailTemplate(template)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-email-subject">Subject</Label>
                            <Input
                              id="edit-email-subject"
                              value={editingEmailTemplate?.subject || ''}
                              onChange={(e) => setEditingEmailTemplate(prev => prev ? {...prev, subject: e.target.value} : null)}
                              placeholder="Use {name} and {company} for placeholders"
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-email-body">Body</Label>
                            <Textarea
                              id="edit-email-body"
                              value={editingEmailTemplate?.body || ''}
                              onChange={(e) => setEditingEmailTemplate(prev => prev ? {...prev, body: e.target.value} : null)}
                              placeholder="Use {name}, {company}, and {phone} for placeholders"
                              rows={4}
                            />
                          </div>
                          <Button onClick={() => updateEmailTemplate(template.id)} className="w-full">
                            Update Template
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteEmailTemplate(template.id)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start text-sm" onClick={() => setNewEmailTemplate({id: '', name: '', subject: '', body: ''})}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Email Template
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Email Template</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email-name">Template Name</Label>
                      <Input
                        id="email-name"
                        value={newEmailTemplate.name}
                        onChange={(e) => setNewEmailTemplate(prev => ({...prev, name: e.target.value}))}
                        placeholder="e.g., Introduction Email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email-subject">Subject</Label>
                      <Input
                        id="email-subject"
                        value={newEmailTemplate.subject}
                        onChange={(e) => setNewEmailTemplate(prev => ({...prev, subject: e.target.value}))}
                        placeholder="Use {name} and {company} for placeholders"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email-body">Body</Label>
                      <Textarea
                        id="email-body"
                        value={newEmailTemplate.body}
                        onChange={(e) => setNewEmailTemplate(prev => ({...prev, body: e.target.value}))}
                        placeholder="Use {name}, {company}, and {phone} for placeholders"
                        rows={4}
                      />
                    </div>
                    <Button onClick={saveEmailTemplate} className="w-full">
                      Save Template
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Text Templates Submenu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full flex items-center justify-between px-2 py-1.5 text-sm hover:bg-accent rounded-sm">
            <span>Text Templates</span>
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${textSubmenuOpen ? 'rotate-180' : ''}`} />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="left" align="start" className="w-64">
            <div className="p-2">
              <p className="text-xs text-muted-foreground mb-2">Select default template:</p>
              <DropdownMenu>
                <DropdownMenuTrigger className="w-full flex items-center justify-between px-2 py-1.5 text-sm border rounded hover:bg-accent">
                  <span className="truncate">
                    {selectedTextTemplateId 
                      ? textTemplates.find(t => t.id === selectedTextTemplateId)?.name || 'Select template'
                      : 'No template selected'
                    }
                  </span>
                  <ChevronDown className="h-4 w-4 flex-shrink-0" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64">
                  <DropdownMenuItem onClick={() => handleTextTemplateSelect('')}>
                    <div className="flex items-center justify-between w-full">
                      <span>No template</span>
                      {!selectedTextTemplateId && <Check className="h-4 w-4" />}
                    </div>
                  </DropdownMenuItem>
                  {textTemplates.map((template) => (
                    <DropdownMenuItem key={template.id} onClick={() => handleTextTemplateSelect(template.id)}>
                      <div className="flex items-center justify-between w-full">
                        <span className="truncate">{template.name}</span>
                        {selectedTextTemplateId === template.id && <Check className="h-4 w-4" />}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="border-t pt-2">
              {textTemplates.map((template) => (
                <div key={template.id} className="flex items-center justify-between px-2 py-1.5 hover:bg-accent">
                  <span className="text-sm truncate flex-1">{template.name}</span>
                  <div className="flex gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Settings className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Text Template</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="edit-text-name">Template Name</Label>
                            <Input
                              id="edit-text-name"
                              value={editingTextTemplate?.name || ''}
                              onChange={(e) => setEditingTextTemplate(prev => prev ? {...prev, name: e.target.value} : null)}
                              onFocus={() => setEditingTextTemplate(template)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-text-message">Message</Label>
                            <Textarea
                              id="edit-text-message"
                              value={editingTextTemplate?.message || ''}
                              onChange={(e) => setEditingTextTemplate(prev => prev ? {...prev, message: e.target.value} : null)}
                              placeholder="Use {name} and {company} for placeholders"
                              rows={4}
                            />
                          </div>
                          <Button onClick={() => updateTextTemplate(template.id)} className="w-full">
                            Update Template
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTextTemplate(template.id)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start text-sm" onClick={() => setNewTextTemplate({id: '', name: '', message: ''})}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Text Template
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Text Template</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="text-name">Template Name</Label>
                      <Input
                        id="text-name"
                        value={newTextTemplate.name}
                        onChange={(e) => setNewTextTemplate(prev => ({...prev, name: e.target.value}))}
                        placeholder="e.g., Introduction Text"
                      />
                    </div>
                    <div>
                      <Label htmlFor="text-message">Message</Label>
                      <Textarea
                        id="text-message"
                        value={newTextTemplate.message}
                        onChange={(e) => setNewTextTemplate(prev => ({...prev, message: e.target.value}))}
                        placeholder="Use {name} and {company} for placeholders"
                        rows={4}
                      />
                    </div>
                    <Button onClick={saveTextTemplate} className="w-full">
                      Save Template
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SettingsMenu;
