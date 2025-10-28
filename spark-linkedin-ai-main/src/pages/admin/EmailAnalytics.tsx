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
  RefreshCw,
  Eye,
  MousePointerClick,
  Zap,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Settings,
  Play,
  Pause,
  Edit,
  Trash2,
  Copy,
  ExternalLink
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
  unsubscribes: number;
  complaints: number;
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
  user?: {
    name: string;
    email: string;
  };
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
  createdAt: string;
  sentCount: number;
}

interface EmailMetrics {
  emailType: string;
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  totalFailed: number;
  totalBounced: number;
  openRate: number;
  clickRate: number;
  deliveryRate: number;
}

export default function EmailAnalytics() {
  const [emailStats, setEmailStats] = useState<EmailStats>({
    totalSent: 0,
    totalOpened: 0,
    totalClicked: 0,
    openRate: 0,
    clickRate: 0,
    bounceRate: 0,
    deliveryRate: 0,
    unsubscribes: 0,
    complaints: 0
  });
  
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [emailMetrics, setEmailMetrics] = useState<EmailMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  
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
  }, [selectedPeriod]);

  const fetchEmailAnalytics = async () => {
    try {
      const token = localStorage.getItem('adminToken');
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

  const fetchEmailMetrics = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/email-metrics?period=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEmailMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Error fetching email metrics:', error);
    }
  };

  const sendBulkEmail = async () => {
    if (!campaignForm.subject || !campaignForm.content) {
      toast.error('Please fill in subject and content');
      return;
    }

    setSendingEmail(true);
    try {
      const token = localStorage.getItem('adminToken');
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
      const token = localStorage.getItem('adminToken');
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
      sent: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
      failed: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
      bounced: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} border flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getEmailTypeBadge = (emailType: string) => {
    const typeConfig = {
      welcome: 'bg-blue-100 text-blue-800 border-blue-200',
      onboarding_day1: 'bg-purple-100 text-purple-800 border-purple-200',
      onboarding_day3: 'bg-purple-100 text-purple-800 border-purple-200',
      onboarding_day5: 'bg-purple-100 text-purple-800 border-purple-200',
      onboarding_day7: 'bg-purple-100 text-purple-800 border-purple-200',
      milestone_10_posts: 'bg-green-100 text-green-800 border-green-200',
      milestone_50_posts: 'bg-green-100 text-green-800 border-green-200',
      milestone_100_posts: 'bg-green-100 text-green-800 border-green-200',
      trial_expiry_7days: 'bg-orange-100 text-orange-800 border-orange-200',
      trial_expiry_3days: 'bg-orange-100 text-orange-800 border-orange-200',
      trial_expiry_1day: 'bg-orange-100 text-orange-800 border-orange-200',
      trial_expired: 'bg-red-100 text-red-800 border-red-200',
      reengagement_7days: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      reengagement_14days: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      reengagement_30days: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      custom: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    return (
      <Badge className={`${typeConfig[emailType as keyof typeof typeConfig] || 'bg-gray-100 text-gray-800 border-gray-200'} border`}>
        {emailType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-primary" />
          <span>Loading email analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Email Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor email performance and manage campaigns
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchEmailAnalytics} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Mail className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(emailStats.totalSent)}</div>
            <p className="text-xs text-muted-foreground">
              Delivery Rate: {emailStats.deliveryRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <Eye className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emailStats.openRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(emailStats.totalOpened)} opens
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <MousePointerClick className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emailStats.clickRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(emailStats.totalClicked)} clicks
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emailStats.bounceRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Failed deliveries
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="logs">Email Logs</TabsTrigger>
          <TabsTrigger value="send">Send Email</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Quick Actions
              </CardTitle>
              <CardDescription>Send targeted emails to specific user groups</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={sendInactiveUserEmail} 
                  disabled={sendingEmail}
                  className="h-20 flex flex-col items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  <Users className="w-6 h-6" />
                  <div className="text-center">
                    <div className="font-semibold">Email Inactive Users</div>
                    <div className="text-xs opacity-90">7+ days inactive</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center gap-2 border-orange-200 hover:bg-orange-50"
                >
                  <Clock className="w-6 h-6 text-orange-500" />
                  <div className="text-center">
                    <div className="font-semibold">Trial Expiring</div>
                    <div className="text-xs text-muted-foreground">3 days before expiry</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center gap-2 border-green-200 hover:bg-green-50"
                >
                  <TrendingUp className="w-6 h-6 text-green-500" />
                  <div className="text-center">
                    <div className="font-semibold">High Performers</div>
                    <div className="text-xs text-muted-foreground">10+ posts generated</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Email Performance by Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-500" />
                Email Performance by Type
              </CardTitle>
              <CardDescription>Performance metrics for different email types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {emailMetrics.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No email metrics available for the selected period
                  </div>
                ) : (
                  emailMetrics.map((metric, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        {getEmailTypeBadge(metric.emailType)}
                        <div>
                          <div className="font-semibold">{formatNumber(metric.totalSent)} sent</div>
                          <div className="text-sm text-muted-foreground">
                            {formatNumber(metric.totalOpened)} opens • {formatNumber(metric.totalClicked)} clicks
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-semibold text-green-600">{metric.openRate.toFixed(1)}%</div>
                          <div className="text-muted-foreground">Open Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-purple-600">{metric.clickRate.toFixed(1)}%</div>
                          <div className="text-muted-foreground">Click Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-blue-600">{metric.deliveryRate.toFixed(1)}%</div>
                          <div className="text-muted-foreground">Delivery</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-500" />
                Email Campaigns
              </CardTitle>
              <CardDescription>Manage and track your email campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No campaigns yet</p>
                    <p className="text-sm text-muted-foreground">Create your first campaign to get started</p>
                  </div>
                ) : (
                  campaigns.map((campaign) => (
                    <div key={campaign.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{campaign.name}</h3>
                          <p className="text-sm text-muted-foreground">{campaign.subject}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={campaign.status === 'sent' ? 'default' : 'secondary'}>
                            {campaign.status}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-semibold text-lg">{formatNumber(campaign.stats.totalSent)}</div>
                          <div className="text-muted-foreground">Sent</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-lg text-green-600">{campaign.stats.openRate.toFixed(1)}%</div>
                          <div className="text-muted-foreground">Open Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-lg text-purple-600">{campaign.stats.clickRate.toFixed(1)}%</div>
                          <div className="text-muted-foreground">Click Rate</div>
                        </div>
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
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-500" />
                Recent Email Activity
              </CardTitle>
              <CardDescription>Latest email sends and their performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {emailLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No email logs found</p>
                  </div>
                ) : (
                  emailLogs.map((log) => (
                    <div key={log._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getEmailTypeBadge(log.emailType)}
                          {getStatusBadge(log.status)}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium">{log.subject}</p>
                        <p className="text-sm text-muted-foreground">To: {log.email}</p>
                        <div className="flex items-center gap-4 text-xs">
                          {log.openedAt && (
                            <div className="flex items-center gap-1 text-green-600">
                              <Eye className="w-3 h-3" />
                              <span>Opened: {new Date(log.openedAt).toLocaleString()}</span>
                            </div>
                          )}
                          {log.clickedAt && (
                            <div className="flex items-center gap-1 text-purple-600">
                              <MousePointerClick className="w-3 h-3" />
                              <span>Clicked: {new Date(log.clickedAt).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
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
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-500" />
                Create Email Campaign
              </CardTitle>
              <CardDescription>Send targeted emails to your user base</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    <Label htmlFor="subject">Subject Line</Label>
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
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  size="lg"
                >
                  {sendingEmail ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Email Campaign
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}