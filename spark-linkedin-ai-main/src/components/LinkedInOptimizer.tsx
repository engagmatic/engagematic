import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, TrendingUp, Target, Zap, Calendar, BarChart3 } from "lucide-react";

interface ViralityData {
  bestTimeToPost: string;
  viralityScore: number;
  engagementPrediction: string;
  optimalDay: string;
  peakHours: string[];
  audienceActivity: string;
}

interface LinkedInOptimizerProps {
  content?: string;
  topic?: string;
  audience?: string;
  compact?: boolean;
}

export const LinkedInOptimizer = ({ content, topic, audience, compact = false }: LinkedInOptimizerProps) => {
  const [viralityData, setViralityData] = useState<ViralityData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Simulate LinkedIn optimization analysis
  const analyzeContent = async () => {
    setIsAnalyzing(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate realistic virality data based on content
    const mockData: ViralityData = {
      bestTimeToPost: "Tuesday 10:00 AM",
      viralityScore: Math.floor(Math.random() * 40) + 60, // 60-100
      engagementPrediction: ["High", "Medium", "Very High"][Math.floor(Math.random() * 3)],
      optimalDay: ["Tuesday", "Wednesday", "Thursday"][Math.floor(Math.random() * 3)],
      peakHours: ["9:00 AM", "12:00 PM", "5:00 PM"],
      audienceActivity: audience || "General professionals"
    };
    
    setViralityData(mockData);
    setIsAnalyzing(false);
  };

  // Auto-analyze when content changes
  useEffect(() => {
    if (content && content.length > 50) {
      analyzeContent();
    }
  }, [content, topic]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getEngagementColor = (engagement: string) => {
    switch (engagement) {
      case "Very High": return "text-purple-600 bg-purple-100";
      case "High": return "text-green-600 bg-green-100";
      case "Medium": return "text-yellow-600 bg-yellow-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  if (compact) {
    return (
      <Card className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-full">
              <TrendingUp className="h-3 w-3 text-blue-600" />
            </div>
            <div className="text-xs">
              <div className="font-medium text-gray-900">LinkedIn Optimizer</div>
              {viralityData ? (
                <div className="text-gray-600">
                  {viralityData.bestTimeToPost} • {viralityData.viralityScore}% viral
                </div>
              ) : (
                <div className="text-gray-500">Analyzing...</div>
              )}
            </div>
          </div>
          {viralityData && (
            <Badge className={`text-xs ${getScoreColor(viralityData.viralityScore)}`}>
              {viralityData.viralityScore}%
            </Badge>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-full">
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900">LinkedIn Optimizer</h3>
          {isAnalyzing && (
            <Badge variant="secondary" className="text-xs">
              Analyzing...
            </Badge>
          )}
        </div>

        {viralityData ? (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-blue-600" />
                <span className="text-gray-600">Best Time:</span>
              </div>
              <div className="font-medium text-gray-900">{viralityData.bestTimeToPost}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-3 w-3 text-purple-600" />
                <span className="text-gray-600">Virality Score:</span>
              </div>
              <Badge className={`${getScoreColor(viralityData.viralityScore)}`}>
                {viralityData.viralityScore}%
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-3 w-3 text-green-600" />
                <span className="text-gray-600">Engagement:</span>
              </div>
              <Badge className={`${getEngagementColor(viralityData.engagementPrediction)}`}>
                {viralityData.engagementPrediction}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-orange-600" />
                <span className="text-gray-600">Optimal Day:</span>
              </div>
              <div className="font-medium text-gray-900">{viralityData.optimalDay}</div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              {content ? "Analyzing your content..." : "Enter content to analyze"}
            </p>
          </div>
        )}

        {content && !viralityData && !isAnalyzing && (
          <Button 
            onClick={analyzeContent}
            size="sm" 
            className="w-full"
            variant="outline"
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            Analyze Content
          </Button>
        )}
      </div>
    </Card>
  );
};
