import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, Copy, ArrowRight, Check, Zap, TrendingUp, Rocket, Crown, Lock, Download, Share2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import apiClient from "@/services/api.js";
import { EXPANDED_PERSONAS } from "@/constants/expandedPersonas";
import { formatForLinkedIn } from "@/utils/linkedinFormatting";

// Simplified persona options for landing page
const SIMPLE_PERSONA_OPTIONS = [
  { value: "founder", label: "Founder", icon: "🚀" },
  { value: "marketer", label: "Marketer", icon: "📢" },
  { value: "recruiter", label: "Recruiter", icon: "👔" },
  { value: "consultant", label: "Consultant", icon: "💼" },
  { value: "sales-pro", label: "Sales Pro", icon: "💰" },
  { value: "student", label: "Student", icon: "🎓" },
  { value: "creator", label: "Creator", icon: "✍️" },
];

// Goal options
const GOAL_OPTIONS = [
  { value: "grow-followers", label: "Grow Followers", icon: TrendingUp },
  { value: "boost-engagement", label: "Boost Engagement", icon: Zap },
  { value: "get-leads", label: "Get More Leads", icon: Rocket },
  { value: "build-brand", label: "Build Personal Brand", icon: Crown },
];

interface FreePostGeneratorProps {
  onGenerated?: (postData: any) => void;
}

