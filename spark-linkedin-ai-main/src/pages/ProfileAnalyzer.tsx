import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Copy, Check, UserCircle, Link as LinkIcon, RotateCcw, TrendingUp, CheckCircle2, ArrowRight, FileDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import apiClient from "@/services/api";
import { SEO } from "@/components/SEO";
import { PAGE_SEO } from "@/constants/seo";

interface AnalysisResult {
  // New format (from updated prompt)
  score?: number;
  headline_feedback?: {
    score: number;
    strengths: string[];
    improvements: string[];
    rewritten_example: string;
  };
  about_feedback?: {
    score: number;
    strengths: string[];
    improvements: string[];
    structure_suggestions: string[];
  };
  persona_alignment?: {
    score: number;
    feedback: string;
  };
  top_3_priorities?: string[];
  keywords?: string[];
  recommended_skills?: string[];
  optimized_about?: string;
  generated_post?: {
    content: string;
    hook_explanation: string;
    engagement_tactics: string[];
  };
  // Old format (backward compatibility)
  profile_score?: number;
  summary_points?: string[];
  headline_suggestions?: string[];
  about_section?: string;
  about_outline?: string;
  quick_wins?: string[];
  generated_post_intro?: string;
}

const ProfileAnalyzer = () => {
  const [profileUrl, setProfileUrl] = useState("");
  const [inputMode, setInputMode] = useState<"url" | "manual">("url");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [profileInfo, setProfileInfo] = useState({ name: "", headline: "" });

  // Form fields
  const [persona, setPersona] = useState("Job Seeker");
  const [headline, setHeadline] = useState("");
  const [about, setAbout] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [industry, setIndustry] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [goal, setGoal] = useState("");

  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Check for analysis result from home page
  useEffect(() => {
    const locationState = (window.history.state && window.history.state.usr) || {};
    console.log("🔍 Checking navigation state for analysis results...");
    console.log("Location state:", locationState);
    
    if (locationState.analysisResult) {
      console.log("✅ Found analysis result in navigation state");
      console.log("Analysis result keys:", Object.keys(locationState.analysisResult));
      console.log("Score:", locationState.analysisResult.score || locationState.analysisResult.profile_score);
      
      // Normalize the data structure
      const normalizedData: AnalysisResult = locationState.analysisResult;
      if (!normalizedData.score && normalizedData.profile_score !== undefined) {
        normalizedData.score = normalizedData.profile_score;
      }
      
      console.log("📊 Setting results with normalized data:", normalizedData);
      setResults(normalizedData);
      setProfileUrl(locationState.profileUrl || "");
    } else {
      console.log("⚠️ No analysis result found in navigation state");
    }
  }, []);

  // Redirect if not authenticated (only for dashboard access, not for home page analysis)
  useEffect(() => {
    // Allow access if coming from home page with results
    const locationState = (window.history.state && window.history.state.usr) || {};
    if (locationState.analysisResult) {
      return; // Don't redirect if we have analysis results
    }
    
    if (!authLoading && !isAuthenticated) {
      // Don't redirect - allow anonymous access for home page analysis
      // navigate('/auth/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Analyze profile from URL (no separate scraping step)
  const handleAnalyzeFromUrl = async () => {
    if (!profileUrl || !profileUrl.includes("linkedin.com/in/")) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid LinkedIn profile URL",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    toast({
      title: "Analyzing profile...",
      description: "This may take a few moments",
    });

    try {
      // Map persona to userType for backend
      const userTypeMap: Record<string, string> = {
        "Student": "Student",
        "Job Seeker": "Early Professional",
        "Entrepreneur": "Other",
        "Executive": "Senior Leader / Thought Leader",
      };

      console.log("🔍 Sending analysis request:", {
        profileUrl,
        userType: userTypeMap[persona] || persona,
        targetAudience,
        mainGoal: goal,
      });

      const response = await apiClient.analyzeProfileWithCoachTest(
        profileUrl,
        {
          userType: userTypeMap[persona] || persona,
          targetAudience: targetAudience || undefined,
          mainGoal: goal || undefined,
        }
      );

      console.log("✅ Analysis response received:", response);

      if (response.success && response.data) {
        console.log("📊 Response data keys:", Object.keys(response.data));
        
        // Backend returns analysis data directly
        const data = response.data;
        
        // Ensure 'score' field exists
        if (!data.score && data.profile_score !== undefined) {
          data.score = data.profile_score;
        }
        
        // Normalize to handle both formats
        const normalizedData: AnalysisResult = data.score !== undefined ? data : {
          score: data.profile_score || 0,
          headline_feedback: {
            score: 0,
            strengths: [],
            improvements: data.headline_suggestions?.map((h: string) => `Consider: ${h}`) || [],
            rewritten_example: data.headline_suggestions?.[0] || "",
          },
          about_feedback: {
            score: 0,
            strengths: [],
            improvements: [],
            structure_suggestions: data.about_outline ? [data.about_outline] : [],
          },
          persona_alignment: {
            score: 0,
            feedback: data.summary_points?.join(" ") || "",
          },
          top_3_priorities: data.quick_wins?.slice(0, 3) || [],
          generated_post: {
            content: data.generated_post || "",
            hook_explanation: data.generated_post_intro || "",
            engagement_tactics: [],
          },
        };
        
        console.log("📊 Normalized data for display:", normalizedData);
        console.log("📊 Score:", normalizedData.score);
        console.log("📊 Has headline_feedback:", !!normalizedData.headline_feedback);
        console.log("📊 Has about_feedback:", !!normalizedData.about_feedback);
        
        setResults(normalizedData);
        toast({
          title: "Analysis complete! ✅",
          description: "Your profile has been analyzed",
        });
      } else {
        throw new Error(response.error || response.message || "Analysis failed");
      }
    } catch (error: any) {
      console.error("❌ Analysis error:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      
      // Extract actual error message from backend
      let errorMessage = error.message || "Could not analyze profile. Please try again.";
      
      // Check if error object has additional error field (from backend)
      if ((error as any).error && typeof (error as any).error === 'string') {
        errorMessage = (error as any).error;
      }
      
      // Extract error from response if available
      if (error.response || (error as any).response) {
        const response = error.response || (error as any).response;
        if (response.data) {
          errorMessage = response.data.error || response.data.message || errorMessage;
        }
      }
      
      // If error contains backend error message, use it
      if (errorMessage.includes("Unable to complete profile analysis")) {
        // Try to extract the actual error from the message
        const errorMatch = errorMessage.match(/error: (.+)/i);
        if (errorMatch) {
          errorMessage = errorMatch[1];
        } else {
          errorMessage = "Profile analysis failed. Please ensure the LinkedIn profile URL is correct and the profile is public.";
        }
      }
      
      if (error.message?.includes("Rate limit") || error.message?.includes("429")) {
        toast({
          title: "Rate limit exceeded",
          description: "You've used your free analysis. Please upgrade for more!",
          variant: "destructive",
        });
      } else if (error.message?.includes("not found") || error.message?.includes("Invalid")) {
        toast({
          title: "Profile not found",
          description: "Please check that the LinkedIn profile URL is correct and the profile is public.",
          variant: "destructive",
        });
      } else if (error.message?.includes("Network error") || error.message?.includes("connect")) {
        toast({
          title: "Connection error",
          description: "Unable to connect to server. Please check your internet connection and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Analysis failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Analyze profile (manual input)
  const handleAnalyze = async () => {
    if (!headline || headline.length < 10) {
      toast({
        title: "Headline required",
        description: "Please enter a headline (at least 10 characters)",
        variant: "destructive",
      });
      return;
    }

    if (!about || about.length < 50) {
      toast({
        title: "About section required",
        description: "Please enter an about section (at least 50 characters)",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    toast({
      title: "Analyzing profile...",
      description: "This may take a few moments",
    });

    try {
      // Map persona to userType for backend
      const userTypeMap: Record<string, string> = {
        "Student": "Student",
        "Job Seeker": "Early Professional",
        "Entrepreneur": "Other",
        "Executive": "Senior Leader / Thought Leader",
      };

      // Use profile URL if available, otherwise use manual input
      const requestBody = profileUrl && inputMode === "url"
        ? {
            profileUrl,
            userType: userTypeMap[persona] || persona,
            targetAudience,
            mainGoal: goal,
          }
        : {
            // For manual input, we need to use a different approach
            // Since the backend expects profileUrl, we'll use a workaround
            profileUrl: "", // Empty URL means manual input
            headline,
            about,
            currentRole,
            industry,
            userType: userTypeMap[persona] || persona,
            targetAudience,
            mainGoal: goal,
          };

      // For manual input, we still need profileUrl, so we'll use a placeholder
      // The backend requires profileUrl, so manual input mode should use URL mode
      if (!profileUrl || !profileUrl.includes("linkedin.com/in/")) {
        toast({
          title: "URL required",
          description: "Please switch to URL mode and enter a LinkedIn profile URL, or use the manual fields to prepare your content first.",
          variant: "destructive",
        });
        setIsAnalyzing(false);
        return;
      }

      const response = await apiClient.analyzeProfileWithCoachTest(
        profileUrl,
        {
          userType: userTypeMap[persona] || persona,
          targetAudience: targetAudience || undefined,
          mainGoal: goal || undefined,
        }
      );

      if (response.success && response.data) {
        console.log("✅ Analysis response received:", response.data);
        console.log("📊 Response data keys:", Object.keys(response.data));
        console.log("📊 Usage info:", response.usage);
        
        // Backend returns data - normalize to handle both formats
        const data = response.data;
        
        // Ensure 'score' field exists
        if (!data.score && data.profile_score !== undefined) {
          data.score = data.profile_score;
        }
        
        // If old format, convert to new format for display
        const normalizedData: AnalysisResult = data.score !== undefined ? data : {
          score: data.profile_score || 0,
          headline_feedback: {
            score: 0,
            strengths: [],
            improvements: data.headline_suggestions?.map((h: string) => `Consider: ${h}`) || [],
            rewritten_example: data.headline_suggestions?.[0] || "",
          },
          about_feedback: {
            score: 0,
            strengths: [],
            improvements: [],
            structure_suggestions: data.about_outline ? [data.about_outline] : [],
          },
          persona_alignment: {
            score: 0,
            feedback: data.summary_points?.join(" ") || "",
          },
          top_3_priorities: data.quick_wins?.slice(0, 3) || [],
          generated_post: {
            content: data.generated_post || "",
            hook_explanation: data.generated_post_intro || "",
            engagement_tactics: [],
          },
        };
        
        console.log("📊 Normalized data for display:", normalizedData);
        console.log("📊 Score:", normalizedData.score);
        console.log("📊 Has headline_feedback:", !!normalizedData.headline_feedback);
        console.log("📊 Has about_feedback:", !!normalizedData.about_feedback);
        
        setResults(normalizedData);
        
        // Show usage info if available
        if (response.usage) {
          const { remaining, limit, plan, requiresAuth } = response.usage;
          if (remaining === 0 && requiresAuth) {
            toast({
              title: "Free analysis used! 🎉",
              description: "Sign up to get 1 more free analysis, then upgrade for more!",
              variant: "default",
            });
          } else if (remaining === 0) {
            toast({
              title: "Analysis limit reached",
              description: `You've used all ${limit} analyses. Upgrade your plan for more!`,
              variant: "default",
            });
          } else {
            toast({
              title: "Analysis complete! ✅",
              description: `You have ${remaining} analysis${remaining !== 1 ? 'es' : ''} remaining this month.`,
            });
          }
        } else {
          toast({
            title: "Analysis complete! ✅",
            description: "Your profile has been analyzed",
          });
        }
      } else {
        throw new Error(response.error || response.message || "Analysis failed");
      }
    } catch (error: any) {
      console.error("❌ Analysis error:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
        response: error.response,
      });
      
      // Check for rate limit error with redirect info
      const errorData = error.response?.data || error.data || {};
      const isRateLimit = error.status === 429 || 
                         error.message?.includes("rate limit") || 
                         error.message?.includes("limit reached") ||
                         errorData.error?.includes("limit") ||
                         errorData.code === "RATE_LIMIT_EXCEEDED";
      
      if (isRateLimit) {
        const redirectTo = errorData.redirectTo || (errorData.requiresAuth ? "/auth/register" : "/pricing");
        const message = errorData.message || "You've used your free analysis. Sign up for more analyses!";
        
        toast({
          title: "Analysis limit reached",
          description: message,
          variant: "default",
        });
        
        // Redirect after showing toast
        setTimeout(() => {
          navigate(redirectTo);
        }, 2000);
      } else {
        // Extract actual error message from backend
        let errorMessage = error.message || "Could not analyze profile. Please try again.";
        
        // If error contains backend error message, use it
        if (errorMessage.includes("Unable to complete profile analysis")) {
          // Try to extract the actual error from the message
          const errorMatch = errorMessage.match(/error: (.+)/i);
          if (errorMatch) {
            errorMessage = errorMatch[1];
          } else {
            errorMessage = "Profile analysis failed. Please ensure all required fields are filled correctly.";
          }
        }
        
        if (error.message?.includes("not found") || error.message?.includes("Invalid")) {
          toast({
            title: "Invalid input",
            description: "Please check that all required fields are filled correctly.",
            variant: "destructive",
          });
        } else if (error.message?.includes("Network error") || error.message?.includes("connect")) {
          toast({
            title: "Connection error",
            description: "Unable to connect to server. Please check your internet connection and try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Analysis failed",
            description: errorData.message || errorMessage,
            variant: "destructive",
          });
        }
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied! ✅",
      description: "Content copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = async () => {
    if (!results) return;
    
    setIsExportingPDF(true);
    try {
      const blob = await apiClient.exportAnalysisPDF(results, profileInfo);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `linkedin-profile-analysis-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "PDF exported! ✅",
        description: "Your analysis report has been downloaded",
      });
    } catch (error: any) {
      console.error("PDF export error:", error);
      toast({
        title: "Export failed",
        description: error.message || "Failed to export PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleGeneratePost = async () => {
    toast({
      title: "Feature coming soon",
      description: "Post generation will be available soon",
      variant: "default",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 dark:text-green-400";
    if (score >= 70) return "text-blue-600 dark:text-blue-400";
    if (score >= 50) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 70) return "bg-blue-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 sm:p-6 lg:p-8">
        <SEO {...PAGE_SEO.profileAnalyzer} />
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Profile Analysis Results
              </h1>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
                Your LinkedIn profile optimization insights
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleExportPDF}
                disabled={isExportingPDF}
              >
                {isExportingPDF ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <FileDown className="mr-2 h-4 w-4" />
                    Export PDF
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setResults(null)}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Analyze Another
              </Button>
            </div>
          </div>

          {/* Overall Score */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Overall Profile Score</CardTitle>
              <CardDescription>Your LinkedIn profile optimization score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-8 py-8">
                <div className="text-center">
                  <div className={`text-6xl font-bold mb-2 ${getScoreColor(results.score || results.profile_score || 0)}`}>
                    {results.score || results.profile_score || 0}
                  </div>
                  <div className="text-muted-foreground">Overall Score</div>
                </div>
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{results.score || results.profile_score || 0}%</span>
                  </div>
                  <div className="h-4 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${getScoreBgColor(results.score || results.profile_score || 0)}`}
                      style={{ width: `${results.score || results.profile_score || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Feedback */}
          {results.headline_feedback || results.headline_suggestions ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Headline Feedback */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Headline</CardTitle>
                    {results.headline_feedback && (
                      <Badge variant={results.headline_feedback.score >= 70 ? "default" : "secondary"}>
                        {results.headline_feedback.score}/100
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {results.headline_feedback?.strengths && results.headline_feedback.strengths.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-green-600 dark:text-green-400">Strengths</h4>
                      <ul className="space-y-1">
                        {results.headline_feedback.strengths.map((strength, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                        {results.headline_feedback ? "Improvements" : "Suggestions"}
                      </h4>
                      {(results.headline_feedback?.improvements || results.headline_suggestions || []).length > 0 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-xs"
                          onClick={() => {
                            const items = results.headline_feedback?.improvements || results.headline_suggestions || [];
                            copyToClipboard(items.map((item, i) => `${i + 1}. ${item}`).join('\n'));
                          }}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy All
                        </Button>
                      )}
                    </div>
                    <ul className="space-y-1">
                      {(results.headline_feedback?.improvements || results.headline_suggestions || []).map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm group">
                          <ArrowRight className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                          <span className="flex-1">{item}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => copyToClipboard(item)}
                          >
                            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {(results.headline_feedback?.rewritten_example || results.headline_suggestions?.[0]) && (
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="text-sm font-semibold mb-2">Suggested Rewrite</h4>
                      <p className="text-sm text-muted-foreground italic">
                        {results.headline_feedback?.rewritten_example || results.headline_suggestions?.[0]}
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="mt-2"
                        onClick={() => copyToClipboard(results.headline_feedback?.rewritten_example || results.headline_suggestions?.[0] || "")}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        Copy
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* About Feedback */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">About Section</CardTitle>
                    {results.about_feedback && (
                      <Badge variant={results.about_feedback.score >= 70 ? "default" : "secondary"}>
                        {results.about_feedback.score}/100
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {results.about_feedback?.strengths && results.about_feedback.strengths.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-green-600 dark:text-green-400">Strengths</h4>
                      <ul className="space-y-1">
                        {results.about_feedback.strengths.map((strength, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {results.about_feedback?.improvements && results.about_feedback.improvements.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-amber-600 dark:text-amber-400">Improvements</h4>
                      <ul className="space-y-1">
                        {results.about_feedback.improvements.map((improvement, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <ArrowRight className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {results.about_feedback?.structure_suggestions && results.about_feedback.structure_suggestions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Structure Suggestions</h4>
                      <ul className="space-y-1">
                        {results.about_feedback.structure_suggestions.map((suggestion, i) => (
                          <li key={i} className="text-sm text-muted-foreground">
                            • {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {results.about_section && (
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="text-sm font-semibold mb-2">Suggested About Section</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{results.about_section}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="mt-2"
                        onClick={() => copyToClipboard(results.about_section || "")}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        Copy
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : null}

          {/* Summary Points (Old Format) */}
          {results.summary_points && results.summary_points.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {results.summary_points.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Persona Alignment */}
          {results.persona_alignment && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Persona Alignment</CardTitle>
                  <Badge variant={results.persona_alignment.score >= 70 ? "default" : "secondary"}>
                    {results.persona_alignment.score}/100
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{results.persona_alignment.feedback}</p>
              </CardContent>
            </Card>
          )}

          {/* Top 3 Priorities */}
          {(results.top_3_priorities || results.quick_wins) && (
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle>Top Priorities</CardTitle>
                <CardDescription>Focus on these improvements first</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {(results.top_3_priorities || results.quick_wins?.slice(0, 3) || []).map((priority, i) => (
                    <li key={i} className="flex gap-3">
                      <Badge variant="default" className="h-6 w-6 rounded-full p-0 flex items-center justify-center">
                        {i + 1}
                      </Badge>
                      <span className="flex-1 text-sm">{priority}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}

          {/* Keywords */}
          {results.keywords && results.keywords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recommended Keywords</CardTitle>
                <CardDescription>Add these keywords to improve searchability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {results.keywords.map((keyword, i) => (
                    <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => copyToClipboard(keyword)}>
                      {keyword}
                    </Badge>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => copyToClipboard(results.keywords.join(", "))}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy All Keywords
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Recommended Skills */}
          {results.recommended_skills && results.recommended_skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recommended Skills</CardTitle>
                <CardDescription>Add these skills to your LinkedIn profile</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {results.recommended_skills.map((skill, i) => (
                    <Badge key={i} variant="outline" className="cursor-pointer" onClick={() => copyToClipboard(skill)}>
                      {skill}
                    </Badge>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => copyToClipboard(results.recommended_skills.join(", "))}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy All Skills
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Optimized About Section */}
          {results.optimized_about && (
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle>Optimized About Section</CardTitle>
                <CardDescription>Copy-paste ready About section for your LinkedIn profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(results.optimized_about)}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <p className="text-sm whitespace-pre-line pr-12">
                    {results.optimized_about}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {results.optimized_about.length} characters (LinkedIn limit: 2600)
                </p>
              </CardContent>
            </Card>
          )}

          {/* Generate Post Button - Show if post doesn't exist */}
          {!results.generated_post && (
            <Card>
              <CardHeader>
                <CardTitle>Generate LinkedIn Post</CardTitle>
                <CardDescription>Create a tailored LinkedIn post based on your profile analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleGeneratePost}
                  disabled={isAnalyzing}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Generate Post
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Generated Post - Only show if exists */}
          {(results.generated_post?.content || results.generated_post) && (
            <Card>
              <CardHeader>
                <CardTitle>Generated LinkedIn Post</CardTitle>
                <CardDescription>Ready-to-publish post tailored to your profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(
                      typeof results.generated_post === 'string' 
                        ? results.generated_post 
                        : results.generated_post?.content || ""
                    )}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <p className="text-sm whitespace-pre-line pr-12">
                    {typeof results.generated_post === 'string' 
                      ? results.generated_post 
                      : results.generated_post?.content || ""}
                  </p>
                </div>
                {results.generated_post && typeof results.generated_post === 'object' && (
                  <>
                    {results.generated_post.hook_explanation && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Why this hook works:</h4>
                        <p className="text-sm text-muted-foreground">{results.generated_post.hook_explanation}</p>
                      </div>
                    )}
                    {results.generated_post.engagement_tactics && results.generated_post.engagement_tactics.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Engagement Tactics:</h4>
                        <ul className="space-y-1">
                          {results.generated_post.engagement_tactics.map((tactic, i) => (
                            <li key={i} className="text-sm text-muted-foreground">
                              • {tactic}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
                {results.generated_post_intro && (
                  <p className="text-sm text-muted-foreground italic">{results.generated_post_intro}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 sm:p-6 lg:p-8">
      <SEO {...PAGE_SEO.profileAnalyzer} />
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            LinkedIn Profile Analyzer
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
            Get AI-powered insights to optimize your LinkedIn profile and boost your visibility
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Analyze Your Profile</CardTitle>
            <CardDescription>
              Enter your LinkedIn profile URL or fill in the details manually
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Input Mode Toggle */}
            <div className="p-4 bg-muted rounded-lg space-y-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={inputMode === "url" ? "default" : "outline"}
                  onClick={() => setInputMode("url")}
                  className="flex-1"
                >
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Analyze from URL
                </Button>
                <Button
                  type="button"
                  variant={inputMode === "manual" ? "default" : "outline"}
                  onClick={() => setInputMode("manual")}
                  className="flex-1"
                >
                  Manual Input
                </Button>
              </div>

              {inputMode === "url" && (
                <div className="space-y-2">
                  <label htmlFor="profileUrl" className="text-sm font-medium">
                    LinkedIn Profile URL
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="profileUrl"
                      placeholder="https://www.linkedin.com/in/username"
                      value={profileUrl}
                      onChange={(e) => setProfileUrl(e.target.value)}
                      disabled={isAnalyzing}
                    />
                    <Button
                      type="button"
                      onClick={handleAnalyzeFromUrl}
                      disabled={isAnalyzing || !profileUrl}
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Analyze
                        </>
                      )}
                    </Button>
                  </div>
              <p className="text-xs text-muted-foreground">
                Enter a LinkedIn profile URL to analyze your profile
              </p>
                </div>
              )}
            </div>

            {/* Form Fields - Only show in Manual Input mode */}
            {inputMode === "manual" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="persona" className="text-sm font-medium">
                    Persona <span className="text-destructive">*</span>
                  </label>
                  <Select value={persona} onValueChange={setPersona}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Student">Student</SelectItem>
                      <SelectItem value="Job Seeker">Job Seeker</SelectItem>
                      <SelectItem value="Entrepreneur">Entrepreneur</SelectItem>
                      <SelectItem value="Executive">Executive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="headline" className="text-sm font-medium">
                    Headline <span className="text-destructive">*</span>
                    <span className="text-muted-foreground ml-2">({headline.length}/220 characters)</span>
                  </label>
                  <Input
                    id="headline"
                    placeholder="e.g., Software Engineer | Building scalable web applications"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    maxLength={220}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="about" className="text-sm font-medium">
                    About Section <span className="text-destructive">*</span>
                    <span className="text-muted-foreground ml-2">({about.length}/2600 characters)</span>
                  </label>
                  <Textarea
                    id="about"
                    placeholder="Tell us about yourself, your experience, and what you're looking for..."
                    rows={8}
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    maxLength={2600}
                  />
                </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="currentRole" className="text-sm font-medium">
                    Current Role (Optional)
                  </label>
                  <Input
                    id="currentRole"
                    placeholder="e.g., Senior Software Engineer"
                    value={currentRole}
                    onChange={(e) => setCurrentRole(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="industry" className="text-sm font-medium">
                    Industry (Optional)
                  </label>
                  <Input
                    id="industry"
                    placeholder="e.g., Technology"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="targetAudience" className="text-sm font-medium">
                    Target Audience (Optional)
                  </label>
                  <Input
                    id="targetAudience"
                    placeholder="e.g., Tech recruiters, Startup founders"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="goal" className="text-sm font-medium">
                    Goal (Optional)
                  </label>
                  <Input
                    id="goal"
                    placeholder="e.g., Get hired, Build credibility"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                  />
                </div>
              </div>

              <Button
                onClick={handleAnalyze}
                className="w-full"
                disabled={isAnalyzing || !headline || !about}
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Analyze Profile
                  </>
                )}
              </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileAnalyzer;

