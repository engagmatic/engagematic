import { Card } from "@/components/ui/card";
import { Activity, FileText, MessageSquare, TrendingUp, Loader2, Lightbulb, Users, Gift, Copy, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useDashboard } from "../hooks/useAnalytics";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { SubscriptionStatus } from "../components/SubscriptionStatus";
import { CreditTrackingStatus } from "../components/CreditTrackingStatus";
import api from "../services/api";
import { useToast } from "../hooks/use-toast";

const Dashboard = () => {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { dashboardData, isLoading: dashboardLoading } = useDashboard();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [referralData, setReferralData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchReferralData();
    }
  }, [isAuthenticated]);

  const fetchReferralData = async () => {
    try {
      const response = await api.getReferralStats();
      if (response.success) {
        setReferralData(response.data);
      }
    } catch (error) {
      console.error("Error fetching referral data:", error);
    }
  };

  const handleCopyReferralLink = () => {
    if (referralData?.referralLink) {
      navigator.clipboard.writeText(referralData.referralLink);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
    <div className="space-y-4 sm:space-y-5 md:space-y-6 w-full overflow-x-hidden">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2">
          Dashboard
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Track your LinkedIn growth and create engaging content</p>
      </div>

      {/* Subscription Status */}
      <CreditTrackingStatus />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-4 sm:p-5 md:p-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-green-600">{stat.change}</span>
              </div>
              <div className="text-xl sm:text-2xl md:text-2xl font-bold mb-1 text-gray-900 dark:text-gray-100">{stat.value}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
            </Card>
          );
        })}
      </div>

      {/* Referral Section */}
      {referralData && (
        <Card className="p-4 sm:p-5 md:p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <Gift className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Earn Free Months</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {referralData.totalReferrals || 0} referrals • {referralData.freeMonthsEarned || 0} free months earned
                  </p>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyReferralLink}
                  className="flex-1 sm:flex-initial touch-manipulation min-h-[44px] sm:min-h-0"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Link to="/referral" className="flex-1 sm:flex-initial">
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white touch-manipulation min-h-[44px] sm:min-h-0">
                    <Users className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Invite Friends</span>
                    <span className="sm:hidden">Invite</span>
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}

        {/* Tool Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {/* Idea Generator Card */}
          <Link to="/idea-generator" className="touch-manipulation">
            <Card className="relative overflow-hidden p-5 sm:p-6 md:p-8 hover:shadow-2xl transition-all duration-300 group cursor-pointer border-2 hover:border-yellow-400 bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 active:scale-[0.98]">
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-bl-full" />
              <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-tr from-amber-400/10 to-yellow-400/10 rounded-tr-full" />
              
              <div className="relative">
                {/* Icon Badge */}
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-yellow-500 via-orange-500 to-amber-600 flex items-center justify-center mb-4 sm:mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  <Lightbulb className="h-7 w-7 sm:h-10 sm:w-10 text-white" />
                </div>
                
                {/* Badge */}
                <div className="inline-block px-2 py-1 sm:px-3 sm:py-1 bg-yellow-100 text-yellow-700 text-[10px] sm:text-xs font-bold rounded-full mb-2 sm:mb-3">
                  💡 STRATEGY FIRST
                </div>
                
                {/* Title */}
                <h3 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 text-gray-900">Idea Generator</h3>
                
                {/* Description */}
                <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 leading-relaxed">
                  Generate 5-8 viral post ideas with proven frameworks and engagement hooks
                </p>
                
                {/* Features List */}
                <ul className="space-y-2 mb-4 sm:mb-6">
                  <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                    <span className="w-4 h-4 sm:w-5 sm:h-5 bg-yellow-500 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold flex-shrink-0">✓</span>
                    <span>7 content angles (story, question, list...)</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                    <span className="w-4 h-4 sm:w-5 sm:h-5 bg-yellow-500 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold flex-shrink-0">✓</span>
                    <span>Ready-to-use hooks & frameworks</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                    <span className="w-4 h-4 sm:w-5 sm:h-5 bg-yellow-500 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold flex-shrink-0">✓</span>
                    <span>1-click to Post Generator</span>
                  </li>
                </ul>
                
                {/* CTA */}
                <div className="inline-flex items-center gap-2 text-yellow-600 text-sm sm:text-base font-bold group-hover:gap-4 transition-all duration-300">
                  <span>Generate Ideas</span>
                  <span className="text-lg sm:text-xl">→</span>
                </div>
              </div>
            </Card>
          </Link>

          {/* Post Generator Card */}
          <Link to="/post-generator" className="touch-manipulation">
            <Card className="relative overflow-hidden p-5 sm:p-6 md:p-8 hover:shadow-2xl transition-all duration-300 group cursor-pointer border-2 hover:border-blue-400 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 active:scale-[0.98]">
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-bl-full" />
              <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-tr from-pink-400/10 to-blue-400/10 rounded-tr-full" />
              
              <div className="relative">
                {/* Icon Badge */}
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center mb-4 sm:mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-7 w-7 sm:h-10 sm:w-10 text-white" />
                </div>
                
                {/* Badge */}
                <div className="inline-block px-2 py-1 sm:px-3 sm:py-1 bg-blue-100 text-blue-700 text-[10px] sm:text-xs font-bold rounded-full mb-2 sm:mb-3">
                  ✨ AI-POWERED
                </div>
                
                {/* Title */}
                <h3 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 text-gray-900">Post Generator</h3>
                
                {/* Description */}
                <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 leading-relaxed">
                  Create viral-worthy LinkedIn posts with AI that sounds authentically like you
                </p>
                
                {/* Features List */}
                <ul className="space-y-2 mb-4 sm:mb-6">
                  <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                    <span className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold flex-shrink-0">✓</span>
                    <span>15 AI personas + custom voice</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                    <span className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold flex-shrink-0">✓</span>
                    <span>Viral hooks & smart formatting</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                    <span className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold flex-shrink-0">✓</span>
                    <span>Zero-edit, LinkedIn-ready</span>
                  </li>
                </ul>
                
                {/* CTA */}
                <div className="inline-flex items-center gap-2 text-blue-600 text-sm sm:text-base font-bold group-hover:gap-4 transition-all duration-300">
                  <span>Start Creating</span>
                  <span className="text-lg sm:text-xl">→</span>
                </div>
              </div>
            </Card>
          </Link>

          {/* Comment Generator Card */}
          <Link to="/comment-generator" className="touch-manipulation">
            <Card className="relative overflow-hidden p-5 sm:p-6 md:p-8 hover:shadow-2xl transition-all duration-300 group cursor-pointer border-2 hover:border-purple-400 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 active:scale-[0.98]">
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-bl-full" />
              <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-tr from-orange-400/10 to-purple-400/10 rounded-tr-full" />
              
              <div className="relative">
                {/* Icon Badge */}
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 flex items-center justify-center mb-4 sm:mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="h-7 w-7 sm:h-10 sm:w-10 text-white" />
                </div>
                
                {/* Badge */}
                <div className="inline-block px-2 py-1 sm:px-3 sm:py-1 bg-purple-100 text-purple-700 text-[10px] sm:text-xs font-bold rounded-full mb-2 sm:mb-3">
                  💬 ENGAGEMENT BOOST
                </div>
                
                {/* Title */}
                <h3 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 text-gray-900">Comment Generator</h3>
                
                {/* Description */}
                <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 leading-relaxed">
                  Generate genuine, human-like comments that build real professional relationships
                </p>
                
                {/* Features List */}
                <ul className="space-y-2 mb-4 sm:mb-6">
                  <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                    <span className="w-4 h-4 sm:w-5 sm:h-5 bg-purple-500 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold flex-shrink-0">✓</span>
                    <span>Context-aware responses</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                    <span className="w-4 h-4 sm:w-5 sm:h-5 bg-purple-500 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold flex-shrink-0">✓</span>
                    <span>Natural conversation flow</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                    <span className="w-4 h-4 sm:w-5 sm:h-5 bg-purple-500 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold flex-shrink-0">✓</span>
                    <span>Build authentic connections</span>
                  </li>
                </ul>
                
                {/* CTA */}
                <div className="inline-flex items-center gap-2 text-purple-600 text-sm sm:text-base font-bold group-hover:gap-4 transition-all duration-300">
                  <span>Generate Comments</span>
                  <span className="text-lg sm:text-xl">→</span>
                </div>
              </div>
            </Card>
          </Link>
        </div>
    </div>
  );
};

export default Dashboard;
