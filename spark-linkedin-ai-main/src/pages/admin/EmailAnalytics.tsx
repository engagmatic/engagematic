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
  RefreshCw,
  Eye,
  MousePointerClick,
  Zap,
  Target,
  Edit,
  Trash2,
  FileText,
  Plus,
  Search,
  Filter
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserEmailDialog } from "@/components/admin/UserEmailDialog";
import { UserHistoryDialog } from "@/components/admin/UserHistoryDialog";

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

  // Templates state
  const [templates, setTemplates] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    category: '',
    journeyStage: '',
    subject: '',
    htmlContent: ''
  });

  // Users state
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState('all');

  useEffect(() => {
    fetchEmailAnalytics();
    fetchTemplates();
    fetchCampaigns();
  }, [selectedPeriod]);

  useEffect(() => {
    fetchUsers();
  }, [userSearch, userFilter]);

  // Real-time updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchEmailAnalytics();
      fetchCampaigns();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

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

  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/templates`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoadingTemplates(false);
    }
  };

  const createTemplate = async (templateData: any) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/templates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templateData)
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Template created successfully');
        fetchTemplates();
        setTemplateForm({
          name: '',
          description: '',
          category: '',
          journeyStage: '',
          subject: '',
          htmlContent: ''
        });
        return true;
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create template');
        return false;
      }
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Error creating template');
      return false;
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const token = localStorage.getItem('adminToken');
      const queryParams = new URLSearchParams();
      if (userSearch) queryParams.append('search', userSearch);
      if (userFilter !== 'all') {
        if (userFilter === 'active') queryParams.append('status', 'active');
        if (userFilter === 'inactive') queryParams.append('status', 'inactive');
        if (userFilter === 'trial') queryParams.append('subscriptionStatus', 'trial');
      }

      const response = await fetch(`${API_URL}/api/admin/users/filter?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data?.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchUserCommunications = async (userId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/communications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.data?.communications || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching user communications:', error);
      return [];
    }
  };

  const sendEmailToUser = async (userId: string, emailData: any) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/send-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Email sent successfully');
        fetchEmailAnalytics();
        return true;
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to send email');
        return false;
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Error sending email');
      return false;
    }
  };

  const sendCampaign = async (campaignId: string) => {
    setSendingEmail(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/campaigns/${campaignId}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Campaign sent to ${result.data?.sentCount || 0} users`);
        fetchEmailAnalytics();
        fetchCampaigns();
        return true;
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to send campaign');
        return false;
      }
    } catch (error) {
      console.error('Error sending campaign:', error);
      toast.error('Error sending campaign');
      return false;
    } finally {
      setSendingEmail(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/campaigns`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
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
      
      // Create campaign first
      const campaignResponse = await fetch(`${API_URL}/api/admin/campaigns`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: campaignForm.name || `Campaign - ${new Date().toLocaleString()}`,
          subject: campaignForm.subject,
          customContent: campaignForm.content,
          targetAudience: campaignForm.targetAudience,
          scheduledAt: campaignForm.scheduledAt || null
        })
      });

      if (campaignResponse.ok) {
        const campaignData = await campaignResponse.json();
        const campaignId = campaignData.data._id;

        // Send the campaign
        const sendResponse = await fetch(`${API_URL}/api/admin/campaigns/${campaignId}/send`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (sendResponse.ok) {
          const result = await sendResponse.json();
          toast.success(`Email sent to ${result.data?.sentCount || 0} users`);
          setCampaignForm({ name: '', subject: '', content: '', targetAudience: 'all_users', scheduledAt: '' });
          fetchEmailAnalytics();
          fetchCampaigns();
        } else {
          const error = await sendResponse.json();
          toast.error(error.message || 'Failed to send campaign');
        }
      } else {
        // Fallback to old endpoint
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
          setCampaignForm({ name: '', subject: '', content: '', targetAudience: 'all_users', scheduledAt: '' });
          fetchEmailAnalytics();
        } else {
          const error = await response.json();
          toast.error(error.message || 'Failed to send email');
        }
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
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
                            <Edit className="w-4 h-4" />
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

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-500" />
                  Email Templates
                </CardTitle>
                <CardDescription>Manage email templates for different user journey stages</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button><Plus className="w-4 h-4 mr-2" />New Template</Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Email Template</DialogTitle>
                    <DialogDescription>Create a new email template for user communications</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Template Name</Label>
                      <Input placeholder="e.g., Welcome Email" />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="onboarding">Onboarding</SelectItem>
                          <SelectItem value="activation">Activation</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                          <SelectItem value="upgrade">Upgrade</SelectItem>
                          <SelectItem value="inactivity">Inactivity</SelectItem>
                          <SelectItem value="testimonials">Testimonials</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Subject Line</Label>
                      <Input placeholder="Enter email subject" />
                    </div>
                    <div>
                      <Label>Email Content (HTML)</Label>
                      <Textarea placeholder="Use {{name}} for personalization..." className="min-h-[300px]" />
                    </div>
                    <Button className="w-full">Create Template</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {loadingTemplates ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No templates yet</p>
                  <p className="text-sm text-muted-foreground">Create your first template to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <Card key={template._id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <Badge>{template.category}</Badge>
                        </div>
                        <CardDescription>{template.usageCount || 0} emails sent</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="w-4 h-4 mr-2" />Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compose Tab */}
        <TabsContent value="compose" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-500" />
                Compose Email
              </CardTitle>
              <CardDescription>Send email to users using templates or custom content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Select Template (Optional)</Label>
                    <Select 
                      onValueChange={async (templateId) => {
                        if (templateId === 'none') {
                          setCampaignForm({...campaignForm, subject: '', content: ''});
                          return;
                        }
                        const template = templates.find(t => t._id === templateId);
                        if (template) {
                          setCampaignForm({
                            ...campaignForm,
                            subject: template.subject,
                            content: template.htmlContent
                          });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a template or write custom" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Custom Email</SelectItem>
                        {templates.map((template) => (
                          <SelectItem key={template._id} value={template._id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                        <SelectItem value="all_users">All Users</SelectItem>
                        <SelectItem value="new_users">New Users (Last 7 days)</SelectItem>
                        <SelectItem value="inactive_users">Inactive Users (7+ days)</SelectItem>
                        <SelectItem value="trial_expiring">Trial Expiring Soon</SelectItem>
                        <SelectItem value="high_performers">High Performers</SelectItem>
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
                    placeholder="Enter your email content here... Use {{name}} for personalization"
                    className="min-h-[300px]"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Available variables: {"{{name}}"}, {"{{email}}"}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline">Preview</Button>
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
                      Send Email
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-500" />
                    User Communications
                  </CardTitle>
                  <CardDescription>View and manage communications for individual users</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Search users..." 
                    className="w-64" 
                    value={userSearch}
                    onChange={(e) => {
                      setUserSearch(e.target.value);
                      // Debounce search
                      setTimeout(() => fetchUsers(), 500);
                    }}
                  />
                  <Select value={userFilter} onValueChange={(value) => {
                    setUserFilter(value);
                    fetchUsers();
                  }}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="trial">Trial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingUsers ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No users found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <Card key={user._id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div>
                              <div className="font-semibold">{user.name}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                            <Badge variant={user.isActive ? "default" : "secondary"}>
                              {user.subscriptionStatus || 'trial'}
                            </Badge>
                            <div className="text-sm text-muted-foreground">
                              Plan: {user.plan || 'starter'}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <UserHistoryDialog 
                              user={user} 
                              getEmailTypeBadge={getEmailTypeBadge}
                              getStatusBadge={getStatusBadge}
                            />
                            <UserEmailDialog 
                              user={user} 
                              templates={templates}
                              onSent={() => {
                                fetchEmailAnalytics();
                                fetchUsers();
                              }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Logs in Overview */}
        <TabsContent value="overview" className="space-y-6">
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
                  emailLogs.slice(0, 10).map((log) => (
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

      </Tabs>
    </div>
  );
}