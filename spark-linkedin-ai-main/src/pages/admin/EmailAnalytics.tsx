import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, 
  Send, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface EmailStats {
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  deliveryRate: number;
}

interface EmailLog {
  _id: string;
  userId: string;
  email: string;
  emailType: string;
  subject: string;
  status: 'sent' | 'failed' | 'pending' | 'bounced';
  sentAt: string;
  openedAt?: string;
  clickedAt?: string;
  createdAt: string;
}

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  targetAudience: string;
  scheduledAt?: string;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  stats: EmailStats;
}

export default function EmailAnalytics() {
  const [emailStats, setEmailStats] = useState<EmailStats>({
    totalSent: 0,
    totalOpened: 0,
    totalClicked: 0,
    openRate: 0,
    clickRate: 0,
    bounceRate: 0,
    deliveryRate: 0
  });
  
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  
  // Email campaign form
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    subject: '',
    content: '',
    targetAudience: 'inactive_users',
    scheduledAt: ''
  });

  useEffect(() => {
    fetchEmailAnalytics();
  }, []);

  const fetchEmailAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/email-analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEmailStats(data.stats);
        setEmailLogs(data.logs);
        setCampaigns(data.campaigns || []);
      } else {
        console.error('Failed to fetch email analytics');
        toast.error('Failed to load email analytics');
      }
    } catch (error) {
      console.error('Error fetching email analytics:', error);
      toast.error('Error loading email analytics');
    } finally {
      setLoading(false);
    }
  };

  const sendBulkEmail = async () => {
    if (!campaignForm.subject || !campaignForm.content) {
      toast.error('Please fill in subject and content');
      return;
    }

    setSendingEmail(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/send-bulk-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: campaignForm.subject,
          content: campaignForm.content,
          targetAudience: campaignForm.targetAudience,
          scheduledAt: campaignForm.scheduledAt || null
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Email sent to ${result.sentCount} users`);
        setCampaignForm({ name: '', subject: '', content: '', targetAudience: 'inactive_users', scheduledAt: '' });
        fetchEmailAnalytics();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending bulk email:', error);
      toast.error('Error sending email');
    } finally {
      setSendingEmail(false);
    }
  };

  const sendInactiveUserEmail = async () => {
    setSendingEmail(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/send-inactive-user-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Re-engagement email sent to ${result.sentCount} inactive users`);
        fetchEmailAnalytics();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to send inactive user email');
      }
    } catch (error) {
      console.error('Error sending inactive user email:', error);
      toast.error('Error sending email');
    } finally {
      setSendingEmail(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      sent: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      bounced: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getEmailTypeBadge = (emailType: string) => {
    const typeConfig = {
      welcome: 'bg-blue-100 text-blue-800',
      onboarding_day1: 'bg-purple-100 text-purple-800',
      onboarding_day3: 'bg-purple-100 text-purple-800',
      onboarding_day5: 'bg-purple-100 text-purple-800',
      onboarding_day7: 'bg-purple-100 text-purple-800',
      milestone_10_posts: 'bg-green-100 text-green-800',
      milestone_50_posts: 'bg-green-100 text-green-800',
      milestone_100_posts: 'bg-green-100 text-green-800',
      trial_expiry_7days: 'bg-orange-100 text-orange-800',
      trial_expiry_3days: 'bg-orange-100 text-orange-800',
      trial_expiry_1day: 'bg-orange-100 text-orange-800',
      trial_expired: 'bg-red-100 text-red-800',
      reengagement_7days: 'bg-yellow-100 text-yellow-800',
      reengagement_14days: 'bg-yellow-100 text-yellow-800',
      reengagement_30days: 'bg-yellow-100 text-yellow-800',
      custom: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={typeConfig[emailType as keyof typeof typeConfig] || 'bg-gray-100 text-gray-800'}>
        {emailType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Analytics</h1>
          <p className="text-muted-foreground">Monitor email performance and manage campaigns</p>
        </div>
        <Button onClick={fetchEmailAnalytics} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="logs">Email Logs</TabsTrigger>
          <TabsTrigger value="send">Send Email</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Email Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{emailStats.totalSent.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Delivery Rate: {emailStats.deliveryRate.toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{emailStats.openRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  {emailStats.totalOpened.toLocaleString()} opens
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{emailStats.clickRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  {emailStats.totalClicked.toLocaleString()} clicks
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{emailStats.bounceRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  Failed deliveries
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Send targeted emails to specific user groups</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={sendInactiveUserEmail} 
                  disabled={sendingEmail}
                  className="flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {sendingEmail ? 'Sending...' : 'Email Inactive Users'}
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Email Trial Expiring Users
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Email High Performers
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Campaigns</CardTitle>
              <CardDescription>Manage and track your email campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No campaigns yet</p>
                ) : (
                  campaigns.map((campaign) => (
                    <div key={campaign.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{campaign.name}</h3>
                        <Badge variant={campaign.status === 'sent' ? 'default' : 'secondary'}>
                          {campaign.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{campaign.subject}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span>Sent: {campaign.stats.totalSent}</span>
                        <span>Opens: {campaign.stats.openRate.toFixed(1)}%</span>
                        <span>Clicks: {campaign.stats.clickRate.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Logs</CardTitle>
              <CardDescription>Recent email activity and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {emailLogs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No email logs found</p>
                ) : (
                  emailLogs.map((log) => (
                    <div key={log._id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getEmailTypeBadge(log.emailType)}
                          {getStatusBadge(log.status)}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">{log.subject}</p>
                        <p className="text-sm text-muted-foreground">To: {log.email}</p>
                        {log.openedAt && (
                          <p className="text-xs text-green-600">
                            Opened: {new Date(log.openedAt).toLocaleString()}
                          </p>
                        )}
                        {log.clickedAt && (
                          <p className="text-xs text-blue-600">
                            Clicked: {new Date(log.clickedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="send" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Send Bulk Email</CardTitle>
              <CardDescription>Create and send targeted email campaigns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="campaign-name">Campaign Name</Label>
                    <Input
                      id="campaign-name"
                      value={campaignForm.name}
                      onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                      placeholder="Enter campaign name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={campaignForm.subject}
                      onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
                      placeholder="Enter email subject"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="target-audience">Target Audience</Label>
                    <Select 
                      value={campaignForm.targetAudience} 
                      onValueChange={(value) => setCampaignForm({ ...campaignForm, targetAudience: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select target audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inactive_users">Inactive Users (7+ days)</SelectItem>
                        <SelectItem value="trial_expiring">Trial Expiring Soon</SelectItem>
                        <SelectItem value="high_performers">High Performers</SelectItem>
                        <SelectItem value="new_users">New Users (Last 7 days)</SelectItem>
                        <SelectItem value="all_users">All Users</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="scheduled-at">Schedule (Optional)</Label>
                    <Input
                      id="scheduled-at"
                      type="datetime-local"
                      value={campaignForm.scheduledAt}
                      onChange={(e) => setCampaignForm({ ...campaignForm, scheduledAt: e.target.value })}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="content">Email Content</Label>
                  <Textarea
                    id="content"
                    value={campaignForm.content}
                    onChange={(e) => setCampaignForm({ ...campaignForm, content: e.target.value })}
                    placeholder="Enter your email content here..."
                    className="min-h-[300px]"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={sendBulkEmail} 
                  disabled={sendingEmail || !campaignForm.subject || !campaignForm.content}
                  className="flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {sendingEmail ? 'Sending...' : 'Send Email'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
