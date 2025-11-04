import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Sparkles, Zap, TrendingUp, Heart, Check, Loader2, Save, Lightbulb, Crown, Lock, Share2, ExternalLink, Minimize2, ArrowRight, Scissors, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../contexts/AuthContext";
import { useContentGeneration } from "../hooks/useContentGeneration";
import { usePersonas } from "../hooks/usePersonas";
import apiClient from "../services/api.js";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate, useLocation } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PAGE_SEO } from "@/constants/seo";
import { EXPANDED_PERSONAS, PERSONA_CATEGORIES } from "@/constants/expandedPersonas";
import { formatForLinkedIn } from "@/utils/linkedinFormatting";
import { LinkedInOptimizer } from "@/components/LinkedInOptimizer";
import { PremiumWaitlistModal } from "@/components/PremiumWaitlistModal";
import { UpgradePopup } from "@/components/UpgradePopup";
import { TestimonialPopup } from "@/components/TestimonialPopup";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const hookIcons = {
  story: Heart,
  question: TrendingUp,
  statement: Zap,
  challenge: Sparkles,
  insight: TrendingUp,
};

// Default hooks with MongoDB ObjectId format (fallback only, will use API hooks)
const DEFAULT_HOOKS = [
  { _id: '507f1f77bcf86cd799439011', text: "Here's what changed everything:", category: "story" },
  { _id: '507f1f77bcf86cd799439012', text: "The secret nobody talks about:", category: "insight" },
  { _id: '507f1f77bcf86cd799439013', text: "I used to think that...", category: "story" },
  { _id: '507f1f77bcf86cd799439014', text: "What if I told you that...", category: "question" },
  { _id: '507f1f77bcf86cd799439015', text: "Why most people fail at...", category: "challenge" },
  { _id: '507f1f77bcf86cd799439016', text: "The biggest lesson I learned this year:", category: "insight" },
  { _id: '507f1f77bcf86cd799439017', text: "Stop doing this immediately:", category: "challenge" },
  { _id: '507f1f77bcf86cd799439018', text: "3 years ago, I was...", category: "story" },
  { _id: '507f1f77bcf86cd799439019', text: "Here's what nobody tells you about...", category: "insight" },
  { _id: '507f1f77bcf86cd79943901a', text: "I made a mistake that cost me...", category: "story" }
];

