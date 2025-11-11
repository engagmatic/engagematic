import { Card } from "@/components/ui/card";
import { Activity, FileText, MessageSquare, TrendingUp, Loader2, Lightbulb, Users, Gift, Copy, Check, Lock, AlertCircle, Sparkles, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useDashboard } from "../hooks/useAnalytics";
import { useEffect, useState } from "react";
import { SubscriptionStatus } from "../components/SubscriptionStatus";
import { CreditTrackingStatus } from "../components/CreditTrackingStatus";
import { useSubscription } from "../hooks/useSubscription";
import api from "../services/api";
import { useToast } from "../hooks/use-toast";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { dashboardData, isLoading: dashboardLoading } = useDashboard();
  const { isTrialExpired, isTrialActive, isSubscriptionActive } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [referralData, setReferralData] = useState(null);
  const [copied, setCopied] = useState(false);

  const userProfile = dashboardData?.currentUser || {};

  function needsOnboarding(profile) {
    const required = [
      'goal', 'personaName', 'style', 'tone', 'expertise', 'audience',
      'jobTitle', 'company', 'industry', 'experience',
      'contentTypes', 'postingFrequency', 'topics'
    ];
    return required.some(k => !profile?.[k] || (Array.isArray(profile[k]) && !profile[k].length));
  }

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      change: stats.postsGrowth 
    },
    { 
      label: "Comments Generated", 
      value: stats.commentsGenerated.toString(), 
      icon: MessageSquare,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      change: stats.commentsGrowth 
    },
    { 
      label: "Engagement Rate", 
      value: stats.engagementRate, 
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      change: "+0%" 
    },
    { 
      label: "Pulse Score", 
      value: stats.pulseScore.toString(), 
      icon: Activity,
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      change: "+0%" 
    },
  ];

  return (
    <div className="w-full bg-gray-50 dark:bg-slate-950 min-h-screen">
      {/* Page Header */}
      <header className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 hidden lg:block">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-50">
            Dashboard
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track your LinkedIn growth and create engaging content
          </p>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="p-4 sm:p-6 lg:p-8">
          {/* Trial Expired Banner - Prominent Alert */}
          {isTrialExpired && (
            <Card className="mb-6 border-2 border-orange-300 dark:border-orange-700 bg-gradient-to-r from-orange-50 via-red-50 to-orange-50 dark:from-orange-950/30 dark:via-red-950/30 dark:to-orange-950/30 shadow-xl">
              <div className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Your Free Trial Has Ended
                      </h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                        Continue creating engaging LinkedIn content and unlock unlimited growth. Choose a plan to keep building your professional presence.
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-green-600" />
                          Unlimited ideas
                        </span>
                        <span className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-green-600" />
                          Advanced AI personas
                        </span>
                        <span className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-green-600" />
                          Priority support
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate('/plan-management')}
                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all h-12 px-6 font-semibold whitespace-nowrap"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Choose Your Plan
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Subscription Status */}
          <div className="mb-6">
            <CreditTrackingStatus />
          </div>

          {/* KPI Cards - Premium Design */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {quickStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card 
                  key={index} 
                  className="p-6 bg-white dark:bg-slate-900 border-0 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      {stat.change}
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold mb-1 text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Referral Section */}
          {referralData && (
            <Card className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
                    <Gift className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Earn Free Months</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {referralData.totalReferrals || 0} referrals • {referralData.freeMonthsEarned || 0} free months earned
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleCopyReferralLink}
                    className="px-4 py-2 bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all text-sm font-medium"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <Link to="/referral">
                    <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium text-sm">
                      <Users className="h-4 w-4 inline mr-2" />
                      Invite Friends
                    </button>
                  </Link>
                </div>
              </div>
            </Card>
          )}

          {/* Generator Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Idea Generator Card */}
            <div className={isTrialExpired ? "relative" : ""}>
              {isTrialExpired && (
                <div className="absolute inset-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <div className="text-center p-4">
                    <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Upgrade to Unlock</p>
                    <Button
                      size="sm"
                      onClick={() => navigate('/plan-management')}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Upgrade Now
                    </Button>
                  </div>
                </div>
              )}
              <Link to={isTrialExpired ? "#" : "/idea-generator"} onClick={(e) => isTrialExpired && e.preventDefault()}>
                <Card className={`relative overflow-hidden p-6 transition-all duration-300 group border-2 bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 dark:from-yellow-950/20 dark:via-orange-950/20 dark:to-amber-950/20 ${
                  isTrialExpired 
                    ? "opacity-60 cursor-not-allowed border-gray-300 dark:border-gray-700" 
                    : "hover:shadow-xl cursor-pointer hover:border-yellow-400"
                }`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-bl-full" />
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 via-orange-500 to-amber-600 flex items-center justify-center mb-4 shadow-xl group-hover:scale-110 transition-transform duration-300">
                    <Lightbulb className="h-8 w-8 text-white" />
                  </div>
                  <div className="inline-block px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold rounded-full mb-3">
                    💡 STRATEGY FIRST
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-50">Idea Generator</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                    Generate 5-8 viral post ideas with proven frameworks and engagement hooks
                  </p>
                  <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 text-sm font-bold group-hover:gap-4 transition-all">
                    <span>Generate Ideas</span>
                    <span className="text-lg">→</span>
                  </div>
                </div>
              </Card>
            </Link>
            </div>

            {/* Post Generator Card */}
            <div className={isTrialExpired ? "relative" : ""}>
              {isTrialExpired && (
                <div className="absolute inset-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <div className="text-center p-4">
                    <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Upgrade to Unlock</p>
                    <Button
                      size="sm"
                      onClick={() => navigate('/plan-management')}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Upgrade Now
                    </Button>
                  </div>
                </div>
              )}
              <Link to={isTrialExpired ? "#" : "/post-generator"} onClick={(e) => isTrialExpired && e.preventDefault()}>
                <Card className={`relative overflow-hidden p-6 transition-all duration-300 group border-2 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 ${
                  isTrialExpired 
                    ? "opacity-60 cursor-not-allowed border-gray-300 dark:border-gray-700" 
                    : "hover:shadow-xl cursor-pointer hover:border-blue-400"
                }`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-bl-full" />
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center mb-4 shadow-xl group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <div className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-full mb-3">
                    ✨ AI-POWERED
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-50">Post Generator</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                    Create viral-worthy LinkedIn posts with AI that sounds authentically like you
                  </p>
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-bold group-hover:gap-4 transition-all">
                    <span>Start Creating</span>
                    <span className="text-lg">→</span>
                  </div>
                </div>
              </Card>
            </Link>
            </div>

            {/* Comment Generator Card */}
            <div className={isTrialExpired ? "relative" : ""}>
              {isTrialExpired && (
                <div className="absolute inset-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <div className="text-center p-4">
                    <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Upgrade to Unlock</p>
                    <Button
                      size="sm"
                      onClick={() => navigate('/plan-management')}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Upgrade Now
                    </Button>
                  </div>
                </div>
              )}
              <Link to={isTrialExpired ? "#" : "/comment-generator"} onClick={(e) => isTrialExpired && e.preventDefault()}>
                <Card className={`relative overflow-hidden p-6 transition-all duration-300 group border-2 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-orange-950/20 ${
                  isTrialExpired 
                    ? "opacity-60 cursor-not-allowed border-gray-300 dark:border-gray-700" 
                    : "hover:shadow-xl cursor-pointer hover:border-purple-400"
                }`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-bl-full" />
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 flex items-center justify-center mb-4 shadow-xl group-hover:scale-110 transition-transform duration-300">
                    <MessageSquare className="h-8 w-8 text-white" />
                  </div>
                  <div className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-bold rounded-full mb-3">
                    💬 ENGAGEMENT BOOST
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-50">Comment Generator</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                    Generate genuine, human-like comments that build real professional relationships
                  </p>
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-sm font-bold group-hover:gap-4 transition-all">
                    <span>Generate Comments</span>
                    <span className="text-lg">→</span>
                  </div>
                </div>
              </Card>
            </Link>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Dashboard;