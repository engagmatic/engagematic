import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card } from '@/components/ui/card';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE = `${API_URL}`;
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
  ArrowDownRight
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  postsGenerated: number;
  commentsGenerated: number;
  totalRevenue: number;
  conversionRate: number;
  growthRate: number;
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
    totalRevenue: 0,
    conversionRate: 0,
    growthRate: 0
  });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
    fetchRecentUsers();
    fetchRecentActivity();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE}/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
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
      const response = await fetch(`${API_BASE}/admin/recent-users?limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setRecentUsers(result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch recent users:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE}/admin/recent-activity?limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setRecentActivity(result.data || []);
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
      change: '+12%',
      positive: true,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: UserCheck,
      change: '+8%',
      positive: true,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'New Today',
      value: stats.newUsersToday,
      icon: UserPlus,
      change: '+24',
      positive: true,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Posts Generated',
      value: stats.postsGenerated,
      icon: FileText,
      change: '+156',
      positive: true,
      color: 'from-pink-500 to-pink-600'
    },
    {
      title: 'Comments Generated',
      value: stats.commentsGenerated,
      icon: MessageSquare,
      change: '+89',
      positive: true,
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      change: '+18%',
      positive: true,
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      title: 'Conversion Rate',
      value: `${stats.conversionRate}%`,
      icon: TrendingUp,
      change: '+2.3%',
      positive: true,
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      title: 'Growth Rate',
      value: `${stats.growthRate}%`,
      icon: Activity,
      change: '+5.1%',
      positive: true,
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
            Welcome back! Here's what's happening with LinkedInPulse.
          </p>
        </div>

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
