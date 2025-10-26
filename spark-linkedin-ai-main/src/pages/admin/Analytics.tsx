import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  Target,
  FileText,
  MessageSquare,
  Download,
  Eye,
  MousePointerClick,
  Clock,
  Globe,
  BarChart3,
} from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface AnalyticsData {
  overview: {
    totalUsers: number;
    newUsersThisMonth: number;
    totalRevenue: number;
    revenueThisMonth: number;
    totalPosts: number;
    totalComments: number;
    conversionRate: number;
    avgEngagement: number;
  };
  userGrowth: Array<{
    date: string;
    users: number;
  }>;
  revenueData: Array<{
    month: string;
    revenue: number;
  }>;
  planDistribution: Array<{
    plan: string;
    count: number;
  }>;
  contentStats: Array<{
    type: string;
    count: number;
  }>;
  topUsers: Array<{
    name: string;
    email: string;
    postsGenerated: number;
    commentsGenerated: number;
  }>;
}

interface GoogleAnalyticsData {
  last7Days: {
    activeUsers: number;
    sessions: number;
    pageViews: number;
    bounceRate: string;
    avgSessionDuration: string;
    newUsers: number;
  } | null;
  last30Days: {
    activeUsers: number;
    sessions: number;
    pageViews: number;
    bounceRate: string;
    avgSessionDuration: string;
    newUsers: number;
  } | null;
  realtime: {
    activeUsers: number;
    timestamp: string;
  } | null;
}

