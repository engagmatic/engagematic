import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Sparkles, Zap, TrendingUp, Heart, Check, Loader2, Save, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../contexts/AuthContext";
import { useContentGeneration } from "../hooks/useContentGeneration";
import { usePersonas } from "../hooks/usePersonas";
import { useLinkedInProfile } from "../hooks/useLinkedInProfile";
import apiClient from "../services/api.js";
import { useNavigate } from "react-router-dom";
import { Navigation } from "../components/Navigation";
import { SEO, pageSEO } from "@/components/SEO";

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
  const [topic, setTopic] = useState("");
  const [selectedHook, setSelectedHook] = useState(null);
  const [hooks, setHooks] = useState(DEFAULT_HOOKS);
  const [isLoadingHooks, setIsLoadingHooks] = useState(false);
  const [creativeSuggestions, setCreativeSuggestions] = useState([]);
  
  // SIMPLIFIED: Just use sample personas directly, no complex creation logic
  const { personas, samplePersonas, isLoading: personasLoading } = usePersonas();
  const [selectedPersona, setSelectedPersona] = useState(null);

  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { isGenerating, generatedContent, generatePost, copyToClipboard, saveContent } = useContentGeneration();
  const { profileData, analyzeProfile, isAnalyzing } = useLinkedInProfile();

  // Use user's personas first, fall back to samples only if no user personas
  useEffect(() => {
    if (selectedPersona) return; // Already have a persona

    // Prioritize user's personas
    if (personas.length > 0) {
      setSelectedPersona(personas[0]);
      console.log('✅ User persona selected:', personas[0].name);
    } else if (samplePersonas.length > 0) {
      setSelectedPersona(samplePersonas[0]);
      console.log('✅ Sample persona selected:', samplePersonas[0].name);
    }
  }, [personas, samplePersonas, selectedPersona]);

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
        title: "Create a Carousel Post",
        description: `Break down ${topic} into 5-7 slides with key points, statistics, or steps`,
        icon: "📊",
        tips: "Use Canva or PowerPoint. Each slide should have one main point with visuals."
      },
      {
        type: "Video",
        title: "Record a Video",
        description: `Share your personal experience with ${topic} in a 2-3 minute video`,
        icon: "🎥",
        tips: "Use LinkedIn's native video feature. Start with a hook, share your story, end with a call-to-action."
      },
      {
        type: "Image Series",
        title: "Post Image Series",
        description: `Create 3-4 related images showing different aspects of ${topic}`,
        icon: "🖼️",
        tips: "Use consistent branding. Each image should tell part of the story. Post them as separate posts or carousel."
      },
      {
        type: "PDF Document",
        title: "Share a PDF Guide",
        description: `Create a comprehensive guide about ${topic} and share as a PDF attachment`,
        icon: "📄",
        tips: "Keep it 2-3 pages max. Include actionable steps, infographics, or checklists."
      },
      {
        type: "Poll",
        title: "Create a Poll",
        description: `Ask your network about their experience with ${topic} using LinkedIn's poll feature`,
        icon: "📊",
        tips: "Make it engaging and relevant. Use the results to create follow-up content."
      },
      {
        type: "Document Share",
        title: "Share a Document",
        description: `Upload a presentation, checklist, or template related to ${topic}`,
        icon: "📋",
        tips: "Make it downloadable and valuable. Include your branding and contact info."
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
      ...personaData,
      // Add LinkedIn profile insights if available
      linkedinInsights: profileData ? {
        industry: profileData.industry,
        experienceLevel: profileData.experienceLevel,
        contentStrategy: profileData.contentStrategy,
        hashtagSuggestions: profileData.hashtagSuggestions,
        optimalPostingTimes: profileData.optimalPostingTimes
      } : null
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
      await copyToClipboard(generatedContent.content);
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
      <SEO {...pageSEO.postGenerator} />
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Post{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Generator
            </span>
          </h1>
          <p className="text-muted-foreground">Create viral-worthy LinkedIn posts in seconds with AI-powered content generation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Input */}
          <div className="lg:col-span-2 space-y-6">
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

            {/* Hook Selection */}
            <Card className="shadow-lg border-2">
              <div className="p-6">
                <label className="text-sm font-semibold flex items-center gap-2 mb-4">
                  Choose Your Viral Hook *
                  {isLoadingHooks && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                </label>

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

            {/* LinkedIn Profile Analysis */}
            {!profileData && (
              <Card className="shadow-lg border-blue-200 bg-blue-50">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    Enhance Your Content with LinkedIn Insights
                  </h3>
                  <p className="text-sm text-blue-700 mb-4">
                    Connect your LinkedIn profile to get personalized content recommendations, optimal posting times, and industry-specific hashtags.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="flex-1 px-3 py-2 border border-blue-300 rounded-md text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const url = (e.target as HTMLInputElement).value;
                          if (url.trim()) analyzeProfile(url);
                        }
                      }}
                    />
                    <Button
                      onClick={() => {
                        const input = document.querySelector('input[type="url"]') as HTMLInputElement;
                        if (input?.value.trim()) {
                          analyzeProfile(input.value);
                        }
                      }}
                      disabled={isAnalyzing}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isAnalyzing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* LinkedIn Insights Display */}
            {profileData && (
              <Card className="shadow-lg border-green-200 bg-green-50">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    LinkedIn Profile Connected
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Industry:</strong> {profileData.industry}
                    </div>
                    <div>
                      <strong>Experience Level:</strong> {profileData.experienceLevel}
                    </div>
                    <div>
                      <strong>Content Focus:</strong> {profileData.contentStrategy?.focus}
                    </div>
                    <div>
                      <strong>Optimal Times:</strong> {profileData.optimalPostingTimes?.bestTimes?.join(', ')}
                    </div>
                  </div>
                  <p className="text-xs text-green-600 mt-2">
                    ✨ Your content will be optimized based on these insights
                  </p>
                </div>
              </Card>
            )}

            {/* Persona Selection - SIMPLIFIED */}
            <Card className="shadow-lg">
              <div className="p-6">
                <label className="block text-sm font-semibold mb-3">
                  Choose Your Persona *
                </label>
                <Select 
                  value={selectedPersona?.name || selectedPersona?._id} 
                  onValueChange={(value) => {
                    // Find persona from either user personas or samples
                    const allPersonas = [...personas, ...samplePersonas];
                    const found = allPersonas.find(p => p.name === value || p._id === value);
                    if (found) setSelectedPersona(found);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a persona" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Show user personas first */}
                    {personas.length > 0 && (
                      <>
                        {personas.map((persona) => (
                          <SelectItem key={persona._id} value={persona._id}>
                            {persona.name} {persona.industry && `- ${persona.industry}`}
                          </SelectItem>
                        ))}
                      </>
                    )}
                    {/* Then show sample personas if no user personas */}
                    {personas.length === 0 && samplePersonas.length > 0 && (
                      <>
                        {samplePersonas.map((persona, idx) => (
                          <SelectItem key={`sample-${idx}`} value={persona.name}>
                            {persona.name} {persona.industry && `- ${persona.industry}`} (Sample)
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
                {selectedPersona && (
                  <div className="mt-3 p-3 bg-muted rounded-md text-sm">
                    <div><strong>Tone:</strong> {selectedPersona.tone}</div>
                    {selectedPersona.expertise && (
                      <div><strong>Expertise:</strong> {Array.isArray(selectedPersona.expertise) ? selectedPersona.expertise.join(', ') : selectedPersona.expertise}</div>
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
          <div className="lg:col-span-1">
            <Card className="shadow-lg sticky top-4">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Generated Post</h3>
                {generatedContent ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg max-h-96 overflow-y-auto">
                      <p className="whitespace-pre-wrap text-sm">{generatedContent.content}</p>
                    </div>
                    
                    {generatedContent.engagementScore && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Engagement Score:</span>
                        <Badge variant="default">{generatedContent.engagementScore}/100</Badge>
                      </div>
                    )}

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

            {/* Creative Suggestions - stabilized responsive grid */}
            {creativeSuggestions.length > 0 && (
              <Card className="shadow-lg mt-6">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Creative Format Suggestions
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    💡 Boost engagement with these LinkedIn post formats
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {creativeSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg border bg-card hover:bg-muted transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-2xl leading-none">{suggestion.icon}</div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold mb-1 truncate">{suggestion.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-3">
                              {suggestion.description}
                            </p>
                            <div className="bg-muted p-2 rounded text-xs">
                              <strong>Pro tip:</strong> {suggestion.tips}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostGenerator;
