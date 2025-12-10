import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Loader2,
  Link as LinkIcon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/services/api";

export const ProfileAnalyzerSection = () => {
  const [profileUrl, setProfileUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!profileUrl || !profileUrl.includes("linkedin.com/in/")) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid LinkedIn profile URL",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      console.log("🔍 Calling profile analyzer API...");
      const response = await apiClient.request("/profile-coach/test", {
        method: "POST",
        body: JSON.stringify({
          profileUrl,
        }),
      });
      console.log("✅ Profile analyzer response:", response);

      if (response.success && response.data) {
        // Navigate to profile analyzer page with results
        navigate("/profile-analyzer", { 
          state: { 
            analysisResult: response.data,
            profileUrl 
          } 
        });
      } else {
        throw new Error(response.error || "Analysis failed");
      }
    } catch (error: any) {
      console.error("Analysis error:", error);
      
      // If rate limited, suggest signup
      if (error.message?.includes("rate limit") || error.message?.includes("429")) {
        toast({
          title: "Free analysis used",
          description: "Sign up for more analyses!",
          variant: "default",
        });
        setTimeout(() => navigate("/auth/register"), 2000);
      } else {
        toast({
          title: "Analysis failed",
          description: error.message || "Please try again",
          variant: "destructive",
        });
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <section id="profile-analyzer" className="py-16 sm:py-20 md:py-24 lg:py-28 relative overflow-hidden bg-white dark:bg-slate-900">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 opacity-50" />
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(0,0,0,0.05)_1px,_transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.05)_1px,_transparent_0)] [background-size:24px_24px]" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
              <Sparkles className="h-4 w-4" />
              <span>Free Profile Analysis</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
              Optimize Your LinkedIn Profile
              <span className="block mt-2 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                In Seconds, Not Hours
              </span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Stop getting overlooked. Get instant feedback on what's hurting your visibility and exactly how to fix it.
            </p>
          </div>

          {/* Main CTA Card */}
          <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-white to-primary/5 dark:from-slate-900 dark:to-primary/10 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-purple-500/10" />
            
            <div className="relative p-6 sm:p-8 lg:p-10">
              <div className="space-y-6">
                {/* Input Section */}
                <div className="space-y-4">
                  <label htmlFor="profile-url" className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                    LinkedIn Profile URL
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="profile-url"
                        type="url"
                        placeholder="https://www.linkedin.com/in/your-profile"
                        value={profileUrl}
                        onChange={(e) => setProfileUrl(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !isAnalyzing && handleAnalyze()}
                        className="pl-10 h-12 text-base"
                        disabled={isAnalyzing}
                      />
                    </div>
                    <Button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing || !profileUrl}
                      size="lg"
                      className="h-12 px-6 sm:px-8 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="mr-2 h-5 w-5" />
                          Analyze Free
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center sm:text-left">
                    No signup required • 1 free analysis
                  </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-slate-700">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-50 mb-1">
                        Instant Analysis
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Get scores and feedback in seconds
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-50 mb-1">
                        Copy-Paste Ready
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Optimized content you can use immediately
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-pink-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-50 mb-1">
                        Actionable Insights
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Keywords, skills, and priorities included
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* CTA for signed-in users */}
          {isAuthenticated && (
            <div className="mt-8 text-center">
              <Button
                variant="outline"
                onClick={() => navigate("/profile-analyzer")}
                className="gap-2"
              >
                View Full Analyzer
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

