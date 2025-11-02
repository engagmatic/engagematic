import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send } from "lucide-react";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface UserEmailDialogProps {
  user: any;
  templates: any[];
  onSent: () => void;
}

export function UserEmailDialog({ user, templates, onSent }: UserEmailDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ subject: '', htmlContent: '', templateId: '' });
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!form.subject || !form.htmlContent) {
      toast.error('Subject and content are required');
      return;
    }

    setSending(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/users/${user._id}/send-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          templateId: form.templateId || undefined,
          subject: form.subject,
          htmlContent: form.htmlContent,
          emailType: 'custom'
        })
      });

      if (response.ok) {
        toast.success('Email sent successfully');
        setOpen(false);
        setForm({ subject: '', htmlContent: '', templateId: '' });
        onSent();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Error sending email');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Send className="w-4 h-4 mr-2" />Send Email
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send Email to {user.name}</DialogTitle>
          <DialogDescription>Compose and send an email to this user</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label>Template (Optional)</Label>
            <Select 
              value={form.templateId} 
              onValueChange={(value) => {
                const template = templates.find(t => t._id === value);
                if (template) {
                  setForm({
                    ...form,
                    templateId: value,
                    subject: template.subject,
                    htmlContent: template.htmlContent
                  });
                } else {
                  setForm({...form, templateId: value});
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Custom</SelectItem>
                {templates.map((t) => (
                  <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Subject</Label>
            <Input 
              value={form.subject}
              onChange={(e) => setForm({...form, subject: e.target.value})}
              placeholder="Email subject"
            />
          </div>
          <div>
            <Label>Content</Label>
            <Textarea 
              value={form.htmlContent}
              onChange={(e) => setForm({...form, htmlContent: e.target.value})}
              placeholder="Email content (HTML)"
              className="min-h-[200px]"
            />
          </div>
          <Button 
            className="w-full"
            onClick={handleSend}
            disabled={sending}
          >
            {sending ? 'Sending...' : 'Send Email'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