const PostGenerator = () => {
  const location = useLocation();
  const [topic, setTopic] = useState("");
  const [selectedHook, setSelectedHook] = useState(null);
  const [hooks, setHooks] = useState(DEFAULT_HOOKS);
  const [isLoadingHooks, setIsLoadingHooks] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [waitlistSource, setWaitlistSource] = useState("post-generator");
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [showTestimonialPopup, setShowTestimonialPopup] = useState(false);
  const testimonialTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isShortened, setIsShortened] = useState(false);
  const [shortenedContent, setShortenedContent] = useState("");
  
  // SIMPLIFIED: Just use sample personas directly, no complex creation logic
  const { personas, samplePersonas, isLoading: personasLoading } = usePersonas();
  const [selectedPersona, setSelectedPersona] = useState(null);
  
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { isGenerating, generatedContent, generatePost, generatePostCustom, copyToClipboard, saveContent } = useContentGeneration();
  const { subscription, canPerformAction, fetchSubscription } = useSubscription();

  // Reset shortened state when new content is generated
  useEffect(() => {
    if (generatedContent) {
      setIsShortened(false);
      setShortenedContent("");
    }
  }, [generatedContent]);

  // Intelligent content shortening function
  const shortenContent = (content: string): string => {
    if (!content) return content;
    
    const originalLength = content.length;
    const targetLength = Math.floor(originalLength * 0.4); // 60% reduction (40% of original)
    
    // Split into sentences
    const sentences = content.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
    
    if (sentences.length <= 2) {
      // If already short, just trim words
      const words = content.split(/\s+/);
      const targetWords = Math.floor(words.length * 0.5);
      return words.slice(0, targetWords).join(' ') + (words.length > targetWords ? '...' : '');
    }
    
    // Keep first sentence (hook/opening)
    let shortened = sentences[0];
    
    // Keep key sentences (those with important words, questions, or numbers)
    const importantSentences = sentences.slice(1).filter(s => {
      const lower = s.toLowerCase();
      return /[?!]/.test(s) || // Questions or exclamations
             /\d+/.test(s) || // Numbers
             /(because|why|how|what|when|where|key|important|essential|critical)/i.test(lower);
    });
    
    // Add 1-2 important sentences
    if (importantSentences.length > 0) {
      shortened += ' ' + importantSentences.slice(0, 2).join(' ');
    }
    
    // Add last sentence if it's a call to action or conclusion
    const lastSentence = sentences[sentences.length - 1];
    if (/[?!]/.test(lastSentence) || /(share|comment|thought|idea|experience|let|think)/i.test(lastSentence.toLowerCase())) {
      if (!shortened.includes(lastSentence)) {
        shortened += ' ' + lastSentence;
      }
    }
    
    // If still too long, trim to target length
    if (shortened.length > targetLength) {
      const words = shortened.split(/\s+/);
      const targetWords = Math.floor(words.length * 0.7);
      shortened = words.slice(0, targetWords).join(' ') + '...';
    }
    
    return shortened.trim();
  };

  const handleShorten = () => {
    if (!generatedContent?.content) return;
    
    const shortened = shortenContent(generatedContent.content);
    setShortenedContent(shortened);
    setIsShortened(true);
    
    toast({
      title: "✨ Content Shortened!",
      description: "Post optimized for busy feeds - crisp and engaging",
    });
  };

  const handleRestore = () => {
    setIsShortened(false);
    setShortenedContent("");
  };

      const handleUpgradeClick = (source: string) => {
        // Redirect to pricing section for premium features
        if (window.location.pathname === '/') {
          const pricingSection = document.getElementById('pricing');
          pricingSection?.scrollIntoView({ behavior: 'smooth' });
        } else {
          navigate('/#pricing');
        }
    toast({
      title: "Upgrade Required",
      description: "This feature is available in our premium plans. Choose a plan to continue.",
    });
  };

  // Handle pre-filled content from Idea Generator
  useEffect(() => {
    if (location.state?.prefilledTopic) {
      setTopic(location.state.prefilledTopic);
      
      // Show toast about selected idea
      if (location.state?.ideaContext) {
        toast({
          title: "Idea loaded! 💡",
          description: `Ready to generate: ${location.state.ideaContext.title}`,
        });
      }
      
      // Clear the state to prevent re-triggering
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate, toast]);

  // Cleanup testimonial timeout on unmount
  useEffect(() => {
    return () => {
      if (testimonialTimeoutRef.current) {
        clearTimeout(testimonialTimeoutRef.current);
      }
    };
  }, []);

  // Use user's personas first, fall back to expanded personas
  useEffect(() => {
    if (selectedPersona) return; // Already have a persona

    // Prioritize user's personas
    if (personas.length > 0) {
      setSelectedPersona(personas[0]);
      console.log('✅ User persona selected:', personas[0].name);
    } else if (EXPANDED_PERSONAS.length > 0) {
      setSelectedPersona(EXPANDED_PERSONAS[0]);
      console.log('✅ Expanded persona selected:', EXPANDED_PERSONAS[0].name);
    }
  }, [personas, selectedPersona]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch hooks from API once on mount
  useEffect(() => {
    let isMounted = true; // Cleanup flag
    
    const fetchHooks = async () => {
      try {
        setIsLoadingHooks(true);
        const response = await apiClient.getHooks();
        
        if (!isMounted) return; // Prevent state update if unmounted
        
        if (response.success && response.data.hooks.length > 0) {
          console.log('✅ Fetched hooks from API:', response.data.hooks.length);
          setHooks(response.data.hooks);
          // Auto-select first hook for better UX (only if no hook selected)
          setSelectedHook(response.data.hooks[0]);
        } else {
          console.warn('⚠️ No hooks returned from API, using defaults');
          setSelectedHook(DEFAULT_HOOKS[0]); // Auto-select first default hook
        }
      } catch (error) {
        console.error('❌ Failed to fetch hooks:', error);
        // Keep using default hooks
        if (isMounted) {
          console.log('Using fallback default hooks');
          setSelectedHook(DEFAULT_HOOKS[0]); // Auto-select first default hook
        }
      } finally {
        if (isMounted) {
        setIsLoadingHooks(false);
        }
      }
    };

    fetchHooks();
    
    return () => {
      isMounted = false; // Cleanup on unmount
    };
  }, []); // Empty dependency array - run once on mount

  // Creative suggestions removed - replaced with formatting preferences and persona customization

  const handleGeneratePost = async () => {
    // Validation
    if (!topic.trim()) {
      toast({
        title: "Topic required",
        description: "Please enter what you want to post about.",
        variant: "destructive",
      });
      return;
    }
    
    if (topic.trim().length < 10) {
      toast({
        title: "Topic too short",
        description: "Please provide at least 10 characters for your topic.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedHook) {
      toast({
        title: "Hook required",
        description: "Please select a viral hook for your post.",
        variant: "destructive",
      });
      return;
    }

    // Validate hook ID exists
    if (!selectedHook._id) {
      toast({
        title: "Invalid Hook",
        description: "The selected hook is invalid. Please select another hook.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedPersona) {
      toast({
        title: "Persona required",
        description: "Please select a persona.",
        variant: "destructive",
      });
      return;
    }

    // Check quota before generating
    const quotaCheck = await canPerformAction("generate_post");
    if (!quotaCheck.allowed) {
      setShowUpgradePopup(true);
      toast({
        title: "Limit Reached",
        description: quotaCheck.reason || "You've reached your post limit. Upgrade to continue!",
        variant: "destructive",
      });
      return;
    }

    // SIMPLIFIED: Send persona data directly if it's a sample (no _id)
    const personaData = selectedPersona._id 
      ? { personaId: selectedPersona._id } // Real persona with ID
      : { persona: selectedPersona }; // Sample persona, send full data

    console.log('🚀 Generating post with data:', {
      topic,
      hookId: selectedHook._id,
      ...personaData,
      hook: selectedHook,
      selectedPersona
    });

    // Check if user is pro and using a trending hook
    const isProUser = subscription?.plan === 'pro';
    const isTrendingHook = selectedHook._id && selectedHook._id.toString().startsWith('trending_');
    
    let result;
    
    try {
      // Use custom API for pro users with trending hooks
      if (isProUser && isTrendingHook) {
        const postData: any = {
          topic,
          title: selectedHook.text || selectedHook.title,
          category: selectedHook.category || 'story',
          ...personaData
        };
        
        console.log('🔥 Using custom API for pro user with trending hook:', postData);
        result = await generatePostCustom(postData);
      } else {
        // Use standard API for regular hooks
        // Ensure hookId is a valid string
        const hookId = selectedHook._id?.toString() || selectedHook._id;
        
        if (!hookId) {
          throw new Error("Hook ID is required");
        }
        
        const postData: any = {
          topic: topic.trim(),
          hookId: hookId,
          ...personaData
        };
        
        // If it's a trending hook (but not pro), include the hook text
        if (isTrendingHook) {
          postData.hookText = selectedHook.text || selectedHook.title;
        }
        
        console.log('📤 Sending post generation request:', { ...postData, persona: '...' });
        result = await generatePost(postData);
      }
    } catch (error: any) {
      console.error('❌ Post generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate post. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (result.success) {
      console.log('✅ Post generated successfully!', result);
      // Content is now stored in generatedContent from the hook
      // Generate creative suggestions after successful post generation
      generateCreativeSuggestions(topic);
      
      // Refresh subscription to get updated usage
      await fetchSubscription();
      
      // Check if this is the first post generation
      const isFirstPost = !localStorage.getItem('first_post_generated');
      if (isFirstPost) {
        // Store that first post has been generated
        localStorage.setItem('first_post_generated', 'true');
        
        // Show testimonial popup after 5 seconds
        testimonialTimeoutRef.current = setTimeout(() => {
          // Only show if not already submitted
          if (!localStorage.getItem('testimonial_submitted_post')) {
            setShowTestimonialPopup(true);
          }
        }, 5000);
      }
    } else {
      console.error('❌ Post generation failed:', result.error);
      
      // Check if error is due to quota exceeded
      if (result.error?.includes('limit') || result.error?.includes('quota') || result.error?.includes('exceeded')) {
        setShowUpgradePopup(true);
      }
    }
  };

  const handleCopy = async () => {
    if (generatedContent) {
      const formattedPost = formatForLinkedIn(generatedContent.content);
      await copyToClipboard(formattedPost);
    }
  };

  const handleSave = async () => {
    if (generatedContent) {
      await saveContent(generatedContent._id);
    }
  };

  if (authLoading || personasLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // REMOVED: Complex persona creation screen - we now use samples directly

  return (
    <div className="w-full bg-gray-50 dark:bg-slate-950 min-h-screen">
      <SEO {...PAGE_SEO.postGenerator} />
      
      {/* Page Header */}
      <header className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 hidden lg:block">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-50">
            Post{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Generator
            </span>
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Create viral-worthy LinkedIn posts in seconds with AI-powered content generation
          </p>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-11 gap-6">
          {/* Left Column - Input */}
          <div className="lg:col-span-6 space-y-6">
            {/* Topic Input */}
            <Card className="shadow-lg">
              <div className="p-6">
              <label className="block text-sm font-semibold mb-2">
                  What do you want to post about? *
              </label>
              <Textarea
                  placeholder="E.g., My journey from junior developer to tech lead, lessons from building my startup, productivity tips for remote workers..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                  className="min-h-[120px] resize-none"
              />
            </div>
            </Card>

            {/* Hook Selection with Premium Trending Generator */}
            <Card className="shadow-lg border-2">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    Choose Your Viral Hook *
                    {isLoadingHooks && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
              </label>
                  <div className="flex items-center gap-2">
                    {subscription?.plan === 'trial' && (
                      <button
                        type="button"
                        onClick={() => handleUpgradeClick('premium-badge')}
                        className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border bg-muted hover:bg-muted/80 transition cursor-pointer"
                      >
                        <Lock className="h-3 w-3" /> Premium
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={async () => {
                        if (subscription?.plan === 'trial') {
                          handleUpgradeClick('trending-hooks');
                          return;
                        }
                        try {
                          setIsLoadingHooks(true);
                          const res = await apiClient.getTrendingHooks({ 
                            topic: topic || 'professional content',
                            industry: selectedPersona?.name || 'general'
                          });
                          if (res.success && res.data.hooks.length > 0) {
                            setHooks(res.data.hooks);
                            setSelectedHook(res.data.hooks[0]);
                            toast({ 
                              title: 'Trending hooks generated! ✨', 
                              description: `Generated ${res.data.hooks.length} fresh hooks using AI`
                            });
                          } else {
                            toast({ title: 'No trending hooks available', description: 'Please try again later', variant: 'destructive' });
                          }
                        } catch (e) {
                          console.error(e);
                          toast({ title: 'Failed to generate trending hooks', variant: 'destructive' });
                        } finally {
                          setIsLoadingHooks(false);
                        }
                      }}
                      className="inline-flex items-center gap-2 text-xs px-3 py-2 rounded-md border bg-card hover:bg-muted transition"
                    >
                      <Crown className="h-3 w-3 text-yellow-500" />
                      Generate Trending Hooks
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {hooks.slice(0, 10).map((hook) => {
                    const Icon = hookIcons[hook.category] || Sparkles;
                    return (
                      <button
                        key={hook._id}
                        onClick={() => setSelectedHook(hook)}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          selectedHook?._id === hook._id
                            ? "border-primary bg-primary/10 shadow-md"
                            : "border-border hover:border-primary/50 bg-card"
                        }`}
                      >
                        <Icon className="h-4 w-4 mb-2 text-primary" />
                        <div className="text-sm font-medium">{hook.text}</div>
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {hook.category}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>


            {/* Persona Selection - Enhanced with onboarding persona */}
            <Card className="shadow-lg border-2">
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    Choose Your Persona *
                    {personas.length > 0 && personas[0]?.source === 'onboarding' && (
                      <Badge variant="default" className="text-xs">Your Persona</Badge>
                    )}
                  </label>
                  {subscription?.plan === 'trial' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpgradeClick('custom-personas')}
                      className="gap-2 text-xs"
                    >
                      <Crown className="h-3 w-3" />
                      Edit Personas (Premium)
                    </Button>
                  )}
                </div>
                <Select 
                  value={selectedPersona?.name || selectedPersona?._id || selectedPersona?.id} 
                  onValueChange={(value) => {
                    // Find persona from either user personas or expanded personas
                    const allPersonas = [...personas, ...EXPANDED_PERSONAS];
                    const found = allPersonas.find(p => p.name === value || p._id === value || p.id === value);
                    if (found) setSelectedPersona(found);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a persona">
                      {selectedPersona && (
                        <span>
                          {selectedPersona.name}
                          {selectedPersona.industry && ` - ${selectedPersona.industry}`}
                          {selectedPersona.source === 'onboarding' && ' ✨'}
                        </span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-[400px]">
                    {/* Show user personas first (including onboarding persona) */}
                    {personas.length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          Your Personas
                        </div>
                        {personas.map((persona) => (
                          <SelectItem key={persona._id} value={persona._id}>
                            {persona.name} {persona.industry && `- ${persona.industry}`}
                            {persona.source === 'onboarding' && ' ✨'}
                          </SelectItem>
                        ))}
                      </>
                    )}
                    {/* Show expanded personas organized by category */}
                    {PERSONA_CATEGORIES.map((category) => {
                      const categoryPersonas = EXPANDED_PERSONAS.filter(p => p.category === category);
                      if (categoryPersonas.length === 0) return null;
                      return (
                        <div key={category}>
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-1">
                            {category}
                          </div>
                          {categoryPersonas.map((persona) => (
                            <SelectItem key={persona.id} value={persona.id}>
                              {persona.icon} {persona.name}
                            </SelectItem>
                          ))}
                        </div>
                      );
                    })}
                  </SelectContent>
                </Select>
                {selectedPersona && (
                  <div className="mt-3 p-4 bg-gradient-to-r from-primary/5 to-purple/5 border border-primary/20 rounded-lg text-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-primary">Active Persona:</strong>
                      <span className="font-medium">{selectedPersona.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <strong>Tone:</strong>
                      <span>{selectedPersona.tone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <strong>Style:</strong>
                      <span>{selectedPersona.writingStyle}</span>
                    </div>
                    {selectedPersona.expertise && (
                      <div className="pt-2 border-t border-primary/10">
                        <strong>Expertise:</strong>
                        <p className="text-muted-foreground mt-1 line-clamp-2">
                          {Array.isArray(selectedPersona.expertise) ? selectedPersona.expertise.join(', ') : selectedPersona.expertise}
                        </p>
                      </div>
                    )}
                    {selectedPersona.source === 'onboarding' && (
                      <div className="pt-2 flex items-center gap-1 text-xs text-primary">
                        <Sparkles className="h-3 w-3" />
                        <span>Using your personalized onboarding persona</span>
                      </div>
                    )}
                  </div>
                )}
            </div>
            </Card>

            {/* Generate Button */}
            <Button 
              size="lg" 
              className="w-full shadow-lg"
              onClick={handleGeneratePost}
              disabled={isGenerating || !topic.trim() || !selectedHook || !selectedPersona}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Your Pulse Post...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Pulse Post
                </>
              )}
            </Button>
          </div>

          {/* Right Column - Generated Content */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="shadow-lg">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Generated Post</h3>
                {generatedContent ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg max-h-96 overflow-y-auto">
                      <p className="whitespace-pre-wrap text-sm">
                        {isShortened && shortenedContent 
                          ? formatForLinkedIn(shortenedContent)
                          : formatForLinkedIn(generatedContent.content)}
                      </p>
                    </div>
                    
                    {generatedContent.engagementScore && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Engagement Score:</span>
                        <Badge variant="default">{generatedContent.engagementScore}/100</Badge>
                      </div>
                    )}

                    {/* LinkedIn Optimizer */}
                    <LinkedInOptimizer 
                      content={generatedContent.content}
                      topic={topic}
                      audience={selectedPersona?.name}
                      compact={true}
                    />

                    <div className="space-y-2">
                      {/* Regenerate Button */}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={handleGeneratePost}
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Regenerating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Regenerate Post
                          </>
                        )}
                      </Button>
                      
                      <div className="flex flex-col sm:flex-row gap-2">
                        {/* Shorten Content Button - Premium Styling */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant={isShortened ? "outline" : "default"}
                                size="sm" 
                                className={`flex-1 sm:flex-initial ${
                                  !isShortened 
                                    ? "bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all" 
                                    : ""
                                }`}
                                onClick={isShortened ? handleRestore : handleShorten}
                              >
                                {isShortened ? (
                                  <>
                                    <RotateCcw className="mr-2 h-4 w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Restore</span>
                                    <span className="sm:hidden">Restore</span>
                                  </>
                                ) : (
                                  <>
                                    <Scissors className="mr-2 h-4 w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Shorten</span>
                                    <span className="sm:hidden">Shorten</span>
                                  </>
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{isShortened ? "Restore original content" : "Make it crisp—perfect for busy feeds!"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={async () => {
                            const contentToCopy = isShortened && shortenedContent 
                              ? shortenedContent 
                              : generatedContent.content;
                            const formattedContent = formatForLinkedIn(contentToCopy);
                            await copyToClipboard(formattedContent);
                          }}
                        >
                          <Copy className="mr-2 h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Copy</span>
                          <span className="sm:hidden">Copy</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={async () => {
                            // Save the original generated content (by ID)
                            if (generatedContent._id) {
                              await saveContent(generatedContent._id);
                            } else {
                              toast({
                                title: "Cannot save",
                                description: "Content must be generated first",
                                variant: "destructive"
                              });
                            }
                          }}
                        >
                          <Save className="mr-2 h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Save</span>
                          <span className="sm:hidden">Save</span>
                        </Button>
                      </div>
                      
                      {/* Share on LinkedIn Button */}
                      <Button 
                        size="sm" 
                        className="w-full bg-[#0077B5] hover:bg-[#006396] text-white shadow-lg hover:shadow-xl transition-all"
                        onClick={async () => {
                          try {
                            // Step 1: Copy post to clipboard with LinkedIn formatting
                            const contentToShare = isShortened && shortenedContent 
                              ? shortenedContent 
                              : generatedContent.content;
                            const formattedPost = formatForLinkedIn(contentToShare);
                            await navigator.clipboard.writeText(formattedPost);
                            
                            // Step 2: Show success message
                            toast({
                              title: "✅ Post Copied to Clipboard!",
                              description: "Opening LinkedIn... Click the text area and press Ctrl+V (Cmd+V on Mac) to paste!",
                            });
                            
                            // Step 3: Log analytics
                            try {
                              await apiClient.post('/content/share-log', {
                                contentId: generatedContent._id,
                                platform: 'linkedin'
                              });
                            } catch (e) {
                              // Silent fail for analytics
                              console.log('Analytics log failed:', e);
                            }
                            
                            // Step 4: Wait 1 second before opening LinkedIn so toast is visible
                            setTimeout(() => {
                              // Open LinkedIn's create post page
                              const linkedInPostUrl = 'https://www.linkedin.com/feed/?shareActive=true';
                              const linkedInWindow = window.open(linkedInPostUrl, '_blank', 'width=1200,height=800');
                              
                              if (!linkedInWindow || linkedInWindow.closed || typeof linkedInWindow.closed === 'undefined') {
                                // Popup blocked
                                toast({
                                  title: "⚠️ Popup Blocked",
                                  description: "Please allow popups for this site, or copy the post manually from above.",
                                  variant: "destructive"
                                });
                              }
                            }, 1000);
                          } catch (error) {
                            console.error('Share error:', error);
                            // Fallback to manual copy
                            toast({
                              title: "Error",
                              description: "Could not copy to clipboard. Please copy the post manually.",
                              variant: "destructive"
                            });
                            window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank');
                          }
                        }}
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Publish with LinkedIn</span>
                        <span className="sm:hidden">Publish</span>
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </Button>
                      
                      {/* Premium Steps Guide */}
                      <div className="bg-gradient-to-r from-blue-50/50 via-purple-50/50 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 rounded-lg p-3 sm:p-4 border border-blue-100/50 dark:border-blue-900/50">
                        <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">1</div>
                            <span className="text-muted-foreground font-medium hidden sm:inline">Click</span>
                          </div>
                          <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold">2</div>
                            <span className="text-muted-foreground font-medium hidden sm:inline">Paste</span>
                            <span className="text-muted-foreground font-medium sm:hidden">Ctrl+V</span>
                          </div>
                          <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-pink-600 text-white flex items-center justify-center text-[10px] font-bold">3</div>
                            <span className="text-muted-foreground font-medium">Publish</span>
                          </div>
                        </div>
                        <p className="text-center text-[10px] sm:text-xs text-muted-foreground mt-2 opacity-70">
                          Powered by LinkedInPulse
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Your generated post will appear here</p>
                  </div>
                )}
          </div>
        </Card>
          </div>
        </div>
      </div>
      </div>

      {/* Premium Waitlist Modal */}
      <PremiumWaitlistModal
        isOpen={showWaitlistModal}
        onClose={() => setShowWaitlistModal(false)}
        source={waitlistSource}
        planInterest="Pro Plan"
      />

      {/* Upgrade Popup */}
      <UpgradePopup
        open={showUpgradePopup}
        onOpenChange={setShowUpgradePopup}
        limitType="posts"
      />
      
      {/* Testimonial Popup */}
      <TestimonialPopup
        open={showTestimonialPopup}
        onOpenChange={setShowTestimonialPopup}
        contentType="post"
      />
    </div>
  );
};

export default PostGenerator;
