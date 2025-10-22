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
  XCircle
} from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { Link } from "react-router-dom";

export const SubscriptionStatus = () => {
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
    getTokensTotal
  } = useSubscription();

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
    },
    enterprise: {
      name: "Enterprise",
      icon: Crown,
      color: "text-gold-500",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200"
    }
  };

  const config = planConfig[subscription.plan] || planConfig.trial;
  const Icon = config.icon;

  return (
    <Card className={`p-6 ${config.bgColor} ${config.borderColor} border-2`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${config.color}`} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{config.name} Plan</h3>
            <p className="text-sm text-muted-foreground">
              {isTrialActive && `Trial expires in ${getTrialDaysRemaining()} days`}
              {isSubscriptionActive && "Active subscription"}
              {isTrialExpired && "Trial expired"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isTrialActive && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              <Clock className="w-3 h-3 mr-1" />
              Trial
            </Badge>
          )}
          {isSubscriptionActive && (
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <CheckCircle className="w-3 h-3 mr-1" />
              Active
            </Badge>
          )}
          {isTrialExpired && (
            <Badge variant="destructive" className="bg-red-100 text-red-700">
              <XCircle className="w-3 h-3 mr-1" />
              Expired
            </Badge>
          )}
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="space-y-4">
        {/* Tokens */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">Tokens Available</span>
            </div>
            <span className="text-sm font-semibold text-foreground">
              {getTokensRemaining()}/{getTokensTotal()}
            </span>
          </div>
          <Progress 
            value={(getTokensRemaining() / getTokensTotal()) * 100} 
            className="h-2 bg-gray-200"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {getTokensUsed()} tokens used
          </p>
        </div>

        {/* Posts */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Posts Generated</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {subscription.usage?.postsGenerated || 0}/{subscription.limits?.postsPerMonth || 0}
            </span>
          </div>
          <Progress 
            value={getUsagePercentage("postsGenerated")} 
            className="h-2"
          />
        </div>

        {/* Comments */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Comments Generated</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {subscription.usage?.commentsGenerated || 0}/{subscription.limits?.commentsPerMonth || 0}
            </span>
          </div>
          <Progress 
            value={getUsagePercentage("commentsGenerated")} 
            className="h-2"
          />
        </div>
      </div>

      {/* Trial Expiry Warning */}
      {isTrialActive && getTrialDaysRemaining() <= 3 && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-orange-700">
              Your trial expires in {getTrialDaysRemaining()} days. Upgrade to continue using LinkedInPulse.
            </span>
          </div>
        </div>
      )}

      {/* Trial Expired Warning */}
      {isTrialExpired && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-700">
              Your trial has expired. Upgrade to continue using LinkedInPulse.
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 flex gap-2">
        {(isTrialActive || isTrialExpired) && (
          <Button asChild className="flex-1">
            <Link to="/pricing">
              <TrendingUp className="w-4 h-4 mr-2" />
              Upgrade Plan
            </Link>
          </Button>
        )}
        
        {isSubscriptionActive && (
          <Button variant="outline" className="flex-1">
            Manage Subscription
          </Button>
        )}
      </div>
    </Card>
  );
};
