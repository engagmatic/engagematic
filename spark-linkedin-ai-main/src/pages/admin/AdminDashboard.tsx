import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  TrendingUp,
  DollarSign,
  FileText,
  MessageSquare,
  Target,
  Activity,
  RefreshCw,
  UserCheck,
  UserPlus,
  Percent,
} from "lucide-react";
import apiClient from "@/services/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface DashboardData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    todaySignups: number;
    trialUsers: number;
    paidUsers: number;
    conversionRate: number;
    waitlistCount: number;
  };
  content: {
    totalPosts: number;
    totalComments: number;
    todayPosts: number;
    todayComments: number;
    profileAnalyses: number;
  };
  revenue: {
    mrr: number;
    arr: number;
  };
  topCreators: Array<{
    name: string;
    email: string;
    contentCount: number;
  }>;
}

export const AdminDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await apiClient.request("/admin/dashboard", {
        method: "GET",
      });

      if (response.success) {
        setData(response.data);
        setLastUpdated(new Date());
      }
    } catch (error: any) {
      if (error.message?.includes("Admin")) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges",
          variant: "destructive",
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();

    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchDashboard();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const stats = [
    {
      title: "Total Users",
      value: data.overview.totalUsers,
      icon: Users,
      change: `+${data.overview.todaySignups} today`,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Users",
      value: data.overview.activeUsers,
      icon: UserCheck,
      change: `${((data.overview.activeUsers / data.overview.totalUsers) * 100).toFixed(1)}%`,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Paid Users",
      value: data.overview.paidUsers,
      icon: UserPlus,
      change: `${data.overview.conversionRate}% conversion`,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "MRR",
      value: `$${data.revenue.mrr.toFixed(0)}`,
      icon: DollarSign,
      change: `$${data.revenue.arr.toFixed(0)} ARR`,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  const contentStats = [
    {
      title: "Total Posts",
      value: data.content.totalPosts,
      icon: FileText,
      today: data.content.todayPosts,
      color: "text-blue-600",
    },
    {
      title: "Total Comments",
      value: data.content.totalComments,
      icon: MessageSquare,
      today: data.content.todayComments,
      color: "text-purple-600",
    },
    {
      title: "Profile Analyses",
      value: data.content.profileAnalyses,
      icon: Target,
      today: 0,
      color: "text-pink-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Activity className="h-6 w-6 text-primary" />
                Admin Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchDashboard}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
              >
                Exit Admin
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-6 hover-lift">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold mb-2">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Content Stats */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Content Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contentStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                    <p className="font-semibold">{stat.title}</p>
                  </div>
                  <p className="text-3xl font-bold mb-1">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">
                    +{stat.today} today
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* User Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">User Breakdown</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="font-medium">Trial Users</span>
                <Badge variant="secondary">{data.overview.trialUsers}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="font-medium">Paid Users</span>
                <Badge className="bg-green-600">{data.overview.paidUsers}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="font-medium">Waitlist</span>
                <Badge variant="outline">{data.overview.waitlistCount}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                <span className="font-medium flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Conversion Rate
                </span>
                <Badge className="bg-primary">{data.overview.conversionRate}%</Badge>
              </div>
            </div>
          </Card>

          {/* Top Creators */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Top Content Creators</h2>
            <div className="space-y-3">
              {data.topCreators.slice(0, 5).map((creator, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium text-sm">{creator.name}</p>
                      <p className="text-xs text-muted-foreground">{creator.email}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{creator.contentCount} posts</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start gap-2">
              <Users className="h-4 w-4" />
              View All Users
            </Button>
            <Button variant="outline" className="justify-start gap-2">
              <MessageSquare className="h-4 w-4" />
              View Waitlist
            </Button>
            <Button variant="outline" className="justify-start gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics Report
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

