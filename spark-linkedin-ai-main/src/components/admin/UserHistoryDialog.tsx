import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Eye, MousePointerClick, CheckCircle, XCircle, Clock } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface UserHistoryDialogProps {
  user: any;
  getEmailTypeBadge: (type: string) => JSX.Element;
  getStatusBadge: (status: string) => JSX.Element;
}

export function UserHistoryDialog({ user, getEmailTypeBadge, getStatusBadge }: UserHistoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [communications, setCommunications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCommunications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/users/${user._id}/communications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCommunications(data.data?.communications || []);
      }
    } catch (error) {
      console.error('Error fetching communications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchCommunications();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Mail className="w-4 h-4 mr-2" />View History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Communication History - {user.name}</DialogTitle>
          <DialogDescription>All emails sent to {user.email}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin">Loading...</div>
            </div>
          ) : communications.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No communications yet</p>
          ) : (
            communications.map((comm) => (
              <Card key={comm._id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getEmailTypeBadge(comm.emailType)}
                      {getStatusBadge(comm.status)}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comm.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="font-medium">{comm.subject}</p>
                  <div className="flex items-center gap-4 text-xs mt-2">
                    {comm.openedAt && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Eye className="w-3 h-3" />
                        <span>Opened: {new Date(comm.openedAt).toLocaleString()}</span>
                      </div>
                    )}
                    {comm.clickedAt && (
                      <div className="flex items-center gap-1 text-purple-600">
                        <MousePointerClick className="w-3 h-3" />
                        <span>Clicked: {new Date(comm.clickedAt).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

