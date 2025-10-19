import { Card } from "@/components/ui/card";
import { Activity, FileText, MessageSquare, TrendingUp, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useDashboard } from "../hooks/useAnalytics";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Dashboard = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { dashboardData, isLoading: dashboardLoading } = useDashboard();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  if (authLoading || dashboardLoading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const stats = dashboardData?.stats || {
    postsCreated: 0,
    commentsGenerated: 0,
    engagementRate: "0%",
    pulseScore: 0,
    postsGrowth: "+0%",
    commentsGrowth: "+0%"
  };

  const quickStats = [
    { 
      label: "Posts Created", 
      value: stats.postsCreated.toString(), 
      icon: FileText, 
      change: stats.postsGrowth 
    },
    { 
      label: "Comments Generated", 
      value: stats.commentsGenerated.toString(), 
      icon: MessageSquare, 
      change: stats.commentsGrowth 
    },
    { 
      label: "Engagement Rate", 
      value: stats.engagementRate, 
      icon: TrendingUp, 
      change: "+0%" 
    },
    { 
      label: "Pulse Score", 
      value: stats.pulseScore.toString(), 
      icon: Activity, 
      change: "+0%" 
    },
  ];

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back to your{" "}
            <span className="gradient-pulse bg-clip-text text-transparent">Pulse</span>
          </h1>
          <p className="text-muted-foreground">Track your LinkedIn growth and create engaging content</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-6 hover-lift gradient-card">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl gradient-pulse flex items-center justify-center shadow-pulse">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-green-600">{stat.change}</span>
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Link to="/post-generator">
            <Card className="p-8 hover-lift gradient-card border-border/50 group cursor-pointer">
              <div className="w-16 h-16 rounded-xl gradient-pulse flex items-center justify-center mb-4 shadow-pulse group-hover:animate-heartbeat">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Post Generator</h3>
              <p className="text-muted-foreground mb-4">
                Create viral-worthy LinkedIn posts with AI that sounds authentically like you
              </p>
              <div className="text-primary font-medium group-hover:translate-x-2 transition-smooth inline-flex items-center">
                Start Creating →
              </div>
            </Card>
          </Link>

          <Link to="/comment-generator">
            <Card className="p-8 hover-lift gradient-card border-border/50 group cursor-pointer">
              <div className="w-16 h-16 rounded-xl gradient-pulse flex items-center justify-center mb-4 shadow-pulse group-hover:animate-heartbeat">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Comment Generator</h3>
              <p className="text-muted-foreground mb-4">
                Generate genuine, human-like comments that build real professional relationships
              </p>
              <div className="text-primary font-medium group-hover:translate-x-2 transition-smooth inline-flex items-center">
                Generate Comments →
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
