import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, User, Clock, ArrowLeft, Share2, Bookmark, Eye } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface BlogPost {
  _id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  readTime: number;
  views: number;
  createdAt: string;
  publishedAt?: string;
  bannerImage?: string;
  author: {
    name: string;
    email?: string;
    avatar?: string;
  };
  isFeatured: boolean;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
}

const BlogPostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    if (slug) {
      fetchBlogPost();
      fetchRelatedPosts();
    }
  }, [slug]);

  const fetchBlogPost = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/api/blog/public/${slug}`);
      
      if (response.ok) {
        const result = await response.json();
        setBlogPost(result.data);
      } else if (response.status === 404) {
        toast.error("Blog post not found");
        navigate('/blogs');
      } else {
        toast.error("Failed to load blog post");
      }
    } catch (error) {
      console.error("Error fetching blog post:", error);
      toast.error("Failed to load blog post");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRelatedPosts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/blog/public?limit=3');
      
      if (response.ok) {
        const result = await response.json();
        setRelatedPosts(result.data.filter((post: BlogPost) => post.slug !== slug));
      }
    } catch (error) {
      console.error("Error fetching related posts:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (!blogPost) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Blog post not found</h2>
          <Link to="/blogs">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blogs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Link to="/blogs">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to All Blogs
          </Button>
        </Link>

        {/* Article Header */}
        <Card className="p-8 mb-8 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-primary text-white px-3 py-1 rounded text-sm font-medium">
              {blogPost.category}
            </div>
            {blogPost.isFeatured && (
              <div className="bg-yellow-500 text-white px-3 py-1 rounded text-sm font-medium">
                Featured
              </div>
            )}
          </div>

          <h1 className="text-4xl font-bold mb-4">{blogPost.title}</h1>

          <p className="text-xl text-muted-foreground mb-6">{blogPost.excerpt}</p>

          <div className="flex flex-wrap items-center gap-6 mb-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="font-medium">{blogPost.author.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(blogPost.publishedAt || blogPost.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{blogPost.readTime} min read</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>{blogPost.views} views</span>
            </div>
          </div>

          {/* Banner Image */}
          {blogPost.bannerImage && (
            <div className="rounded-lg overflow-hidden mb-8">
              <img
                src={blogPost.bannerImage}
                alt={blogPost.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Share Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t">
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Bookmark className="h-4 w-4" />
              Save
            </Button>
          </div>
        </Card>

        {/* Article Content */}
        <Card className="p-8 mb-8 shadow-card">
          <div 
            className="prose prose-lg max-w-none
              prose-headings:font-bold prose-headings:text-foreground
              prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-foreground prose-strong:font-semibold
              prose-ul:my-6 prose-ol:my-6
              prose-li:text-muted-foreground prose-li:my-2
              prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg"
            dangerouslySetInnerHTML={{ __html: formatContent(blogPost.content) }}
          />
        </Card>

        {/* Author Info */}
        <Card className="p-6 mb-8 shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center text-white text-2xl font-bold">
              {blogPost.author.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{blogPost.author.name}</h3>
              <p className="text-sm text-muted-foreground">Content Creator at LinkedInPulse</p>
            </div>
          </div>
        </Card>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((post) => (
                <Card key={post._id} className="overflow-hidden hover-lift group">
                  <Link to={`/blogs/${post.slug}`}>
                    <div className="relative">
                      <img
                        src={post.bannerImage || "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=200&fit=crop"}
                        alt={post.title}
                        className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded text-xs font-medium">
                        {post.category}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {post.readTime} min
                      </div>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to format content (convert markdown-like syntax to HTML)
const formatContent = (content: string): string => {
  let formatted = content;

  // Convert markdown headers to HTML
  formatted = formatted.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  formatted = formatted.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  formatted = formatted.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Convert **bold** to <strong>
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Convert *italic* to <em>
  formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Convert line breaks to paragraphs
  formatted = formatted.split('\n\n').map(para => {
    if (para.trim() && !para.startsWith('<h') && !para.startsWith('<ul') && !para.startsWith('<ol')) {
      return `<p>${para}</p>`;
    }
    return para;
  }).join('\n');

  // Convert - lists to <ul>
  formatted = formatted.replace(/^- (.+)$/gm, '<li>$1</li>');
  formatted = formatted.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);

  return formatted;
};

export default BlogPostPage;
