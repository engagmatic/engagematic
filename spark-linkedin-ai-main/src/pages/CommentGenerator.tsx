import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Heart, Loader2, Sparkles, MessageCircle, ExternalLink, TrendingUp, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { usePersonas } from "@/hooks/usePersonas";
import { useContentGeneration } from "@/hooks/useContentGeneration";
import { useNavigate } from "react-router-dom";
import apiClient from "@/services/api";
import { SEO } from "@/components/SEO";
import { PAGE_SEO } from "@/constants/seo";
import { COMMENT_TYPES, DEFAULT_COMMENT_TYPE } from "@/constants/commentTypes";
import { EXPANDED_PERSONAS, PERSONA_CATEGORIES } from "@/constants/expandedPersonas";

interface GeneratedComment {
  text: string;
}

const CommentGenerator = () => {
  const [postContent, setPostContent] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [commentType, setCommentType] = useState(DEFAULT_COMMENT_TYPE);
  const [generatedComments, setGeneratedComments] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isFetchingFromUrl, setIsFetchingFromUrl] = useState(false);
  // Removed creative suggestions for comment generator per requirements
  
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { personas, samplePersonas, isLoading: personasLoading } = usePersonas();
  const { isGenerating, generateComment, copyToClipboard } = useContentGeneration();
  const navigate = useNavigate();

  // Use user's personas first, fall back to expanded personas
  useEffect(() => {
    if (selectedPersona) return; // Already have a persona

    // Prioritize user's personas
    if (personas.length > 0) {
      setSelectedPersona(personas[0]);
      console.log('✅ User persona selected for comments:', personas[0].name);
    } else if (EXPANDED_PERSONAS.length > 0) {
      setSelectedPersona(EXPANDED_PERSONAS[0]);
      console.log('✅ Expanded persona selected for comments:', EXPANDED_PERSONAS[0].name);
    }
  }, [personas, selectedPersona]);

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
        persona: selectedPersona,
        commentType: commentType
      });

      if (result.success) {
        // Normalize to an array of up to 3 comments
        let comments: GeneratedComment[] = [];
        const raw = (result.data && (result.data.comments || result.data.content)) as unknown;
        if (Array.isArray(raw)) {
          comments = raw;
        } else if (typeof raw === 'string') {
          try {
            const parsed = JSON.parse(raw);
            comments = Array.isArray(parsed) ? parsed : [raw];
          } catch {
            // Split by double newline or newline as fallback
            const splits = raw.split(/\n\n+|\n+/).filter(Boolean).map(t => ({ text: t }));
            comments = splits.length ? splits : [{ text: raw }];
          }
        }
        // Ensure objects with text field
        comments = comments.map((c) => (typeof c === 'string' ? { text: c } : c)) as GeneratedComment[];
        setGeneratedComments(comments.slice(0, 3));

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

  // Removed creative suggestions generator

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
      <SEO {...PAGE_SEO.commentGenerator} />
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
                    placeholder="Paste the full LinkedIn post content here (with emojis and formatting)..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    className="min-h-[150px] resize-none"
                  />
                  <p className="text-xs text-green-600 mt-2">
                    💡 Copy and paste the post content directly - emojis and formatting preserved
                  </p>
                </div>
              </div>
            </Card>

            {/* LinkedIn Post Context Display */}
            {postContent && (
              <Card className="shadow-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-blue-800">Post Context</h3>
                    <Badge variant="secondary" className="ml-auto">Ready for AI</Badge>
                  </div>
                  
                  <div className="p-4 bg-white border-2 border-blue-100 rounded-lg max-h-[300px] overflow-y-auto">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {postContent}
                    </p>
                  </div>
                  
                  <div className="mt-3 p-3 bg-blue-100 border border-blue-200 rounded-md text-xs text-blue-700">
                    <strong>📋 Using this context:</strong> The AI will analyze this post and generate relevant, engaging comments tailored to your selected persona and comment type.
                  </div>
                </div>
              </Card>
            )}

            {/* Persona Selection */}
            <Card className="shadow-lg">
              <div className="p-6">
                <label className="block text-sm font-semibold mb-3">
                  Choose Your Persona *
                </label>
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
                    <SelectValue placeholder="Select a persona" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[400px]">
                    {/* Show user personas first */}
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
                  <div className="mt-3 p-3 bg-muted rounded-md text-sm">
                    <div><strong>Tone:</strong> {selectedPersona.tone}</div>
                    {selectedPersona.expertise && (
                      <div><strong>Expertise:</strong> {Array.isArray(selectedPersona.expertise) ? selectedPersona.expertise.join(', ') : selectedPersona.expertise}</div>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Comment Type Selection */}
            <Card className="shadow-lg border-2 border-primary/20">
              <div className="p-4 sm:p-6">
                <label className="block text-sm font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Choose Comment Style *
                </label>
                <Select value={commentType} onValueChange={setCommentType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select comment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-3 py-1">
                          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-primary">{type.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{type.label}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1">{type.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {commentType && (
                  <div className="mt-3 p-3 sm:p-4 bg-gradient-to-br from-primary/5 to-purple/5 border border-primary/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary-foreground">
                          {COMMENT_TYPES.find(t => t.value === commentType)?.icon}
                        </span>
                      </div>
                      <Badge variant="default" className="text-xs">
                        {COMMENT_TYPES.find(t => t.value === commentType)?.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {COMMENT_TYPES.find(t => t.value === commentType)?.description}
                    </p>
                    <div className="p-2 sm:p-3 bg-background/50 rounded border border-primary/10">
                      <p className="text-xs font-medium text-primary mb-1">Example:</p>
                      <p className="text-xs italic leading-relaxed">"{COMMENT_TYPES.find(t => t.value === commentType)?.example}"</p>
                    </div>
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
                  <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
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

            {/* Creative Engagement Ideas removed as requested */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentGenerator;
