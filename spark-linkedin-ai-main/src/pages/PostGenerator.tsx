import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Sparkles, Zap, TrendingUp, Heart, Check, Loader2, Save, Lightbulb, Crown, Lock, Share2, Download, ExternalLink } from "lucide-react";
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
  const [creativeSuggestions, setCreativeSuggestions] = useState([]);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [waitlistSource, setWaitlistSource] = useState("post-generator");
  
  // SIMPLIFIED: Just use sample personas directly, no complex creation logic
  const { personas, samplePersonas, isLoading: personasLoading } = usePersonas();
  const [selectedPersona, setSelectedPersona] = useState(null);
  
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { isGenerating, generatedContent, generatePost, copyToClipboard, saveContent } = useContentGeneration();
  const { subscription } = useSubscription();

  const handleUpgradeClick = (source: string) => {
    setWaitlistSource(source);
    setShowWaitlistModal(true);
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

  const generateCreativeSuggestions = (topic) => {
    // Generate creative format suggestions for LinkedIn posts
    const suggestions = [
      {
        type: "Carousel",
        title: "Carousel Post",
        description: `Break down "${topic}" into 5-7 engaging slides with key insights and visuals`,
        icon: "📊",
        tips: "Use Canva or Figma. Keep each slide focused on 1 main point. Add your logo for branding."
      },
      {
        type: "Video",
        title: "Short Video",
        description: `Record a 60-90 second authentic video sharing your perspective on "${topic}"`,
        icon: "🎥",
        tips: "Hook viewers in first 3 seconds. Be genuine and conversational. End with a clear CTA."
      },
      {
        type: "Document",
        title: "PDF Guide",
        description: `Create a valuable 2-3 page PDF guide or checklist about "${topic}"`,
        icon: "📄",
        tips: "Include actionable steps, visuals, and your contact info. Make it downloadable."
      }
    ];
    setCreativeSuggestions(suggestions);
  };

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

    if (!selectedPersona) {
      toast({
        title: "Persona required",
        description: "Please select a persona.",
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

    const result = await generatePost({
      topic,
      hookId: selectedHook._id,
      ...personaData
    });

    if (result.success) {
      console.log('✅ Post generated successfully!', result);
      // Content is now stored in generatedContent from the hook
      // Generate creative suggestions after successful post generation
      generateCreativeSuggestions(topic);
    } else {
      console.error('❌ Post generation failed:', result.error);
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
    <div className="min-h-screen bg-background">
      <SEO {...PAGE_SEO.postGenerator} />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
            Post{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Generator
            </span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">Create viral-worthy LinkedIn posts in seconds with AI-powered content generation</p>
        </div>

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
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border bg-muted">
                        <Lock className="h-3 w-3" /> Premium
                      </span>
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
                      Edit Personas
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
                      <p className="whitespace-pre-wrap text-sm">{formatForLinkedIn(generatedContent.content)}</p>
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
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={handleCopy}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={handleSave}
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={async () => {
                            const formattedText = formatForLinkedIn(generatedContent.content);
                            const blob = new Blob([formattedText], { type: 'text/plain' });
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `linkedin-post-${Date.now()}.txt`;
                            a.click();
                            window.URL.revokeObjectURL(url);
                            toast({ title: "Downloaded successfully!" });
                          }}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                      
                      {/* Share on LinkedIn Button */}
                      <Button 
                        size="sm" 
                        className="w-full bg-[#0077B5] hover:bg-[#006396] text-white"
                        onClick={async () => {
                          try {
                            // Step 1: Copy post to clipboard with LinkedIn formatting
                            const formattedPost = formatForLinkedIn(generatedContent.content);
                            await navigator.clipboard.writeText(formattedPost);
                            
                            // Step 2: Log analytics
                            try {
                              await apiClient.post('/content/share-log', {
                                contentId: generatedContent._id,
                                platform: 'linkedin'
                              });
                            } catch (e) {
                              // Silent fail for analytics
                              console.log('Analytics log failed:', e);
                            }
                            
                            // Step 3: Open LinkedIn's create post page
                            const linkedInPostUrl = 'https://www.linkedin.com/feed/?shareActive=true';
                            const popup = window.open(linkedInPostUrl, '_blank', 'width=800,height=700');
                            
                            if (!popup || popup.closed || typeof popup.closed === 'undefined') {
                              // Popup blocked
                              toast({
                                title: "✅ Post Copied!",
                                description: "Popup blocked. Post copied to clipboard - open LinkedIn and paste (Ctrl+V)",
                                variant: "default"
                              });
                            } else {
                              // Success
                              toast({
                                title: "✅ Post Copied & LinkedIn Opened!",
                                description: "Just paste (Ctrl+V or Cmd+V) in the LinkedIn post box and hit Post!"
                              });
                            }
                          } catch (error) {
                            console.error('Share error:', error);
                            // Fallback to manual copy
                            toast({
                              title: "Opening LinkedIn...",
                              description: "Copy the post above and paste it into LinkedIn",
                              variant: "default"
                            });
                            window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank');
                          }
                        }}
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Copy & Open LinkedIn
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        💡 Auto-copies your post → Opens LinkedIn → Just paste (Ctrl+V) and post!
                      </p>
                      <p className="text-xs text-muted-foreground text-center opacity-70">
                        Powered by LinkedInPulse
                      </p>
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

            {/* Creative Suggestions - World-Class Design */}
            {creativeSuggestions.length > 0 && (
              <Card className="shadow-xl border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-yellow-500 rounded-lg">
                      <Lightbulb className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Creative Format Suggestions
                      </h3>
                      <p className="text-sm text-gray-600">
                        Boost engagement with these LinkedIn formats
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {creativeSuggestions.map((suggestion, idx) => (
                      <div
                        key={idx}
                        className="group relative bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-yellow-400 hover:shadow-lg transition-all duration-300 cursor-pointer"
                      >
                        {/* Number Badge */}
                        <div className="absolute -top-3 -right-3 bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm shadow-lg group-hover:scale-110 transition-transform">
                          {idx + 1}
                        </div>
                        
                        {/* Header */}
                        <div className="mb-3">
                          <h4 className="font-bold text-lg text-gray-900 mb-1 flex items-center gap-2">
                            <span className="text-2xl">{suggestion.icon}</span>
                            {suggestion.title}
                          </h4>
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                            High Engagement Format
                          </p>
                        </div>
                        
                        {/* Description */}
                        <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                          {suggestion.description}
                        </p>
                        
                        {/* Quick Tip */}
                        <div className="flex items-start gap-2.5 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <span className="flex-shrink-0 text-lg">💡</span>
                          <div>
                            <p className="text-xs font-semibold text-yellow-900 mb-1">Pro Tip:</p>
                            <p className="text-xs text-gray-700 leading-relaxed">{suggestion.tips}</p>
                          </div>
                        </div>
                        
                        {/* Hover Effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-orange-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
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
    </div>
  );
};

export default PostGenerator;
