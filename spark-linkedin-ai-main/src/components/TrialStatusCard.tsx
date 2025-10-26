import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, Zap, MessageSquare, Lightbulb, Crown, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

interface TrialStatus {
  isTrial: boolean;
  daysLeft: number;
  isExpired: boolean;
  limits: {
    posts: number;
    comments: number;
    ideas: number;
  };
  usage: {
    posts: number;
    comments: number;
    ideas: number;
  };
  remaining: {
    posts: number;
    comments: number;
    ideas: number;
  };
  trialEndDate: string;
}

export const TrialStatusCard = () => {
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchTrialStatus();
  }, []);

  const fetchTrialStatus = async () => {
    try {
      const response = await api.getTrialStatus();
      if (response.success) {
        setTrialStatus(response.data);
      }
    } catch (error) {
      console.error("Error fetching trial status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    navigate("/pricing");
  };

  if (loading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  if (!trialStatus || !trialStatus.isTrial) {
    return null; // Don't show if not on trial
  }

  const getDaysLeftColor = (daysLeft: number) => {
    if (daysLeft <= 1) return "text-red-600";
    if (daysLeft <= 3) return "text-orange-600";
    return "text-green-600";
  };

  const getUsagePercentage = (used: number, total: number) => {
    return total > 0 ? (used / total) * 100 : 0;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-orange-500";
    return "bg-green-500";
  };

  return (
    <Card className="p-6 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-lg">Free Trial</h3>
        </div>
        <Badge 
          variant={trialStatus.daysLeft <= 1 ? "destructive" : trialStatus.daysLeft <= 3 ? "secondary" : "default"}
          className="text-sm"
        >
          {trialStatus.daysLeft} days left
        </Badge>
      </div>

      {/* Trial Expiry Warning */}
      {trialStatus.daysLeft <= 3 && (
        <div className="mb-4 p-3 bg-orange-100 border border-orange-200 rounded-lg">
          <div className="flex items-center gap-2 text-orange-800">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">
              {trialStatus.daysLeft === 0 
                ? "Your trial has expired!" 
                : `Only ${trialStatus.daysLeft} day${trialStatus.daysLeft === 1 ? '' : 's'} left in your trial!`
              }
            </span>
          </div>
        </div>
      )}

      {/* Usage Breakdown */}
      <div className="space-y-4 mb-6">
        {/* Posts */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Posts</span>
            </div>
            <span className="text-sm text-gray-600">
              {trialStatus.usage.posts} / {trialStatus.limits.posts}
            </span>
          </div>
          <Progress 
            value={getUsagePercentage(trialStatus.usage.posts, trialStatus.limits.posts)} 
            className="h-2"
          />
          <div className="text-xs text-gray-500 mt-1">
            {trialStatus.remaining.posts} remaining
          </div>
        </div>

        {/* Comments */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Comments</span>
            </div>
            <span className="text-sm text-gray-600">
              {trialStatus.usage.comments} / {trialStatus.limits.comments}
            </span>
          </div>
          <Progress 
            value={getUsagePercentage(trialStatus.usage.comments, trialStatus.limits.comments)} 
            className="h-2"
          />
          <div className="text-xs text-gray-500 mt-1">
            {trialStatus.remaining.comments} remaining
          </div>
        </div>

        {/* Ideas */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">Ideas</span>
            </div>
            <span className="text-sm text-gray-600">
              {trialStatus.usage.ideas} / {trialStatus.limits.ideas}
            </span>
          </div>
          <Progress 
            value={getUsagePercentage(trialStatus.usage.ideas, trialStatus.limits.ideas)} 
            className="h-2"
          />
          <div className="text-xs text-gray-500 mt-1">
            {trialStatus.remaining.ideas} remaining
          </div>
        </div>
      </div>

      {/* Trial Info */}
      <div className="text-xs text-gray-600 mb-4">
        <p>• 1 post per day for 7 days</p>
        <p>• 2 comments per day for 7 days</p>
        <p>• 2 ideas per day for 7 days</p>
        <p>• Unlimited profile analysis</p>
      </div>

      {/* CTA Button */}
      <Button 
        onClick={handleUpgrade}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold"
      >
        <Crown className="h-4 w-4 mr-2" />
        {trialStatus.daysLeft <= 1 ? "Upgrade Now" : "Upgrade to Continue"}
      </Button>

      {/* Trial End Date */}
      <div className="text-xs text-gray-500 text-center mt-3">
        Trial ends: {new Date(trialStatus.trialEndDate).toLocaleDateString()}
      </div>
    </Card>
  );
};
