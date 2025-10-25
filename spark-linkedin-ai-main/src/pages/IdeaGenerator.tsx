import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lightbulb, Sparkles, ArrowRight, Loader2, TrendingUp, MessageSquare, List, Laugh, BookOpen, Eye, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PremiumWaitlistModal } from "@/components/PremiumWaitlistModal";
import { useSubscription } from "@/hooks/useSubscription";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Content angles with icons
const CONTENT_ANGLES = [
  { value: "all", label: "Mixed Angles (Recommended)", icon: Zap, description: "Variety of approaches for maximum engagement" },
  { value: "storytelling", label: "Storytelling", icon: BookOpen, description: "Narrative-driven with clear story arcs" },
  { value: "question", label: "Question", icon: MessageSquare, description: "Thought-provoking questions that spark debate" },
  { value: "listicle", label: "Listicle", icon: List, description: "Actionable list-based content" },
  { value: "how-to", label: "How-To", icon: TrendingUp, description: "Educational step-by-step frameworks" },
  { value: "observation", label: "Observation", icon: Eye, description: "Insights from patterns others miss" },
  { value: "humor", label: "Humor", icon: Laugh, description: "Relatable, professional humor with value" },
];

const TONES = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "witty", label: "Witty" },
  { value: "inspirational", label: "Inspirational" },
];

const AUDIENCES = [
  { value: "general", label: "General Audience" },
  { value: "founders", label: "Founders & Entrepreneurs" },
  { value: "hr", label: "HR Professionals" },
  { value: "developers", label: "Developers & Engineers" },
  { value: "marketers", label: "Marketers" },
  { value: "job_seekers", label: "Job Seekers" },
];

interface PostIdea {
  id: string;
  title: string;
  hook: string;
  angle: string;
  framework: string[];
  whyItWorks: string;
  developmentNotes: string;
  engagementPotential: "Low" | "Medium" | "High" | "Very High";
  bestFor: string;
}

