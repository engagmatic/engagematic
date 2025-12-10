/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Get API URL - handle both cases where it includes /api or not
const getApiBase = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  // If URL already ends with /api, use it as is, otherwise add /api
  return apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;
};
const API_BASE = getApiBase();
import { 
  Search, 
  Filter, 
  Download,
  MoreVertical,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  Ban,
  Eye,
  RefreshCw
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Affiliate {
  _id: string;
  name: string;
  email: string;
  affiliateCode: string;
  status: 'pending' | 'approved' | 'active' | 'suspended' | 'rejected';
  createdAt: string;
  applicationDate: string;
  approvalDate?: string;
  stats: {
    totalClicks: number;
    totalSignups: number;
    activeSubscriptions: number;
    totalEarned: number;
    monthlyRecurring: number;
  };
  profile?: {
    jobTitle?: string;
    company?: string;
    linkedinUrl?: string;
  };
}

interface AffiliateStats {
  affiliates: {
    total: number;
    active: number;
    pending: number;
  };
  commissions: {
    totalEarned: number;
    totalPending: number;
    totalPaid: number;
    activeSubscriptions: number;
    monthlyRecurring: number;
  };
  referrals: {
    totalClicks: number;
    totalSignups: number;
  };
  topAffiliates: Array<{
    name: string;
    email: string;
    affiliateCode: string;
    totalEarned: number;
    activeSubscriptions: number;
  }>;
}

export default function AffiliateManagement() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [filteredAffiliates, setFilteredAffiliates] = useState<Affiliate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  useEffect(() => {
    fetchAffiliates();
    fetchStats();
  }, []);

  useEffect(() => {
    filterAffiliates();
  }, [searchQuery, filterStatus, affiliates]);

  const fetchAffiliates = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        console.error('No admin token found');
        return;
      }

      const response = await fetch(`${API_BASE}/admin/affiliates`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAffiliates(result.data?.affiliates || []);
          setFilteredAffiliates(result.data?.affiliates || []);
        } else {
          console.error('Failed to fetch affiliates:', result.message);
          toast.error(result.message || 'Failed to load affiliates');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch affiliates:', errorData);
        toast.error(errorData.message || 'Failed to load affiliates');
      }
    } catch (error: any) {
      console.error('Failed to fetch affiliates:', error);
      toast.error(error.message || 'Failed to load affiliates. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        return;
      }

      const response = await fetch(`${API_BASE}/admin/affiliates/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStats(result.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch affiliate stats:', error);
    }
  };

  const filterAffiliates = () => {
    let filtered = affiliates;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(affiliate =>
        affiliate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        affiliate.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        affiliate.affiliateCode?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(affiliate => affiliate.status === filterStatus);
    }

    setFilteredAffiliates(filtered);
  };

  const handleApprove = async (affiliateId: string) => {
    if (!confirm('Are you sure you want to approve this affiliate? They will be able to start earning commissions.')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Authentication error. Please login again.');
        return;
      }

      const response = await fetch(`${API_BASE}/admin/affiliates/${affiliateId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || 'Affiliate approved successfully! They can now start earning commissions.');
        await fetchAffiliates();
        await fetchStats();
      } else {
        toast.error(data.message || 'Failed to approve affiliate');
      }
    } catch (error: any) {
      console.error('Failed to approve affiliate:', error);
      toast.error(error.message || 'Failed to approve affiliate. Please try again.');
    }
  };

  const handleReject = async (affiliateId: string) => {
    if (!confirm('Are you sure you want to reject this affiliate application?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Authentication error. Please login again.');
        return;
      }

      const response = await fetch(`${API_BASE}/admin/affiliates/${affiliateId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || 'Affiliate application rejected');
        await fetchAffiliates();
        await fetchStats();
      } else {
        toast.error(data.message || 'Failed to reject affiliate');
      }
    } catch (error: any) {
      console.error('Failed to reject affiliate:', error);
      toast.error(error.message || 'Failed to reject affiliate. Please try again.');
    }
  };

  const handleSuspend = async (affiliateId: string) => {
    if (!confirm('Are you sure you want to suspend this affiliate?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Authentication error. Please login again.');
        return;
      }

      const response = await fetch(`${API_BASE}/admin/affiliates/${affiliateId}/suspend`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || 'Affiliate suspended successfully');
        await fetchAffiliates();
        await fetchStats();
      } else {
        toast.error(data.message || 'Failed to suspend affiliate');
      }
    } catch (error: any) {
      console.error('Failed to suspend affiliate:', error);
      toast.error(error.message || 'Failed to suspend affiliate. Please try again.');
    }
  };

  const handleActivate = async (affiliateId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Authentication error. Please login again.');
        return;
      }

      const response = await fetch(`${API_BASE}/admin/affiliates/${affiliateId}/activate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || 'Affiliate activated successfully');
        await fetchAffiliates();
        await fetchStats();
      } else {
        toast.error(data.message || 'Failed to activate affiliate');
      }
    } catch (error: any) {
      console.error('Failed to activate affiliate:', error);
      toast.error(error.message || 'Failed to activate affiliate. Please try again.');
    }
  };

  const viewAffiliateDetails = async (affiliateId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Authentication error. Please login again.');
        return;
      }

      const response = await fetch(`${API_BASE}/admin/affiliates/${affiliateId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSelectedAffiliate(data.data.affiliate);
        setViewDialogOpen(true);
      } else {
        toast.error(data.message || 'Failed to load affiliate details');
      }
    } catch (error: any) {
      console.error('Failed to load affiliate details:', error);
      toast.error(error.message || 'Failed to load affiliate details. Please try again.');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      suspended: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      rejected: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    };

    return (
      <Badge className={styles[status] || styles.pending}>
        {status}
      </Badge>
    );
  };

  const exportAffiliates = () => {
    const csv = [
      ['Name', 'Email', 'Affiliate Code', 'Status', 'Total Earned', 'Active Subscriptions', 'Signups', 'Application Date'],
      ...filteredAffiliates.map(affiliate => [
        affiliate.name,
        affiliate.email,
        affiliate.affiliateCode,
        affiliate.status,
        affiliate.stats?.totalEarned || 0,
        affiliate.stats?.activeSubscriptions || 0,
        affiliate.stats?.totalSignups || 0,
        new Date(affiliate.applicationDate).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `affiliates-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Affiliate Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage affiliates, approvals, and commissions
            </p>
          </div>
          <Button onClick={fetchAffiliates} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Affiliates</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.affiliates.total}</h3>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Affiliates</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.affiliates.active}</h3>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </Card>
            <Card className={`p-6 ${stats.affiliates.pending > 0 ? 'border-yellow-400 border-2 bg-yellow-50 dark:bg-yellow-900/20' : ''}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pending Applications</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.affiliates.pending}</h3>
                  {stats.affiliates.pending > 0 && (
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                      Requires approval
                    </p>
                  )}
                </div>
                {stats.affiliates.pending > 0 ? (
                  <AlertCircle className="h-8 w-8 text-yellow-600 animate-pulse" />
                ) : (
                  <Calendar className="h-8 w-8 text-yellow-600" />
                )}
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Commissions Paid</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₹{stats.commissions.totalPaid.toLocaleString()}
                  </h3>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </Card>
          </div>
        )}

        {/* Pending Affiliates Quick View */}
        {stats && stats.affiliates.pending > 0 && (
          <Card className="p-6 border-yellow-400 border-2 bg-yellow-50 dark:bg-yellow-900/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Pending Approvals ({stats.affiliates.pending})
                </h2>
              </div>
              <Button
                variant="outline"
                onClick={() => setFilterStatus('pending')}
                className="gap-2"
              >
                View All Pending
              </Button>
            </div>
            <div className="space-y-3">
              {filteredAffiliates
                .filter(a => a.status === 'pending')
                .slice(0, 5)
                .map((affiliate) => (
                  <div
                    key={affiliate._id}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-yellow-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center text-white font-bold">
                        {affiliate.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">{affiliate.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{affiliate.email}</div>
                        <div className="text-xs text-gray-500">
                          Applied: {new Date(affiliate.applicationDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(affiliate._id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(affiliate._id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => viewAffiliateDetails(affiliate._id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        )}

        {/* Top Affiliates */}
        {stats && stats.topAffiliates.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Top Affiliates</h2>
            <div className="space-y-3">
              {stats.topAffiliates.slice(0, 5).map((affiliate, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{affiliate.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{affiliate.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">₹{affiliate.totalEarned.toLocaleString()}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {affiliate.activeSubscriptions} active
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Filters and Search */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or affiliate code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportAffiliates} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </Card>

        {/* Affiliates Table */}
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Affiliate Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total Earned</TableHead>
                  <TableHead>Active Subscriptions</TableHead>
                  <TableHead>Signups</TableHead>
                  <TableHead>Application Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Loading affiliates...
                    </TableCell>
                  </TableRow>
                ) : filteredAffiliates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      No affiliates found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAffiliates.map((affiliate) => (
                    <TableRow key={affiliate._id}>
                      <TableCell className="font-medium">{affiliate.name}</TableCell>
                      <TableCell>{affiliate.email}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {affiliate.affiliateCode}
                        </code>
                      </TableCell>
                      <TableCell>{getStatusBadge(affiliate.status)}</TableCell>
                      <TableCell>
                        <span className="font-semibold text-green-600">
                          ₹{affiliate.stats?.totalEarned?.toLocaleString() || 0}
                        </span>
                      </TableCell>
                      <TableCell>{affiliate.stats?.activeSubscriptions || 0}</TableCell>
                      <TableCell>{affiliate.stats?.totalSignups || 0}</TableCell>
                      <TableCell>
                        {new Date(affiliate.applicationDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {/* Quick Approve/Reject buttons for pending affiliates */}
                          {affiliate.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApprove(affiliate._id)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(affiliate._id)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          
                          {/* Actions dropdown for all affiliates */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => viewAffiliateDetails(affiliate._id)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {affiliate.status === 'pending' && (
                                <>
                                  <DropdownMenuItem onClick={() => handleApprove(affiliate._id)}>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleReject(affiliate._id)}>
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              {affiliate.status === 'active' && (
                                <DropdownMenuItem onClick={() => handleSuspend(affiliate._id)}>
                                  <Ban className="h-4 w-4 mr-2" />
                                  Suspend
                                </DropdownMenuItem>
                              )}
                              {(affiliate.status === 'suspended' || affiliate.status === 'rejected') && (
                                <DropdownMenuItem onClick={() => handleActivate(affiliate._id)}>
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Activate
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* View Affiliate Details Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Affiliate Details</DialogTitle>
              <DialogDescription>
                Complete information about this affiliate
              </DialogDescription>
            </DialogHeader>
            {selectedAffiliate && (
              <div className="space-y-4">
                {/* Action buttons for pending affiliates */}
                {selectedAffiliate.status === 'pending' && (
                  <div className="flex gap-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200">
                    <Button
                      onClick={() => {
                        handleApprove(selectedAffiliate._id);
                        setViewDialogOpen(false);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Application
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleReject(selectedAffiliate._id);
                        setViewDialogOpen(false);
                      }}
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Application
                    </Button>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Name</label>
                    <p className="text-gray-900">{selectedAffiliate.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{selectedAffiliate.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Affiliate Code</label>
                    <p className="text-gray-900 font-mono">{selectedAffiliate.affiliateCode}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <div>{getStatusBadge(selectedAffiliate.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Application Date</label>
                    <p className="text-gray-900">
                      {new Date(selectedAffiliate.applicationDate || selectedAffiliate.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {selectedAffiliate.approvalDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Approval Date</label>
                      <p className="text-gray-900">
                        {new Date(selectedAffiliate.approvalDate).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
                {selectedAffiliate.profile && (
                  <div>
                    <h3 className="font-semibold mb-2">Profile Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedAffiliate.profile.jobTitle && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Job Title</label>
                          <p className="text-gray-900">{selectedAffiliate.profile.jobTitle}</p>
                        </div>
                      )}
                      {selectedAffiliate.profile.company && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Company</label>
                          <p className="text-gray-900">{selectedAffiliate.profile.company}</p>
                        </div>
                      )}
                      {selectedAffiliate.profile.linkedinUrl && (
                        <div className="col-span-2">
                          <label className="text-sm font-medium text-gray-600">LinkedIn</label>
                          <a
                            href={selectedAffiliate.profile.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {selectedAffiliate.profile.linkedinUrl}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

