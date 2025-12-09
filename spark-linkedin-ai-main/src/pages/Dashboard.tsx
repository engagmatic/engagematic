import { Card } from "@/components/ui/card";
import { Activity, FileText, MessageSquare, TrendingUp, Loader2, Lightbulb, Users, Gift, Copy, Check, Lock, AlertCircle, Sparkles, ArrowRight, Clock, Target, Zap, UserCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useDashboard } from "../hooks/useAnalytics";
import { useEffect, useState, useMemo } from "react";
import { SubscriptionStatus } from "../components/SubscriptionStatus";
import { CreditTrackingStatus } from "../components/CreditTrackingStatus";
import { useSubscription } from "../hooks/useSubscription";
import api from "../services/api";
import { useToast } from "../hooks/use-toast";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { dashboardData, isLoading: dashboardLoading } = useDashboard();
  const { isTrialExpired, isTrialActive, isSubscriptionActive, loading: subscriptionLoading } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [referralData, setReferralData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [weeklyStats, setWeeklyStats] = useState({ postsThisWeek: 0, commentsThisWeek: 0 });

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
      fetchWeeklyStats();
    }
  }, [isAuthenticated]);

  const fetchWeeklyStats = async () => {
    try {
      // Get start of current week (Monday)
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust when day is Sunday
      const startOfWeek = new Date(now);
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);

      // Fetch content history for this week
      const response = await api.getContentHistory({
        startDate: startOfWeek.toISOString(),
        limit: 1000
      });

      if (response.success && response.data?.content) {
        const thisWeekContent = response.data.content.filter((item: any) => {
          const itemDate = new Date(item.createdAt);
          return itemDate >= startOfWeek;
        });

        const postsThisWeek = thisWeekContent.filter((item: any) => item.type === 'post').length;
        const commentsThisWeek = thisWeekContent.filter((item: any) => item.type === 'comment').length;

        setWeeklyStats({ postsThisWeek, commentsThisWeek });
      }
    } catch (error) {
      console.error("Error fetching weekly stats:", error);
    }
  };

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

  // Calculate stats - must be before early returns
  const stats = dashboardData?.stats || {
    postsCreated: 0,
    commentsGenerated: 0,
    engagementRate: "0%",
    pulseScore: 0,
    postsGrowth: "+0%",
    commentsGrowth: "+0%"
  };

  // Calculate premium metrics - MUST be before any early returns
  const timeSaved = useMemo(() => {
    // Estimate: 15 minutes per post, 3 minutes per comment
    const minutesSaved = (stats.postsCreated * 15) + (stats.commentsGenerated * 3);
    if (minutesSaved >= 60) {
      const hours = Math.floor(minutesSaved / 60);
      const mins = minutesSaved % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${minutesSaved}m`;
  }, [stats.postsCreated, stats.commentsGenerated]);

  const engagementWon = useMemo(() => {
    // Calculate engagement points: engagement rate * posts created
    const engagementRateNum = parseInt(stats.engagementRate) || 0;
    return Math.round((engagementRateNum * stats.postsCreated) / 100);
  }, [stats.engagementRate, stats.postsCreated]);

  // Weekly progress calculations
  const weeklyPostProgress = Math.min(100, (weeklyStats.postsThisWeek / 3) * 100);
  const weeklyCommentProgress = Math.min(100, (weeklyStats.commentsThisWeek / 10) * 100);

  // Early returns AFTER all hooks
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

  // Premium stat blocks
  const premiumStats = [
    { 
      label: "Posts Created", 
      value: stats.postsCreated.toString(), 
      icon: FileText,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20"
    },
    { 
      label: "Engagement Won", 
      value: engagementWon.toString(), 
      icon: TrendingUp,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20"
    },
    { 
      label: "Time Saved", 
      value: timeSaved, 
      icon: Clock,
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20"
    },
  ];

  return (
    <div className="w-full bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 min-h-screen">
      {/* Premium Dashboard Content */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Personalized Greeting & CTAs - Premium Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
              </h1>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
                Ready to grow your LinkedIn presence?
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button
                onClick={() => navigate('/post-generator')}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all h-11 px-6 font-semibold"
                disabled={!subscriptionLoading && isTrialExpired}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Create New Post
              </Button>
            </div>
          </div>
        </div>

        {/* Trial Expired Banner - Prominent Alert */}
        {!subscriptionLoading && isTrialExpired && (
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
        <div className="mb-8">
          <CreditTrackingStatus />
        </div>

        {/* Premium Stat Blocks - Three Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {premiumStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={index} 
                className={`p-6 bg-gradient-to-br ${stat.bgGradient} border-0 shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-3xl sm:text-4xl font-bold mb-1 text-gray-900 dark:text-white">
                      {stat.value}
                    </div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {stat.label}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Progress Bars - Impact Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Post 3 per week Goal */}
          <Card className="p-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Post 3 per week</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {weeklyStats.postsThisWeek} of 3 posts this week
                  </p>
                </div>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(weeklyPostProgress)}%
              </span>
            </div>
            <div className="relative mb-3">
              <div className="h-2.5 w-full bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500 ease-out shadow-sm"
                  style={{ width: `${weeklyPostProgress}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Zap className="h-3 w-3" />
              <span>Try posting on trending topics to boost engagement!</span>
            </p>
          </Card>

          {/* Achieve 10 meaningful comments Goal */}
          <Card className="p-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Achieve 10 meaningful comments</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {weeklyStats.commentsThisWeek} of 10 comments
                  </p>
                </div>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(weeklyCommentProgress)}%
              </span>
            </div>
            <div className="relative mb-3">
              <div className="h-2.5 w-full bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out shadow-sm"
                  style={{ width: `${weeklyCommentProgress}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Zap className="h-3 w-3" />
              <span>Engage with industry leaders to build your network!</span>
            </p>
          </Card>
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
            <div className={!subscriptionLoading && isTrialExpired ? "relative" : ""}>
              {!subscriptionLoading && isTrialExpired && (
                <div className="absolute inset-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <div className="text-center p-4">
                    <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Upgrade to Unlock</p>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate('/plan-management');
                      }}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Upgrade Now
                    </Button>
                  </div>
                </div>
              )}
              {!subscriptionLoading && isTrialExpired ? (
                <Card className="relative overflow-hidden p-6 transition-all duration-300 border-2 bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 dark:from-yellow-950/20 dark:via-orange-950/20 dark:to-amber-950/20 opacity-60 cursor-not-allowed border-gray-300 dark:border-gray-700">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-bl-full" />
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 via-orange-500 to-amber-600 flex items-center justify-center mb-4 shadow-xl">
                      <Lightbulb className="h-8 w-8 text-white" />
                    </div>
                    <div className="inline-block px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold rounded-full mb-3">
                      💡 STRATEGY FIRST
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-50">Idea Generator</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                      Generate 5-8 viral post ideas with proven frameworks and engagement hooks
                    </p>
                    <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 text-sm font-bold">
                      <span>Generate Ideas</span>
                      <span className="text-lg">→</span>
                    </div>
                  </div>
                </Card>
              ) : (
                <Link to="/idea-generator">
                  <Card className={`relative overflow-hidden p-6 transition-all duration-300 group border-2 bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 dark:from-yellow-950/20 dark:via-orange-950/20 dark:to-amber-950/20 hover:shadow-xl cursor-pointer hover:border-yellow-400`}>
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
              )}
            </div>

            {/* Post Generator Card */}
            <div className={!subscriptionLoading && isTrialExpired ? "relative" : ""}>
              {!subscriptionLoading && isTrialExpired && (
                <div className="absolute inset-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <div className="text-center p-4">
                    <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Upgrade to Unlock</p>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate('/plan-management');
                      }}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Upgrade Now
                    </Button>
                  </div>
                </div>
              )}
              {!subscriptionLoading && isTrialExpired ? (
                <Card className="relative overflow-hidden p-6 transition-all duration-300 border-2 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 opacity-60 cursor-not-allowed border-gray-300 dark:border-gray-700">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-bl-full" />
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center mb-4 shadow-xl">
                      <FileText className="h-8 w-8 text-white" />
                    </div>
                    <div className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-full mb-3">
                      ✨ AI-POWERED
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-50">Post Generator</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                      Create viral-worthy LinkedIn posts with AI that sounds authentically like you
                    </p>
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-bold">
                      <span>Start Creating</span>
                      <span className="text-lg">→</span>
                    </div>
                  </div>
                </Card>
              ) : (
                <Link to="/post-generator">
                  <Card className={`relative overflow-hidden p-6 transition-all duration-300 group border-2 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 hover:shadow-xl cursor-pointer hover:border-blue-400`}>
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
              )}
            </div>

            {/* Comment Generator Card */}
            <div className={!subscriptionLoading && isTrialExpired ? "relative" : ""}>
              {!subscriptionLoading && isTrialExpired && (
                <div className="absolute inset-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <div className="text-center p-4">
                    <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Upgrade to Unlock</p>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate('/plan-management');
                      }}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Upgrade Now
                    </Button>
                  </div>
                </div>
              )}
              {!subscriptionLoading && isTrialExpired ? (
                <Card className="relative overflow-hidden p-6 transition-all duration-300 border-2 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-orange-950/20 opacity-60 cursor-not-allowed border-gray-300 dark:border-gray-700">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-bl-full" />
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 flex items-center justify-center mb-4 shadow-xl">
                      <MessageSquare className="h-8 w-8 text-white" />
                    </div>
                    <div className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-bold rounded-full mb-3">
                      💬 ENGAGEMENT BOOST
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-50">Comment Generator</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                      Generate genuine, human-like comments that build real professional relationships
                    </p>
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-sm font-bold">
                      <span>Generate Comments</span>
                      <span className="text-lg">→</span>
                    </div>
                  </div>
                </Card>
              ) : (
                <Link to="/comment-generator">
                  <Card className={`relative overflow-hidden p-6 transition-all duration-300 group border-2 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-orange-950/20 hover:shadow-xl cursor-pointer hover:border-purple-400`}>
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
              )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;