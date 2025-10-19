import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, Sparkles, Zap, TrendingUp, Heart, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../contexts/AuthContext";
import { useContentGeneration } from "../hooks/useContentGeneration";
import { usePersonas } from "../hooks/usePersonas";
import apiClient from "../services/api.js";
import { useNavigate } from "react-router-dom";

const hookIcons = {
  story: Heart,
  question: TrendingUp,
  statement: Zap,
  challenge: Sparkles,
  insight: TrendingUp,
};

const PostGenerator = () => {
  const [topic, setTopic] = useState("");
  const [selectedHook, setSelectedHook] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [hooks, setHooks] = useState([]);
  const [isLoadingHooks, setIsLoadingHooks] = useState(true);
  
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { personas, getDefaultPersona } = usePersonas();
  const { isGenerating, generatePost, copyToClipboard } = useContentGeneration();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    const fetchHooks = async () => {
      try {
        const response = await apiClient.getHooks();
        if (response.success) {
          setHooks(response.data.hooks);
        }
      } catch (error) {
        console.error('Failed to fetch hooks:', error);
        toast({
          title: "Failed to load hooks",
          description: "Using default hooks",
          variant: "destructive",
        });
        // Fallback to default hooks
        setHooks([
          { _id: 1, text: "I made a mistake that cost me...", category: "story" },
          { _id: 2, text: "Here's what nobody tells you about...", category: "insight" },
          { _id: 3, text: "3 years ago, I was...", category: "story" },
          { _id: 4, text: "Stop doing this immediately:", category: "challenge" },
        ]);
      } finally {
        setIsLoadingHooks(false);
      }
    };

    fetchHooks();
  }, [toast]);

  const handleGeneratePost = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic required",
        description: "Please enter what you want to post about",
        variant: "destructive",
      });
      return;
    }

    if (!selectedHook) {
      toast({
        title: "Hook required",
        description: "Please select a viral hook",
        variant: "destructive",
      });
      return;
    }

    const defaultPersona = getDefaultPersona();
    if (!defaultPersona) {
      toast({
        title: "No persona found",
        description: "Please create a persona first",
        variant: "destructive",
      });
      return;
    }

    const result = await generatePost({
      topic,
      hookId: selectedHook._id,
      personaId: defaultPersona._id,
    });

    if (result.success) {
      setTopic("");
      setSelectedHook(null);
    }
  };

  const handleCopy = async (text, index) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Post{" "}
            <span className="gradient-pulse bg-clip-text text-transparent">Generator</span>
          </h1>
          <p className="text-muted-foreground">Create viral-worthy LinkedIn posts in seconds</p>
        </div>

        <Card className="p-6 mb-6 gradient-card shadow-card">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">
                What do you want to post about?
              </label>
              <Textarea
                placeholder="E.g., My journey from junior developer to team lead, lessons from building my startup, productivity tips for remote workers..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3">
                Choose Your Viral Hook
              </label>
              {isLoadingHooks ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading hooks...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {hooks.slice(0, 4).map((hook) => {
                    const Icon = hookIcons[hook.category] || Zap;
                    return (
                      <button
                        key={hook._id}
                        onClick={() => setSelectedHook(hook)}
                        className={`p-4 rounded-xl border-2 transition-smooth text-left ${
                          selectedHook?._id === hook._id
                            ? "border-primary shadow-pulse gradient-pulse text-white"
                            : "border-border hover:border-primary/50 bg-background"
                        }`}
                      >
                        <Icon className="h-5 w-5 mb-2" />
                        <div className="text-sm font-medium">{hook.text}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-heartbeat" />
                Persona: {getDefaultPersona()?.name || 'Loading...'}
              </Badge>
            </div>

            <Button 
              size="lg" 
              className="w-full shadow-pulse hover-pulse"
              onClick={handleGeneratePost}
              disabled={isGenerating || !topic.trim() || !selectedHook}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Pulse Post
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Generated content will be shown here when available */}
      </div>
    </div>
  );
};

export default PostGenerator;