const IdeaGenerator = () => {
  const [topic, setTopic] = useState("");
  const [selectedAngle, setSelectedAngle] = useState("all");
  const [tone, setTone] = useState("professional");
  const [targetAudience, setTargetAudience] = useState("general");
  const [isGenerating, setIsGenerating] = useState(false);
  const [ideas, setIdeas] = useState<PostIdea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<PostIdea | null>(null);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);

  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { subscription } = useSubscription();
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleGenerateIdeas = async () => {
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

    setIsGenerating(true);
    setIdeas([]);
    setSelectedIdea(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/content/generate-ideas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          topic: topic.trim(),
          angle: selectedAngle,
          tone,
          targetAudience,
        }),
      });

      const result = await response.json();

      if (result.success && result.data.ideas) {
        setIdeas(result.data.ideas);
        toast({
          title: "Ideas generated! 💡",
          description: `${result.data.ideas.length} post ideas ready for you`,
        });
      } else {
        throw new Error(result.message || 'Failed to generate ideas');
      }
    } catch (error) {
      console.error('Idea generation error:', error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate ideas. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectIdea = (idea: PostIdea) => {
    setSelectedIdea(idea);
    // Navigate to Post Generator with pre-filled topic and hook
    navigate('/post-generator', {
      state: {
        prefilledTopic: `${idea.hook}\n\n${idea.framework.join('\n')}`,
        ideaContext: idea
      }
    });
  };

  const getEngagementColor = (level: string) => {
    switch (level) {
      case "Very High": return "bg-green-500";
      case "High": return "bg-blue-500";
      case "Medium": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  if (authLoading) {
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

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="LinkedIn Post Idea Generator | LinkedInPulse"
        description="Generate viral-worthy LinkedIn post ideas with AI. Get specific, actionable content angles ready to develop into full posts."
        keywords="linkedin ideas, content ideas, post ideas, linkedin content strategy"
      />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
            Post{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Idea Generator
            </span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Discover compelling content angles and concepts ready to develop into full posts
          </p>
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
                  placeholder="E.g., AI in recruitment, remote work challenges, personal branding for developers, startup lessons..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  💡 Be specific for better ideas. Instead of "productivity", try "productivity hacks for remote workers"
                </p>
              </div>
            </Card>

            {/* Content Angle Selection */}
            <Card className="shadow-lg">
              <div className="p-6">
                <label className="block text-sm font-semibold mb-3">
                  Content Angle *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {CONTENT_ANGLES.map((angle) => {
                    const Icon = angle.icon;
                    return (
                      <button
                        key={angle.value}
                        onClick={() => setSelectedAngle(angle.value)}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          selectedAngle === angle.value
                            ? "border-primary bg-primary/10 shadow-md"
                            : "border-border hover:border-primary/50 bg-card"
                        }`}
                      >
                        <Icon className="h-5 w-5 mb-2 text-primary" />
                        <div className="text-sm font-medium mb-1">{angle.label}</div>
                        <div className="text-xs text-muted-foreground">{angle.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* Tone & Audience */}
            <Card className="shadow-lg">
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tone */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Tone
                    </label>
                    <Select value={tone} onValueChange={setTone}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TONES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Target Audience */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Target Audience
                    </label>
                    <Select value={targetAudience} onValueChange={setTargetAudience}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AUDIENCES.map((a) => (
                          <SelectItem key={a.value} value={a.value}>
                            {a.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </Card>

            {/* Generate Button */}
            <Button 
              size="lg" 
              className="w-full shadow-lg"
              onClick={handleGenerateIdeas}
              disabled={isGenerating || !topic.trim()}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Ideas...
                </>
              ) : (
                <>
                  <Lightbulb className="mr-2 h-5 w-5" />
                  Generate Post Ideas
                </>
              )}
            </Button>
          </div>

          {/* Right Column - Generated Ideas */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg sticky top-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Generated Ideas
                </h3>
                {ideas.length === 0 && !isGenerating && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Your post ideas will appear here</p>
                    <p className="text-xs mt-2">Fill in the topic and click Generate</p>
                  </div>
                )}

                {isGenerating && (
                  <div className="text-center py-12">
                    <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Generating creative ideas...</p>
                  </div>
                )}

                {ideas.length > 0 && (
                  <div className="text-sm text-muted-foreground mb-4">
                    {ideas.length} ideas generated • Select one to develop into a full post
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Ideas Grid - Full Width Below */}
        {ideas.length > 0 && (
          <div className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ideas.map((idea, index) => (
                <Card 
                  key={idea.id} 
                  className="shadow-lg hover:shadow-xl transition-all border-2 hover:border-primary cursor-pointer group"
                  onClick={() => handleSelectIdea(idea)}
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl font-bold text-primary">#{index + 1}</span>
                          <Badge variant="outline" className="text-xs">
                            {idea.angle}
                          </Badge>
                        </div>
                        <h4 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                          {idea.title}
                        </h4>
                      </div>
                    </div>

                    {/* Hook */}
                    <div className="mb-4 p-3 bg-muted rounded-lg">
                      <div className="text-xs font-semibold text-muted-foreground mb-1">OPENING HOOK:</div>
                      <p className="text-sm font-medium italic">{idea.hook}</p>
                    </div>

                    {/* Framework */}
                    <div className="mb-4">
                      <div className="text-xs font-semibold text-muted-foreground mb-2">CONTENT FRAMEWORK:</div>
                      <ul className="space-y-1">
                        {idea.framework.slice(0, 3).map((point, idx) => (
                          <li key={idx} className="text-xs flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span className="flex-1 line-clamp-1">{point}</span>
                          </li>
                        ))}
                        {idea.framework.length > 3 && (
                          <li className="text-xs text-muted-foreground">
                            +{idea.framework.length - 3} more points...
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Why It Works */}
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-xs font-semibold text-blue-900 mb-1">💡 WHY THIS WORKS:</div>
                      <p className="text-xs text-blue-700 line-clamp-2">{idea.whyItWorks}</p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getEngagementColor(idea.engagementPotential)}`} />
                        <span className="text-xs font-medium">{idea.engagementPotential} Engagement</span>
                      </div>
                      <Button size="sm" variant="ghost" className="gap-2 group-hover:bg-primary group-hover:text-white transition-all">
                        Select
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Best For */}
                    <div className="mt-3 pt-3 border-t">
                      <div className="text-xs text-muted-foreground">
                        <span className="font-semibold">Best for:</span> {idea.bestFor}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Helper Text */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Ready to develop an idea?</strong> Click on any card to go to Post Generator with your selected idea
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Premium Waitlist Modal */}
      <PremiumWaitlistModal
        isOpen={showWaitlistModal}
        onClose={() => setShowWaitlistModal(false)}
        source="idea-generator"
        planInterest="Pro Plan"
      />
    </div>
  );
};

export default IdeaGenerator;

