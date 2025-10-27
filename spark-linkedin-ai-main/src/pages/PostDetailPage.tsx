import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Copy, Share2, Calendar, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "../services/api";
import { formatForLinkedIn } from "@/utils/linkedinFormatting";
import { format } from "date-fns";

const PostDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const fetchPost = async () => {
    try {
      setIsLoading(true);
      // Fetch the specific saved post
      const response = await api.getSavedContent();
      
      if (response.success) {
        const foundPost = response.data.content?.find((p: any) => p._id === postId);
        if (foundPost) {
          setPost(foundPost);
        } else {
          toast({
            title: "Post not found",
            description: "This post does not exist or has been deleted",
            variant: "destructive"
          });
          navigate("/profile?saved=true");
        }
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      toast({
        title: "Error",
        description: "Failed to load post",
        variant: "destructive"
      });
      navigate("/profile?saved=true");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!post) return;
    
    try {
      const formattedPost = formatForLinkedIn(post.content);
      await navigator.clipboard.writeText(formattedPost);
      
      toast({
        title: "✅ Post Copied!",
        description: "Ready to paste on LinkedIn",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const handlePublishToLinkedIn = async () => {
    if (!post) return;
    
    try {
      const formattedPost = formatForLinkedIn(post.content);
      await navigator.clipboard.writeText(formattedPost);

      toast({
        title: "✅ Post Copied to Clipboard!",
        description: "Opening LinkedIn... Click the text area and press Ctrl+V (Cmd+V on Mac) to paste!",
      });

      try {
        // Log analytics
        await api.request('/content/share-log', {
          method: 'POST',
          body: JSON.stringify({
            contentId: post._id,
            platform: 'linkedin'
          })
        });
      } catch (e) {
        console.log('Analytics log failed:', e);
      }

      setTimeout(() => {
        const linkedInPostUrl = 'https://www.linkedin.com/feed/?shareActive=true';
        const linkedInWindow = window.open(linkedInPostUrl, '_blank', 'width=1200,height=800');

        if (!linkedInWindow || linkedInWindow.closed || typeof linkedInWindow.closed === 'undefined') {
          toast({
            title: "⚠️ Popup Blocked",
            description: "Please allow popups for this site, or copy the post manually from above.",
            variant: "destructive"
          });
        }
      }, 1000);
    } catch (error) {
      console.error('Share error:', error);
      toast({
        title: "Error",
        description: "Could not copy to clipboard. Please copy the post manually.",
        variant: "destructive"
      });
      window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Post not found</p>
          <Button onClick={() => navigate("/profile?saved=true")} className="mt-4">
            Go Back to Saved Posts
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/profile?saved=true")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Saved Posts
          </Button>

          <div className="flex items-center gap-3 mb-4">
            <Badge variant={post.type === 'post' ? 'default' : 'secondary'} className="capitalize">
              {post.type}
            </Badge>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(post.createdAt), "MMM d, yyyy 'at' hh:mm a")}</span>
            </div>
          </div>
        </div>

        {/* Post Content Card */}
        <Card className="p-6 shadow-lg mb-6">
          {/* Topic */}
          {post.topic && (
            <div className="mb-4">
              <h1 className="text-2xl font-bold">{post.topic}</h1>
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-6">
            <div className="bg-muted/50 rounded-lg p-6">
              <p className="whitespace-pre-wrap text-base leading-relaxed">
                {post.content}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t">
            <Button
              onClick={handlePublishToLinkedIn}
              className="flex-1"
              size="lg"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Publish to LinkedIn
            </Button>
            <Button
              variant="outline"
              onClick={handleCopyToClipboard}
              size="lg"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>

          {/* Info Banner */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> Click "Publish to LinkedIn" to copy the post and open LinkedIn in a new tab. 
              Then paste (Ctrl+V or Cmd+V) into the LinkedIn post composer.
            </p>
          </div>
        </Card>

        {/* Post Meta Info */}
        <Card className="p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Type</p>
              <p className="font-medium capitalize">{post.type}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="font-medium">{format(new Date(post.createdAt), "MMM d, yyyy")}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PostDetailPage;
