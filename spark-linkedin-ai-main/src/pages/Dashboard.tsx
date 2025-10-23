import { Card } from "@/components/ui/card";
import { Activity, FileText, MessageSquare, TrendingUp, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useDashboard } from "../hooks/useAnalytics";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { SubscriptionStatus } from "../components/SubscriptionStatus";

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
            <span className="bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent">
              Welcome back to your Dashboard
            </span>
          </h1>
          <p className="text-muted-foreground">Track your LinkedIn growth and create engaging content</p>
        </div>

        {/* Subscription Status */}
        <div className="mb-8">
          <SubscriptionStatus />
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
          {/* Post Generator Card */}
          <Link to="/post-generator">
            <Card className="relative overflow-hidden p-8 hover:shadow-2xl transition-all duration-300 group cursor-pointer border-2 hover:border-blue-400 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-bl-full" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-400/10 to-blue-400/10 rounded-tr-full" />
              
              <div className="relative">
                {/* Icon Badge */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-10 w-10 text-white" />
                </div>
                
                {/* Badge */}
                <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full mb-3">
                  ✨ AI-POWERED
                </div>
                
                {/* Title */}
                <h3 className="text-3xl font-bold mb-3 text-gray-900">Post Generator</h3>
                
                {/* Description */}
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Create viral-worthy LinkedIn posts with AI that sounds authentically like you
                </p>
                
                {/* Features List */}
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</span>
                    <span>15 AI personas + custom voice</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</span>
                    <span>Viral hooks & smart formatting</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</span>
                    <span>Zero-edit, LinkedIn-ready</span>
                  </li>
                </ul>
                
                {/* CTA */}
                <div className="inline-flex items-center gap-2 text-blue-600 font-bold group-hover:gap-4 transition-all duration-300">
                  <span>Start Creating</span>
                  <span className="text-xl">→</span>
                </div>
              </div>
            </Card>
          </Link>

          {/* Comment Generator Card */}
          <Link to="/comment-generator">
            <Card className="relative overflow-hidden p-8 hover:shadow-2xl transition-all duration-300 group cursor-pointer border-2 hover:border-purple-400 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-bl-full" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-400/10 to-purple-400/10 rounded-tr-full" />
              
              <div className="relative">
                {/* Icon Badge */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="h-10 w-10 text-white" />
                </div>
                
                {/* Badge */}
                <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full mb-3">
                  💬 ENGAGEMENT BOOST
                </div>
                
                {/* Title */}
                <h3 className="text-3xl font-bold mb-3 text-gray-900">Comment Generator</h3>
                
                {/* Description */}
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Generate genuine, human-like comments that build real professional relationships
                </p>
                
                {/* Features List */}
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</span>
                    <span>Context-aware responses</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</span>
                    <span>Natural conversation flow</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</span>
                    <span>Build authentic connections</span>
                  </li>
                </ul>
                
                {/* CTA */}
                <div className="inline-flex items-center gap-2 text-purple-600 font-bold group-hover:gap-4 transition-all duration-300">
                  <span>Generate Comments</span>
                  <span className="text-xl">→</span>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
