import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
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
  totalPosts: number;
  totalComments: number;
  totalRevenue: number;
  conversionRate: number;
  growthRate: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    totalPosts: 0,
    totalComments: 0,
    totalRevenue: 0,
    conversionRate: 0,
    growthRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/admin/stats', {
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
      value: stats.totalPosts,
      icon: FileText,
      change: '+156',
      positive: true,
      color: 'from-pink-500 to-pink-600'
    },
    {
      title: 'Comments Generated',
      value: stats.totalComments,
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
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    U{i}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      User {i}
                    </p>
                    <p className="text-xs text-gray-500">Joined 2 hours ago</p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3">
              {[
                { action: 'Post generated', user: 'John Doe', time: '5 min ago', icon: FileText },
                { action: 'Comment created', user: 'Jane Smith', time: '12 min ago', icon: MessageSquare },
                { action: 'New signup', user: 'Mike Johnson', time: '23 min ago', icon: UserPlus },
                { action: 'Profile analyzed', user: 'Sarah Wilson', time: '34 min ago', icon: Activity },
                { action: 'Post generated', user: 'Tom Brown', time: '45 min ago', icon: FileText }
              ].map((activity, i) => {
                const Icon = activity.icon;
                return (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.user} • {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