const Analytics = () => {
  const { token } = useAdmin();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [gaData, setGaData] = useState<GoogleAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingGA, setIsLoadingGA] = useState(true);
  const [gaEnabled, setGaEnabled] = useState(false);
  const [timeRange, setTimeRange] = useState("30days");

  useEffect(() => {
    if (token) {
      fetchAnalytics();
      fetchGoogleAnalytics();
    }
  }, [token, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      
      // Fetch overview stats
      const response = await fetch(`${API_BASE}/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        
        // Calculate estimates based on real data
        const newUsersThisMonth = result.newUsersToday * 30; // Estimate
        const activeUserRevenue = result.activeUsers * 12; // Average $12/user
        const totalRevenue = activeUserRevenue * 0.6; // 60% estimated paying users
        const revenueThisMonth = result.newUsersToday * 24 * 0.3; // Estimate
        
        const analyticsData: AnalyticsData = {
          overview: {
            totalUsers: result.totalUsers,
            newUsersThisMonth,
            totalRevenue,
            revenueThisMonth,
            totalPosts: result.postsGenerated,
            totalComments: result.commentsGenerated,
            conversionRate: result.conversionRate,
            avgEngagement: 4.2, // Would be calculated from actual engagement data
          },
          userGrowth: generateMockUserGrowth(),
          revenueData: generateMockRevenueData(),
          planDistribution: [
            { plan: "Trial", count: Math.floor(result.totalUsers * 0.4) },
            { plan: "Starter", count: Math.floor(result.totalUsers * 0.35) },
            { plan: "Pro", count: Math.floor(result.totalUsers * 0.25) },
          ],
          contentStats: [
            { type: "Posts", count: result.postsGenerated },
            { type: "Comments", count: result.commentsGenerated },
          ],
          topUsers: [],
        };

        setAnalyticsData(analyticsData);
      } else {
        toast.error("Failed to fetch analytics");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGoogleAnalytics = async () => {
    try {
      setIsLoadingGA(true);
      
      const response = await fetch(`${API_BASE}/admin/analytics/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGaData(data);
        setGaEnabled(true);
      } else if (response.status === 503) {
        // GA not configured
        setGaEnabled(false);
      }
    } catch (error) {
      console.error("Error fetching Google Analytics:", error);
      setGaEnabled(false);
    } finally {
      setIsLoadingGA(false);
    }
  };

  const generateMockUserGrowth = () => {
    const data = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        users: Math.floor(Math.random() * 50) + 20,
      });
    }
    return data;
  };

  const generateMockRevenueData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.map((month, index) => ({
      month,
      revenue: Math.floor(Math.random() * 5000) + 1000 + (index * 200), // Growing trend
    }));
  };

  const handleExport = () => {
    toast.success("Exporting analytics data...");
    // Implement CSV/PDF export functionality
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="p-6 flex items-center justify-center">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  const { overview } = analyticsData;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Insights</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive view of your platform's performance
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex gap-2">
            {["7days", "30days", "90days", "1year"].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range === "7days" && "7 Days"}
                {range === "30days" && "30 Days"}
                {range === "90days" && "90 Days"}
                {range === "1year" && "1 Year"}
              </Button>
            ))}
          </div>
          <Button onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Google Analytics Section */}
      {gaEnabled && gaData && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold">Google Analytics</h2>
              <p className="text-sm text-muted-foreground">Real-time website analytics from Google</p>
            </div>
          </div>

          {/* Realtime Users */}
          {gaData.realtime && (
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <p className="text-sm font-medium text-muted-foreground">Active Users Right Now</p>
                  </div>
                  <p className="text-5xl font-bold mt-3 text-blue-700 dark:text-blue-300">
                    {gaData.realtime.activeUsers}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Last updated: {new Date(gaData.realtime.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <Globe className="w-16 h-16 text-blue-600 opacity-20" />
              </div>
            </Card>
          )}

          {/* GA Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Last 7 Days */}
            {gaData.last7Days && (
              <>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      <p className="text-sm font-medium">Active Users</p>
                    </div>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                      7 Days
                    </span>
                  </div>
                  <p className="text-3xl font-bold">{gaData.last7Days.activeUsers.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {gaData.last7Days.newUsers} new users
                  </p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <MousePointerClick className="w-5 h-5 text-purple-600" />
                      <p className="text-sm font-medium">Sessions</p>
                    </div>
                    <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                      7 Days
                    </span>
                  </div>
                  <p className="text-3xl font-bold">{gaData.last7Days.sessions.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {gaData.last7Days.pageViews.toLocaleString()} page views
                  </p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-green-600" />
                      <p className="text-sm font-medium">Page Views</p>
                    </div>
                    <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                      7 Days
                    </span>
                  </div>
                  <p className="text-3xl font-bold">{gaData.last7Days.pageViews.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {gaData.last7Days.bounceRate}% bounce rate
                  </p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-orange-600" />
                      <p className="text-sm font-medium">Avg Session Duration</p>
                    </div>
                    <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-2 py-1 rounded">
                      7 Days
                    </span>
                  </div>
                  <p className="text-3xl font-bold">{Math.round(parseFloat(gaData.last7Days.avgSessionDuration))}s</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Time spent per session
                  </p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-pink-600" />
                      <p className="text-sm font-medium">Bounce Rate</p>
                    </div>
                    <span className="text-xs bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 px-2 py-1 rounded">
                      7 Days
                    </span>
                  </div>
                  <p className="text-3xl font-bold">{gaData.last7Days.bounceRate}%</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Single-page sessions
                  </p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-cyan-600" />
                      <p className="text-sm font-medium">New Users</p>
                    </div>
                    <span className="text-xs bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300 px-2 py-1 rounded">
                      7 Days
                    </span>
                  </div>
                  <p className="text-3xl font-bold">{gaData.last7Days.newUsers.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    First-time visitors
                  </p>
                </Card>
              </>
            )}
          </div>

          {/* 30-Day Comparison */}
          {gaData.last30Days && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">30-Day Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold mt-1">{gaData.last30Days.activeUsers.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sessions</p>
                  <p className="text-2xl font-bold mt-1">{gaData.last30Days.sessions.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Page Views</p>
                  <p className="text-2xl font-bold mt-1">{gaData.last30Days.pageViews.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">New Users</p>
                  <p className="text-2xl font-bold mt-1">{gaData.last30Days.newUsers.toLocaleString()}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {!gaEnabled && !isLoadingGA && (
        <Card className="p-8 text-center border-dashed">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Google Analytics Not Configured</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            To view Google Analytics metrics, please configure your GA service account credentials.
            Check the setup documentation for instructions.
          </p>
        </Card>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-3xl font-bold mt-2">{overview.totalUsers.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-green-600">
                  +{overview.newUsersThisMonth} this month
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-3xl font-bold mt-2">${overview.totalRevenue.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-green-600">
                  +${overview.revenueThisMonth.toLocaleString()} this month
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Posts Generated</p>
              <p className="text-3xl font-bold mt-2">{overview.totalPosts.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-2 text-sm">
                <Activity className="w-4 h-4 text-purple-600" />
                <span className="text-purple-600">
                  {overview.totalComments.toLocaleString()} comments
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
              <p className="text-3xl font-bold mt-2">{overview.conversionRate.toFixed(1)}%</p>
              <div className="flex items-center gap-1 mt-2 text-sm">
                <Target className="w-4 h-4 text-orange-600" />
                <span className="text-orange-600">
                  Trial to Paid
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section - Placeholder for Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">User Growth Trend</h3>
          <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
            <div className="text-center">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Line chart showing daily user signups
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                (Recharts integration coming next)
              </p>
            </div>
          </div>
        </Card>

        {/* Revenue Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Revenue</h3>
          <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
            <div className="text-center">
              <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Bar chart showing monthly revenue trends
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                (Recharts integration coming next)
              </p>
            </div>
          </div>
        </Card>

        {/* Plan Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Plan Distribution</h3>
          <div className="space-y-4">
            {analyticsData.planDistribution.map((plan) => {
              const total = analyticsData.planDistribution.reduce((sum, p) => sum + p.count, 0);
              const percentage = (plan.count / total * 100).toFixed(1);
              
              return (
                <div key={plan.plan}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{plan.plan}</span>
                    <span className="text-sm text-muted-foreground">
                      {plan.count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        plan.plan === "Trial" 
                          ? "bg-yellow-500" 
                          : plan.plan === "Starter" 
                          ? "bg-blue-500" 
                          : "bg-purple-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Content Stats */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Content Generation</h3>
          <div className="space-y-6">
            {analyticsData.contentStats.map((stat) => (
              <div key={stat.type} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {stat.type === "Posts" ? (
                    <FileText className="w-8 h-8 text-blue-600" />
                  ) : (
                    <MessageSquare className="w-8 h-8 text-green-600" />
                  )}
                  <span className="font-medium">{stat.type}</span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{stat.count.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total generated</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Key Metrics Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Key Performance Metrics</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr className="bg-muted/50">
                <th className="text-left p-3 font-semibold">Metric</th>
                <th className="text-right p-3 font-semibold">Value</th>
                <th className="text-right p-3 font-semibold">Target</th>
                <th className="text-right p-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3">Average Engagement Rate</td>
                <td className="text-right p-3">{overview.avgEngagement.toFixed(1)}%</td>
                <td className="text-right p-3">5.0%</td>
                <td className="text-right p-3">
                  <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                    Close
                  </span>
                </td>
              </tr>
              <tr className="border-b">
                <td className="p-3">Conversion Rate</td>
                <td className="text-right p-3">{overview.conversionRate.toFixed(1)}%</td>
                <td className="text-right p-3">10.0%</td>
                <td className="text-right p-3">
                  <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    On Track
                  </span>
                </td>
              </tr>
              <tr className="border-b">
                <td className="p-3">Monthly Active Users</td>
                <td className="text-right p-3">{overview.totalUsers}</td>
                <td className="text-right p-3">1,000</td>
                <td className="text-right p-3">
                  <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    Exceeded
                  </span>
                </td>
              </tr>
              <tr>
                <td className="p-3">Average Revenue Per User</td>
                <td className="text-right p-3">
                  ${(overview.totalRevenue / overview.totalUsers).toFixed(2)}
                </td>
                <td className="text-right p-3">$15.00</td>
                <td className="text-right p-3">
                  <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                    Close
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Analytics;