export const FreePostGenerator = ({ onGenerated }: FreePostGeneratorProps) => {
  const [persona, setPersona] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("");
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<any>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if user already generated a free post (session-based)
  useEffect(() => {
    const freePostGenerated = sessionStorage.getItem("free_post_generated");
    if (freePostGenerated === "true") {
      const savedPost = sessionStorage.getItem("free_post_content");
      if (savedPost) {
        try {
          setGeneratedPost(JSON.parse(savedPost));
          setHasGenerated(true);
        } catch (e) {
          console.error("Failed to parse saved post", e);
        }
      }
    }
  }, []);

  const handleGenerate = async () => {
    if (!persona) {
      toast({
        title: "Persona required",
        description: "Please select who you are.",
        variant: "destructive",
      });
      return;
    }

    if (!topic.trim()) {
      toast({
        title: "Topic required",
        description: "Please tell us what you want to post about.",
        variant: "destructive",
      });
      return;
    }

    // Check if already generated (session-based)
    if (sessionStorage.getItem("free_post_generated") === "true") {
      toast({
        title: "Free post already used",
        description: "You've already generated your free post. Sign up to create unlimited posts!",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Map simple persona to full persona data
      const personaMap: Record<string, string> = {
        "founder": "startup-founder",
        "marketer": "digital-marketer",
        "recruiter": "hr-leader",
        "consultant": "consultant",
        "sales-pro": "sales-leader",
        "student": "job-seeker",
        "creator": "content-creator",
      };
      
      const personaId = personaMap[persona] || personaMap["founder"];
      const personaData = EXPANDED_PERSONAS.find(p => p.id === personaId) || EXPANDED_PERSONAS[0];

      // Use a default hook for free posts (no need to fetch, saves API call)
      const hook = {
        _id: "default_free_hook",
        text: "Here's what changed everything:",
        category: "story",
      };

      // Call free post generation endpoint (needs to be created on backend)
      // For now, we'll use a fallback approach
      let response;
      try {
        response = await apiClient.generatePostFree({
          topic: topic.trim(),
          hookId: hook._id,
          persona: personaData,
          audience: audience.trim() || undefined,
          goal: goal || undefined,
        });
      } catch (error) {
        // Fallback: Call the endpoint directly if method doesn't exist
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const fetchResponse = await fetch(`${apiUrl}/content/posts/generate-free`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic: topic.trim(),
            hookId: hook._id,
            persona: personaData,
            audience: audience.trim() || undefined,
            goal: goal || undefined,
          }),
        });
        
        if (!fetchResponse.ok) {
          const errorData = await fetchResponse.json().catch(() => ({}));
          if (fetchResponse.status === 404) {
            throw new Error("Backend endpoint not yet implemented. Please check BACKEND_ENDPOINT_NEEDED.md for setup instructions.");
          }
          throw new Error(errorData.message || `API error: ${fetchResponse.status}`);
        }
        
        response = await fetchResponse.json();
      }

      if (response.success || (response.data && response.data.content)) {
        const postContent = response.data?.content || response.content;
        
        const postData = {
          content: postContent?.content || postContent,
          topic: topic.trim(),
          persona: personaData,
          audience,
          goal,
          engagementScore: postContent?.engagementScore || null,
          _id: postContent?._id || `free_${Date.now()}`,
        };

        setGeneratedPost(postData);
        setHasGenerated(true);
        
        // Save to sessionStorage
        sessionStorage.setItem("free_post_generated", "true");
        sessionStorage.setItem("free_post_content", JSON.stringify(postData));
        sessionStorage.setItem("free_post_persona", JSON.stringify({ persona, audience, goal }));

        toast({
          title: "✨ Post generated!",
          description: "Your free post is ready. Sign up to create more!",
        });

        if (onGenerated) {
          onGenerated(postData);
        }
      } else {
        throw new Error(response.message || "Failed to generate post");
      }
    } catch (error: any) {
      console.error("Generation error:", error);
      toast({
        title: "Generation failed",
        description: error.message || "Could not generate post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (generatedPost?.content) {
      const formattedPost = formatForLinkedIn(generatedPost.content);
      await navigator.clipboard.writeText(formattedPost);
      toast({
        title: "Copied!",
        description: "Post copied to clipboard",
      });
    }
  };

  const handleSignup = () => {
    // Save persona data to pass to registration
    const personaData = {
      persona,
      audience,
      goal,
      topic: generatedPost?.topic || topic,
    };
    sessionStorage.setItem("registration_prefill", JSON.stringify(personaData));
    navigate("/auth/register");
  };

  if (hasGenerated && generatedPost) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="border-2 border-primary/20 shadow-2xl bg-gradient-to-br from-white to-primary/5 p-6 sm:p-8">
          <div className="space-y-6">
            {/* Success Header */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg mb-4 animate-in zoom-in duration-500">
                <Check className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Your Post is Ready! 🎉
              </h3>
              <p className="text-muted-foreground">Here's your viral-grade LinkedIn post</p>
            </div>

            {/* Generated Post */}
            <div className="space-y-4">
              <div className="relative">
                <Label className="text-sm font-semibold mb-2 block">Generated Post</Label>
                <div className="relative p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 min-h-[200px]">
                  <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                    {formatForLinkedIn(generatedPost.content)}
                  </p>
                  {/* Gradient overlay for premium look */}
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-background to-transparent pointer-events-none" />
                </div>
              </div>

              {generatedPost.engagementScore && (
                <div className="flex items-center justify-center gap-2 p-3 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">
                    Engagement Score: <Badge variant="default">{generatedPost.engagementScore}/100</Badge>
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  onClick={handleCopy}
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const formattedText = formatForLinkedIn(generatedPost.content);
                    const blob = new Blob([formattedText], { type: 'text/plain' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `linkedin-post-${Date.now()}.txt`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    toast({ title: "Downloaded successfully!" });
                  }}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    const formattedPost = formatForLinkedIn(generatedPost.content);
                    await navigator.clipboard.writeText(formattedPost);
                    toast({
                      title: "✅ Post Copied!",
                      description: "Opening LinkedIn... Paste with Ctrl+V (Cmd+V on Mac)",
                    });
                    setTimeout(() => {
                      window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank');
                    }, 1000);
                  }}
                  className="gap-2 bg-[#0077B5] hover:bg-[#006396] text-white"
                >
                  <Share2 className="h-4 w-4" />
                  Share on LinkedIn
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Signup CTA */}
            <Card className="bg-gradient-to-br from-primary/10 via-purple/10 to-pink/10 border-2 border-primary/30 p-6 sm:p-8">
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <h4 className="text-xl sm:text-2xl font-bold">
                    Love this post? ✨
                  </h4>
                  <p className="text-muted-foreground">
                    Sign up to create unlimited posts, save your style, unlock analytics, and more!
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    size="lg"
                    onClick={handleSignup}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg group gap-2"
                  >
                    Sign Up for Free
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate("/auth/login")}
                    className="gap-2"
                  >
                    Already have an account? Sign in
                  </Button>
                </div>
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
                  <span className="flex items-center gap-1">
                    <Check className="h-3 w-3 text-green-500" />
                    No credit card required
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="h-3 w-3 text-green-500" />
                    7-day free trial
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="h-3 w-3 text-green-500" />
                    Cancel anytime
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <Card className="w-full border border-border/50 shadow-xl bg-white dark:bg-card backdrop-blur-sm p-4 sm:p-5 lg:p-6 animate-fade-in-up">
      <div className="space-y-3 sm:space-y-4">
        {/* Compact Header */}
        <div className="space-y-1.5 text-center sm:text-left">
          <Badge className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] sm:text-xs bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200/50">
            <Sparkles className="w-2.5 h-2.5" />
            Try Free - No Signup Required
          </Badge>
          <h3 className="text-lg sm:text-xl font-bold text-foreground">
            Generate Your First{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Viral Post
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Tell us just enough to personalize your magic post. Get results in seconds.
          </p>
        </div>

        {/* Compact Form */}
        <div className="space-y-3 sm:space-y-3.5">
          {/* Persona Selection */}
          <div className="space-y-1.5">
            <Label htmlFor="persona" className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1">
              Who are you? <span className="text-red-500">*</span>
            </Label>
            <Select value={persona} onValueChange={setPersona}>
              <SelectTrigger className="h-9 sm:h-10 bg-white dark:bg-background border hover:border-primary/50 transition-colors text-xs sm:text-sm">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                {SIMPLE_PERSONA_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-2">
                      <span>{opt.icon}</span>
                      <span>{opt.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Audience (Optional) */}
          <div className="space-y-1.5">
            <Label htmlFor="audience" className="text-xs sm:text-sm font-semibold text-foreground">
              Who is your audience? <span className="text-muted-foreground text-[10px] font-normal">(optional)</span>
            </Label>
            <Input
              id="audience"
              placeholder='E.g., "SaaS buyers", "CXOs"...'
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="h-9 sm:h-10 bg-white dark:bg-background border text-xs sm:text-sm"
            />
          </div>

          {/* Goal (Optional) */}
          <div className="space-y-1.5">
            <Label htmlFor="goal" className="text-xs sm:text-sm font-semibold text-foreground">
              What is your main goal? <span className="text-muted-foreground text-[10px] font-normal">(optional)</span>
            </Label>
            <Select value={goal} onValueChange={setGoal}>
              <SelectTrigger className="h-9 sm:h-10 bg-white dark:bg-background border text-xs sm:text-sm">
                <SelectValue placeholder="Select your goal" />
              </SelectTrigger>
              <SelectContent>
                {GOAL_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{opt.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Topic */}
          <div className="space-y-1.5">
            <Label htmlFor="topic" className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1">
              What do you want to post about? <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="topic"
              placeholder="E.g., My journey from developer to tech lead..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="min-h-[70px] sm:min-h-[80px] resize-none bg-white dark:bg-background border text-xs sm:text-sm"
            />
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !persona || !topic.trim()}
            className="w-full h-10 sm:h-11 text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all group mt-1"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate My Post
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>

          <p className="text-center text-[10px] sm:text-xs text-muted-foreground leading-relaxed pt-0.5">
            ✨ <span className="font-semibold text-foreground">1 free post</span>.{" "}
            <button 
              onClick={handleSignup}
              className="text-primary hover:underline font-semibold"
            >
              Sign up
            </button>
            {" "}for unlimited posts & analytics.
          </p>
        </div>
      </div>
    </Card>
  );
};

