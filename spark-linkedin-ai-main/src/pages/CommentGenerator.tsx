import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Heart, Loader2, Sparkles, MessageCircle, ExternalLink, TrendingUp, Star, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { usePersonas } from "@/hooks/usePersonas";
import { useContentGeneration } from "@/hooks/useContentGeneration";
import { useNavigate } from "react-router-dom";
import apiClient from "@/services/api";
import { Navigation } from "@/components/Navigation";

const CommentGenerator = () => {
  const [postContent, setPostContent] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [generatedComments, setGeneratedComments] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isFetchingFromUrl, setIsFetchingFromUrl] = useState(false);
  const [creativeSuggestions, setCreativeSuggestions] = useState([]);
  
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { personas, samplePersonas, isLoading: personasLoading } = usePersonas();
  const { isGenerating, generateComment, copyToClipboard } = useContentGeneration();
  const navigate = useNavigate();

  // Use user's personas first, fall back to samples only if no user personas
  useEffect(() => {
    if (selectedPersona) return; // Already have a persona

    // Prioritize user's personas
    if (personas.length > 0) {
      setSelectedPersona(personas[0]);
      console.log('✅ User persona selected for comments:', personas[0].name);
    } else if (samplePersonas.length > 0) {
      setSelectedPersona(samplePersonas[0]);
      console.log('✅ Sample persona selected for comments:', samplePersonas[0].name);
    }
  }, [personas, samplePersonas, selectedPersona]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleFetchFromLinkedIn = async () => {
    if (!linkedinUrl.trim()) {
      toast({
        title: "LinkedIn URL required",
        description: "Please enter a LinkedIn post URL.",
        variant: "destructive",
      });
      return;
    }

    setIsFetchingFromUrl(true);
    try {
      const response = await apiClient.fetchLinkedInContent(linkedinUrl.trim());
      
      if (response.success) {
        setPostContent(response.data.content);
        toast({
          title: "Content fetched! 📄",
          description: "LinkedIn post content loaded successfully",
        });
      } else {
        toast({
          title: "Fetch failed",
          description: response.message || "Could not fetch content from LinkedIn URL.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to fetch from LinkedIn:', error);
      toast({
        title: "Fetch failed",
        description: "Could not fetch content from LinkedIn URL.",
        variant: "destructive",
      });
    } finally {
      setIsFetchingFromUrl(false);
    }
  };

  const handleGenerateComments = async () => {
    if (!postContent.trim()) {
      toast({
        title: "Post content required",
        description: "Please paste the LinkedIn post you want to comment on.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedPersona) {
      toast({
        title: "Persona required",
        description: "Please select a persona to generate personalized comments.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await generateComment({
        postContent: postContent.trim(),
        persona: selectedPersona
      });

      if (result.success) {
        setGeneratedComments(result.data.comments || []);
        
        // Generate creative engagement suggestions
        generateCreativeSuggestions(postContent.trim());
        
        toast({
          title: "Comments generated! 💬",
          description: "AI-powered comments ready for your engagement",
        });
      } else {
        toast({
          title: "Generation failed",
          description: "Could not generate comments. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to generate comments:', error);
      toast({
        title: "Generation failed",
        description: "Could not generate comments. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateCreativeSuggestions = (content) => {
    // Generate creative engagement suggestions for comments
    const suggestions = [
      {
        type: "Follow-up Post",
        title: "Create a Follow-up Post",
        description: "Turn your comment into a full LinkedIn post with more details",
        icon: "📝",
        tips: "Expand on your comment with personal stories, data, or examples. Tag the original author."
      },
      {
        type: "Video Response",
        title: "Record a Video Response",
        description: "Create a short video elaborating on your comment",
        icon: "🎥",
        tips: "Keep it 60-90 seconds. Share your screen or record yourself speaking."
      },
      {
        type: "Resource Share",
        title: "Share a Resource",
        description: "Comment with a helpful article, tool, or template",
        icon: "📚",
        tips: "Make sure it's relevant and valuable. Add a brief explanation of why it's useful."
      },
      {
        type: "Question Thread",
        title: "Start a Discussion",
        description: "Ask a thought-provoking question to continue the conversation",
        icon: "❓",
        tips: "Make it open-ended and relevant to the original post. Encourage others to share."
      },
      {
        type: "Personal Story",
        title: "Share Your Experience",
        description: "Add a personal anecdote that relates to the post",
        icon: "👤",
        tips: "Keep it authentic and relevant. Show vulnerability and relatability."
      },
      {
        type: "Data Point",
        title: "Add Statistics",
        description: "Share relevant data or research that supports the discussion",
        icon: "📊",
        tips: "Cite your sources. Make sure the data is recent and credible."
      }
    ];
    setCreativeSuggestions(suggestions);
  };

  const handleCopy = (text: string, index: number) => {
    copyToClipboard(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast({
      title: "Comment copied! 💬",
      description: "Ready to build real connections on LinkedIn",
    });
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Comment{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Generator
            </span>
          </h1>
          <p className="text-muted-foreground">Create genuine, AI-powered comments that build real relationships</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Input */}
          <div className="lg:col-span-2 space-y-6">
            {/* Input Method Selection */}
            <Card className="shadow-lg border-2">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Choose Input Method
                </h3>
                
                {/* Method 1: LinkedIn URL */}
                <div className="mb-6 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                  <div className="flex items-center gap-2 mb-3">
                    <ExternalLink className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-800">Method 1: LinkedIn URL</h4>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://linkedin.com/posts/..."
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleFetchFromLinkedIn}
                      disabled={isFetchingFromUrl || !linkedinUrl.trim()}
                      className="gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                      {isFetchingFromUrl ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ExternalLink className="h-4 w-4" />
                      )}
                      Fetch Content
                    </Button>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    💡 Paste a LinkedIn post URL to automatically fetch the content
                  </p>
                </div>

                {/* Method 2: Direct Content */}
                <div className="p-4 border-2 border-green-200 rounded-lg bg-green-50">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-green-800">Method 2: Direct Content</h4>
                  </div>
                  <Textarea
                    placeholder="Paste the LinkedIn post content here..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    className="min-h-[150px] resize-none"
                  />
                  <p className="text-xs text-green-600 mt-2">
                    💡 Copy and paste the post content directly for immediate processing
                  </p>
                </div>
              </div>
            </Card>

            {/* Persona Selection */}
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
              onClick={handleGenerateComments}
              disabled={isGenerating || !postContent.trim() || !selectedPersona}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Comments...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate AI Comments
                </>
              )}
            </Button>
          </div>

          {/* Right Column - Generated Comments */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg sticky top-4">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Generated Comments
                </h3>
                {generatedComments.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {generatedComments.map((comment, index) => (
                      <div key={index} className="p-4 bg-muted rounded-lg border">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {comment.engagementScore?.toFixed(1) || '8.5'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {comment.type?.replace('_', ' ') || 'general'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-xs font-medium">
                              {comment.engagementScore >= 9 ? 'High' : 
                               comment.engagementScore >= 7 ? 'Medium' : 'Low'}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm mb-3">{comment.text || comment}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(comment.text || comment, index)}
                          className="w-full gap-2"
                        >
                          {copiedIndex === index ? (
                            <>
                              <Check className="h-4 w-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Generate AI-powered comments to see them here</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Creative Engagement Suggestions */}
            {creativeSuggestions.length > 0 && (
              <Card className="shadow-lg">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Creative Engagement Ideas
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    💡 Take your engagement to the next level with these strategies
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {creativeSuggestions.map((suggestion, index) => (
                      <div key={index} className="p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">{suggestion.icon}</div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-green-900 mb-1">{suggestion.title}</h4>
                            <p className="text-sm text-green-700 mb-2">{suggestion.description}</p>
                            <div className="bg-green-100 p-2 rounded text-xs text-green-800">
                              <strong>💡 Pro tip:</strong> {suggestion.tips}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 text-center">
                    🚀 Build stronger connections with creative engagement
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentGenerator;
