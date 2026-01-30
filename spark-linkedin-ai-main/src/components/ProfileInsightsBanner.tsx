import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, XCircle } from "lucide-react";
import apiClient from "@/services/api";

interface ProfileInsightsSummary {
  hasAnalysis: boolean;
  industry?: string;
  writingStyle?: string;
  expertiseLevel?: string;
  topKeywords?: string[];
  profileScore?: number;
  message: string;
}

export const ProfileInsightsBanner = () => {
  const [insights, setInsights] = useState<ProfileInsightsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const response = await apiClient.request("/profile-analyzer/insights-summary", {
        method: "GET",
      });

      if (response.success) {
        setInsights(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch insights:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || dismissed) return null;

  if (!insights?.hasAnalysis) {
    return null;
  }

  return (
    <Card className="p-4 mb-6 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <h3 className="font-semibold text-sm">AI Enhanced with Your Profile</h3>
            <Badge variant="secondary" className="text-xs">
              Active
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{insights.message}</p>
          <div className="flex flex-wrap gap-2">
            {insights.industry && (
              <Badge variant="outline" className="text-xs">
                {insights.industry}
              </Badge>
            )}
            {insights.writingStyle && (
              <Badge variant="outline" className="text-xs capitalize">
                {insights.writingStyle} tone
              </Badge>
            )}
            {insights.expertiseLevel && (
              <Badge variant="outline" className="text-xs capitalize">
                {insights.expertiseLevel} level
              </Badge>
            )}
            {insights.profileScore && (
              <Badge variant="outline" className="text-xs gap-1">
                <TrendingUp className="h-3 w-3" />
                Score: {insights.profileScore}/100
              </Badge>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDismissed(true)}
          className="shrink-0"
        >
          <XCircle className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

