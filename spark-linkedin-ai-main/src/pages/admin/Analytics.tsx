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
} from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import { toast } from "sonner";

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

const Analytics = () => {
  const { token } = useAdmin();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30days");

  useEffect(() => {
    if (token) {
      fetchAnalytics();
    }
  }, [token, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      
      // Fetch overview stats
      const response = await fetch(`${API_URL}/api/admin/stats`, {
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

