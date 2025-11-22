import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Crown, 
  Clock, 
  Zap, 
  MessageSquare, 
  FileText, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lightbulb,
  Sparkles,
  Loader2
  , Settings
} from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

export const SubscriptionStatus = () => {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);
  
  const { 
    subscription, 
    loading, 
    isTrialActive, 
    isTrialExpired, 
    isSubscriptionActive,
    getTrialDaysRemaining,
    getUsagePercentage,
    getTokensRemaining,
    getTokensUsed,
    getTokensTotal,
    upgradePlan
  } = useSubscription();

  const handleUpgrade = async () => {
    setIsNavigating(true);

    try {
      // Navigate to pricing section on home page
      if (window.location.pathname === '/') {
        const pricingSection = document.getElementById('pricing');
        pricingSection?.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/#pricing');
      }
    } catch (error) {
      console.error('Navigation error:', error);
      toast({
        title: "Navigation Error",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsNavigating(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-3 bg-muted rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  if (!subscription) {
    return null;
  }

  const planConfig = {
    trial: {
      name: "Free Trial",
      icon: Clock,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    starter: {
      name: "Starter",
      icon: Zap,
      color: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    pro: {
      name: "Pro",
      icon: Crown,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    }
    ,
    custom: {
      name: "Custom Plan",
      icon: Settings,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    }
  };

  const config = planConfig[subscription.plan] || planConfig.trial;
  const Icon = config.icon;

  // Calculate usage percentages
  const postsUsed = subscription.usage?.postsGenerated || 0;
  const postsLimit = subscription.limits?.postsPerMonth || 10;
  const postsPercentage = (postsUsed / postsLimit) * 100;

  const commentsUsed = subscription.usage?.commentsGenerated || 0;
  const commentsLimit = subscription.limits?.commentsPerMonth || 25;
  const commentsPercentage = (commentsUsed / commentsLimit) * 100;

  const ideasUsed = subscription.usage?.ideasGenerated || 0;
  const ideasLimit = subscription.limits?.ideasPerMonth || 25;
  const isIdeasUnlimited = ideasLimit === -1;
  const ideasPercentage = isIdeasUnlimited ? 0 : (ideasLimit > 0 ? (ideasUsed / ideasLimit) * 100 : 0);

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    return 'text-emerald-600';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-orange-500';
    return 'bg-gradient-to-r from-blue-500 to-purple-500';
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-blue-900/10 dark:to-purple-900/10 border-2 border-slate-200 dark:border-slate-800 shadow-xl">
      {/* Header Section */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-xl text-slate-900 dark:text-white">
                {config.name}
              </h3>
              {isTrialActive && (
                <Badge className="bg-blue-500 text-white hover:bg-blue-600 shadow-sm">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Trial
                </Badge>
              )}
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {isTrialActive && `${getTrialDaysRemaining()} days remaining to explore`}
              {isSubscriptionActive && "Premium features unlocked"}
              {isTrialExpired && "Trial period has ended"}
            </p>
          </div>
        </div>
      </div>

      {/* Enterprise-Grade Usage Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Posts Card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl blur-xl group-hover:blur-2xl transition-all" />
          <div className="relative p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all shadow-sm hover:shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Posts
                </span>
              </div>
              <span className={`text-lg font-bold ${getUsageColor(postsPercentage)}`}>
                {postsUsed}/{postsLimit}
              </span>
            </div>
            <Progress 
              value={postsPercentage} 
              className="h-2 bg-slate-100 dark:bg-slate-800"
            />
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
              {postsLimit - postsUsed} remaining this month
            </p>
          </div>
        </div>

        {/* Comments Card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl blur-xl group-hover:blur-2xl transition-all" />
          <div className="relative p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all shadow-sm hover:shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Comments
                </span>
              </div>
              <span className={`text-lg font-bold ${getUsageColor(commentsPercentage)}`}>
                {commentsUsed}/{commentsLimit}
              </span>
            </div>
            <Progress 
              value={commentsPercentage} 
              className="h-2 bg-slate-100 dark:bg-slate-800"
            />
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
              {commentsLimit - commentsUsed} remaining this month
            </p>
          </div>
        </div>

        {/* Ideas Card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl blur-xl group-hover:blur-2xl transition-all" />
          <div className="relative p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700 transition-all shadow-sm hover:shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Ideas
                </span>
              </div>
              <span className={`text-lg font-bold ${getUsageColor(ideasPercentage)}`}>
                {isIdeasUnlimited ? `${ideasUsed} (Unlimited)` : `${ideasUsed}/${ideasLimit}`}
              </span>
            </div>
            {!isIdeasUnlimited && (
              <>
                <Progress 
                  value={ideasPercentage} 
                  className="h-2 bg-slate-100 dark:bg-slate-800"
                />
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                  {ideasLimit - ideasUsed} remaining this month
                </p>
              </>
            )}
            {isIdeasUnlimited && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                Unlimited ideas available
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Trial Messaging */}
      {isTrialActive && (
        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2 border-blue-200 dark:border-blue-800 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                Experience the platform risk-free
              </h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                You have <strong>{getTrialDaysRemaining()} days</strong> to explore all features. Generate up to <strong>10 posts</strong>, <strong>25 comments</strong>, and <strong>25 content ideas</strong> to discover how Engagematic transforms your content strategy.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade CTA */}
      {(isTrialActive || isTrialExpired) && (
        <Button 
          onClick={handleUpgrade}
          disabled={isNavigating}
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
        >
          <div className="flex items-center justify-center gap-2">
            {isNavigating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                {isTrialExpired ? "Unlock Full Access" : "Upgrade to Premium"}
                <TrendingUp className="w-5 h-5" />
              </>
            )}
          </div>
        </Button>
      )}

            {isSubscriptionActive && (
              <Button
                variant="outline"
                className="w-full h-12 font-semibold"
                onClick={() => {
                  if (window.location.pathname === '/') {
                    const pricingSection = document.getElementById('pricing');
                    pricingSection?.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    navigate('/#pricing');
                  }
                }}
              >
                <Crown className="w-4 h-4 mr-2" />
                View Plans
              </Button>
            )}
    </Card>
  );
};
