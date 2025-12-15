import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card } from '@/components/ui/card';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// Ensure API_BASE includes /api prefix
const API_BASE = API_URL.includes('/api') ? API_URL : `${API_URL}/api`;
import { 
  Users, 
  FileText, 
  MessageSquare, 
  TrendingUp,
  DollarSign,
  Activity,
  UserCheck,
  UserPlus,
  ArrowUpRight,
  ArrowDownRight,
  Link as LinkIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  postsGenerated: number;
  commentsGenerated: number;
  postsGeneratedToday?: number;
  commentsGeneratedToday?: number;
  totalRevenue: number;
  revenueINR: number;
  revenueUSD: number;
  conversionRate: number;
  growthRate: number;
  revenueChange?: number;
  activeUsersChange?: number;
}

interface RecentUser {
  _id: string;
  email: string;
  name: string;
  plan: string;
  joinedDate: string;
}

interface RecentActivity {
  _id: string;
  user: {
    email: string;
    name: string;
  };
  action: string;
  timestamp: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    postsGenerated: 0,
    commentsGenerated: 0,
    postsGeneratedToday: 0,
    commentsGeneratedToday: 0,
    totalRevenue: 0,
    revenueINR: 0,
    revenueUSD: 0,
    conversionRate: 0,
    growthRate: 0,
    revenueChange: 0,
    activeUsersChange: 0
  });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currency, setCurrency] = useState<'INR'|'USD'>('INR');

  const [affiliateStats, setAffiliateStats] = useState<any>(null);

  useEffect(() => {
    fetchDashboardStats();
    fetchRecentUsers();
    fetchRecentActivity();
    fetchAffiliateStats();
  }, []);

  const fetchAffiliateStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const response = await fetch(`${API_BASE}/admin/affiliates/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setAffiliateStats(result.data);
      } else {
        console.error('Failed to fetch affiliate stats:', response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch affiliate stats:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        console.error('No admin token found');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        // Handle both direct data and wrapped response
        if (result.data) {
          setStats(result.data);
        } else {
          setStats(result);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch stats:', errorData.message || response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const response = await fetch(`${API_BASE}/admin/recent-users?limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setRecentUsers(result.data || []);
      } else {
        console.error('Failed to fetch recent users:', response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch recent users:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const response = await fetch(`${API_BASE}/admin/recent-activity?limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setRecentActivity(result.data || []);
      } else {
        console.error('Failed to fetch recent activity:', response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
    }
  };

  const getTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' min ago';
    
    return Math.floor(seconds) + ' sec ago';
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      change: `${stats.growthRate >= 0 ? '+' : ''}${stats.growthRate.toFixed(1)}%`,
      positive: stats.growthRate >= 0,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: UserCheck,
      change: `${stats.activeUsersChange && stats.activeUsersChange >= 0 ? '+' : ''}${stats.activeUsersChange?.toFixed(1) || 0}%`,
      positive: (stats.activeUsersChange || 0) >= 0,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'New Today',
      value: stats.newUsersToday,
      icon: UserPlus,
      change: `${stats.newUsersToday > 0 ? '+' : ''}${stats.newUsersToday}`,
      positive: stats.newUsersToday > 0,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Posts Generated',
      value: stats.postsGenerated,
      icon: FileText,
      change: `+${stats.postsGeneratedToday || 0}`,
      positive: true,
      color: 'from-pink-500 to-pink-600'
    },
    {
      title: 'Comments Generated',
      value: stats.commentsGenerated,
      icon: MessageSquare,
      change: `+${stats.commentsGeneratedToday || 0}`,
      positive: true,
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Revenue',
      value: (() => {
        if (stats.revenueINR > 0 && stats.revenueUSD > 0) {
          return `₹${stats.revenueINR.toLocaleString('en-IN')} / $${stats.revenueUSD.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
        } else if (stats.revenueINR > 0) {
          return `₹${stats.revenueINR.toLocaleString('en-IN')}`;
        } else if (stats.revenueUSD > 0) {
          return `$${stats.revenueUSD.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
        } else {
          return '₹0';
        }
      })(),
      icon: DollarSign,
      change: `${stats.revenueChange && stats.revenueChange >= 0 ? '+' : ''}${stats.revenueChange?.toFixed(1) || 0}%`,
      positive: (stats.revenueChange || 0) >= 0,
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      title: 'Conversion Rate',
      value: `${stats.conversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      change: 'Real-time',
      positive: true,
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      title: 'Growth Rate',
      value: `${stats.growthRate}%`,
      icon: Activity,
      change: 'vs last week',
      positive: parseFloat(stats.growthRate.toString()) >= 0,
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening with Engagematic.
          </p>
        </div>

        {/* Affiliate Stats Section */}
        {affiliateStats && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Affiliate Program</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Overview of affiliate performance</p>
              </div>
              <Link to="/admin/affiliates">
                <Button variant="outline" size="sm" className="gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Manage Affiliates
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Affiliates</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {affiliateStats.affiliates?.total || 0}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {affiliateStats.affiliates?.active || 0} active
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Applications</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {affiliateStats.affiliates?.pending || 0}
                </h3>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Commissions Paid</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₹{affiliateStats.commissions?.totalPaid?.toLocaleString() || 0}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  ₹{affiliateStats.commissions?.monthlyRecurring?.toLocaleString() || 0}/month recurring
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Signups</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {affiliateStats.referrals?.totalSignups || 0}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {affiliateStats.referrals?.totalClicks || 0} clicks
                </p>
              </div>
            </div>
            {affiliateStats.topAffiliates && affiliateStats.topAffiliates.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Top 3 Affiliates</h3>
                <div className="space-y-2">
                  {affiliateStats.topAffiliates.slice(0, 3).map((affiliate: any, index: number) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {index + 1}. {affiliate.name}
                      </span>
                      <span className="font-semibold text-green-600">
                        ₹{affiliate.totalEarned?.toLocaleString() || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            
            return (
              <Card key={stat.title} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {stat.title}
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {isLoading ? '...' : stat.value}
                    </h3>
                    {/* {stat.extra} */}
                    <div className="flex items-center gap-1 mt-2">
                      {stat.positive ? (
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-sm font-medium ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change}
                      </span>
                      <span className="text-xs text-gray-500">vs last week</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Recent Users
            </h3>
            <div className="space-y-3">
              {recentUsers.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No recent users</p>
              ) : (
                recentUsers.map((user) => (
                  <div key={user._id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(user.joinedDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                      user.plan === 'trial' ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' :
                      user.plan === 'starter' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                      'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                    }`}>
                      {user.plan}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
              ) : (
                recentActivity.map((activity) => {
                  const Icon = activity.action.includes('post') ? FileText : MessageSquare;
                  const timeAgo = getTimeAgo(new Date(activity.timestamp));
                  
                  return (
                    <div key={activity._id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.user.name} • {timeAgo}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
