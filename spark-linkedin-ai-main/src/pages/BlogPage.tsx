import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, Share2, Users, TrendingUp, Target, Briefcase, UserCheck } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

interface BlogContent {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'comparison' | 'usecase';
  targetAudience?: string;
  readTime: string;
  publishDate: string;
  banner: string;
  slug: string;
  tags: string[];
}

const blogContents: Record<string, BlogContent> = {
  "linkedinpulse-vs-chatgpt": {
    id: "linkedinpulse-vs-chatgpt",
    title: "LinkedInPulse vs ChatGPT: Why LinkedInPulse Wins for Professional Content",
    excerpt: "Discover why LinkedInPulse outperforms ChatGPT for LinkedIn content creation with specialized AI, industry expertise, and professional optimization.",
    content: `# LinkedInPulse vs ChatGPT: Why LinkedInPulse Wins for Professional Content

In the world of AI-powered content creation, two names dominate the conversation: ChatGPT and LinkedInPulse. While ChatGPT has revolutionized general AI assistance, LinkedInPulse has emerged as the specialized solution for LinkedIn content creation. But which one truly delivers better results for professional content?

## The Fundamental Difference

**ChatGPT** is a general-purpose AI that excels at answering questions and generating various types of content. However, when it comes to LinkedIn-specific content, it lacks the specialized knowledge and optimization that LinkedInPulse provides.

**LinkedInPulse** is purpose-built for LinkedIn content creation, with AI models trained specifically on viral LinkedIn posts, professional networking patterns, and industry-specific content strategies.

## Why LinkedInPulse Outperforms ChatGPT for LinkedIn Content

### 1. LinkedIn-Specific Training
LinkedInPulse's AI is trained on over 50,000 viral LinkedIn posts, understanding the nuances of professional networking, industry-specific language, and engagement patterns that work on LinkedIn.

### 2. Industry Expertise
Unlike ChatGPT's generic approach, LinkedInPulse offers 15+ specialized personas for different industries, ensuring content resonates with your specific professional audience.

### 3. Professional Optimization
LinkedInPulse includes built-in features like:
- Optimal posting time suggestions
- Virality score analysis
- Engagement prediction
- Professional tone optimization

### 4. Content Variety
While ChatGPT generates text, LinkedInPulse creates:
- LinkedIn posts with hooks
- Professional comments
- Industry-specific content ideas
- Template-based content structures

## Real-World Performance Comparison

### Content Quality
- **ChatGPT**: Generic, often sounds AI-generated
- **LinkedInPulse**: Human-like, industry-specific, optimized for LinkedIn

### Engagement Rates
- **ChatGPT**: Average engagement, generic appeal
- **LinkedInPulse**: Higher engagement due to LinkedIn optimization

### Time Efficiency
- **ChatGPT**: Requires extensive prompting and editing
- **LinkedInPulse**: One-click generation with professional optimization

## The Verdict

While ChatGPT is excellent for general AI tasks, LinkedInPulse is the clear winner for LinkedIn content creation. Its specialized training, industry expertise, and LinkedIn optimization features make it the superior choice for professionals looking to build their LinkedIn presence.

## Ready to Experience the Difference?

Try LinkedInPulse's free trial and see how specialized AI can transform your LinkedIn content strategy.`,
    category: "comparison",
    readTime: "8 min read",
    publishDate: "2025-01-15",
    banner: "/blog-banners/chatgpt-comparison.jpg",
    slug: "linkedinpulse-vs-chatgpt",
    tags: ["AI", "LinkedIn", "Content Creation", "ChatGPT", "Comparison"]
  },
  "linkedinpulse-vs-taplio": {
    id: "linkedinpulse-vs-taplio",
    title: "LinkedInPulse vs Taplio: The Ultimate LinkedIn Content Tool Comparison",
    excerpt: "Compare LinkedInPulse and Taplio side-by-side. See why LinkedInPulse offers better AI, more features, and superior value for LinkedIn creators.",
    content: `# LinkedInPulse vs Taplio: The Ultimate LinkedIn Content Tool Comparison

When it comes to LinkedIn content creation tools, LinkedInPulse and Taplio are two of the most popular options. But which one delivers better results for your professional content strategy?

## Feature Comparison

### AI Content Generation
**LinkedInPulse**: Advanced AI trained on 50,000+ viral LinkedIn posts
**Taplio**: Basic AI with limited LinkedIn-specific training

### Content Types
**LinkedInPulse**: Posts, comments, ideas, templates, hooks
**Taplio**: Primarily posts and basic scheduling

### Industry Specialization
**LinkedInPulse**: 15+ industry-specific personas
**Taplio**: Limited industry customization

### Pricing
**LinkedInPulse**: More affordable with better value
**Taplio**: Higher pricing for fewer features

## Why LinkedInPulse Wins

### 1. Superior AI Technology
LinkedInPulse's AI is specifically trained for LinkedIn content, resulting in more engaging and professional posts.

### 2. Comprehensive Feature Set
From content generation to optimization, LinkedInPulse offers everything you need in one platform.

### 3. Better Value Proposition
More features at a lower price point makes LinkedInPulse the smarter choice.

### 4. Continuous Innovation
LinkedInPulse regularly updates with new features and improvements.

## The Bottom Line

While Taplio is a decent tool, LinkedInPulse offers superior AI, more features, and better value for LinkedIn content creators.`,
    category: "comparison",
    readTime: "7 min read",
    publishDate: "2025-01-15",
    banner: "/blog-banners/taplio-comparison.jpg",
    slug: "linkedinpulse-vs-taplio",
    tags: ["Taplio", "LinkedIn", "AI", "Content Tools", "Comparison"]
  },
  "linkedin-creators-guide": {
    id: "linkedin-creators-guide",
    title: "The Complete Guide to LinkedIn Content Creation for Creators",
    excerpt: "Master LinkedIn content creation with LinkedInPulse. Learn strategies, tools, and techniques used by top LinkedIn creators to build engaged audiences.",
    content: `# The Complete Guide to LinkedIn Content Creation for Creators

LinkedIn has become the go-to platform for professional content creators. With over 900 million users, it offers unparalleled opportunities to build authority, grow your network, and establish thought leadership in your industry.

## Why LinkedIn for Content Creators?

### Professional Audience
LinkedIn's user base consists of professionals, decision-makers, and industry leaders - exactly the audience most creators want to reach.

### High Engagement Rates
Professional content on LinkedIn often receives higher engagement rates than other platforms, especially for B2B content.

### Authority Building
Consistent, valuable content on LinkedIn helps establish you as a thought leader in your field.

## LinkedInPulse: The Creator's Secret Weapon

### AI-Powered Content Generation
LinkedInPulse uses advanced AI trained on 50,000+ viral LinkedIn posts to help you create engaging content that resonates with your audience.

### Industry-Specific Personas
Choose from 15+ specialized personas to ensure your content speaks directly to your target audience.

### Content Optimization
Built-in features like virality scoring and optimal posting time suggestions help maximize your content's reach.

## Content Strategy for LinkedIn Creators

### 1. Define Your Niche
Focus on a specific industry or topic where you can provide unique value.

### 2. Create Consistent Content
Post regularly to maintain visibility and build audience expectations.

### 3. Engage Authentically
Respond to comments and engage with others' content to build relationships.

### 4. Share Personal Stories
Professional doesn't mean impersonal - share your experiences and lessons learned.

## Content Types That Work

### Educational Posts
Share insights, tips, and knowledge that help your audience solve problems.

### Personal Stories
Share your professional journey, challenges overcome, and lessons learned.

### Industry Commentary
Comment on industry trends, news, and developments.

### Behind-the-Scenes
Show the human side of your professional life.

## Measuring Success

Track key metrics like:
- Engagement rate
- Follower growth
- Profile views
- Connection requests
- Business inquiries

## Getting Started

Ready to become a LinkedIn content creator? Start with LinkedInPulse's free trial and begin building your professional presence today.`,
    category: "usecase",
    targetAudience: "LinkedIn Creators",
    readTime: "12 min read",
    publishDate: "2025-01-15",
    banner: "/blog-banners/linkedin-creators.jpg",
    slug: "linkedin-creators-guide",
    tags: ["LinkedIn Creators", "Content Strategy", "Professional Growth", "Thought Leadership"]
  }
  // Add more blog contents as needed
};

const BlogPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<BlogContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug && blogContents[slug]) {
      setBlog(blogContents[slug]);
    }
    setLoading(false);
  }, [slug]);

  const handleShare = async () => {
    if (navigator.share && blog) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog Not Found</h1>
          <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist.</p>
          <Link to="/blogs">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blogs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "comparison":
        return <TrendingUp className="h-4 w-4" />;
      case "usecase":
        return <Target className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getAudienceIcon = (audience?: string) => {
    switch (audience) {
      case "LinkedIn Creators":
        return <Users className="h-4 w-4" />;
      case "Founders & CEOs":
        return <Briefcase className="h-4 w-4" />;
      case "Freelancers":
        return <UserCheck className="h-4 w-4" />;
      case "Recruiters":
        return <Users className="h-4 w-4" />;
      case "Sales Reps":
        return <Target className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/blogs">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blogs
              </Button>
            </Link>
            <div className="flex gap-2">
              <Badge 
                variant={blog.category === "comparison" ? "default" : "secondary"}
                className="flex items-center gap-1"
              >
                {getCategoryIcon(blog.category)}
                {blog.category === "comparison" ? "Comparison" : "Use Case"}
              </Badge>
              {blog.targetAudience && (
                <Badge variant="outline" className="flex items-center gap-1">
                  {getAudienceIcon(blog.targetAudience)}
                  {blog.targetAudience}
                </Badge>
              )}
            </div>
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-900">
            {blog.title}
          </h1>

          <p className="text-xl text-gray-600 mb-6">
            {blog.excerpt}
          </p>

          <div className="flex items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(blog.publishDate).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {blog.readTime}
            </div>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 lg:p-12">
            <div className="prose prose-lg max-w-none">
              {blog.content.split('\n').map((paragraph, index) => {
                if (paragraph.startsWith('# ')) {
                  return (
                    <h1 key={index} className="text-3xl font-bold mb-6 text-gray-900">
                      {paragraph.substring(2)}
                    </h1>
                  );
                } else if (paragraph.startsWith('## ')) {
                  return (
                    <h2 key={index} className="text-2xl font-bold mb-4 mt-8 text-gray-900">
                      {paragraph.substring(3)}
                    </h2>
                  );
                } else if (paragraph.startsWith('### ')) {
                  return (
                    <h3 key={index} className="text-xl font-bold mb-3 mt-6 text-gray-900">
                      {paragraph.substring(4)}
                    </h3>
                  );
                } else if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                  return (
                    <p key={index} className="font-semibold text-gray-900 mb-4">
                      {paragraph.substring(2, paragraph.length - 2)}
                    </p>
                  );
                } else if (paragraph.trim() === '') {
                  return <br key={index} />;
                } else {
                  return (
                    <p key={index} className="text-gray-700 mb-4 leading-relaxed">
                      {paragraph}
                    </p>
                  );
                }
              })}
            </div>

            {/* Tags */}
            <div className="mt-8 pt-8 border-t">
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>

          {/* CTA */}
          <div className="mt-12 text-center">
            <Card className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Ready to Transform Your LinkedIn Content?
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Join thousands of professionals using LinkedInPulse to create engaging content that drives results.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/pricing">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Start Free Trial
                  </Button>
                </Link>
                <Link to="/features">
                  <Button size="lg" variant="outline">
                    Explore Features
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
