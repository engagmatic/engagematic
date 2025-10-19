import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, User, Clock, ArrowLeft, Share2, Bookmark } from "lucide-react";
import { Link, useParams } from "react-router-dom";

// Blog data (same as in BlogsPage)
const blogPosts = [
  {
    id: 1,
    slug: "ultimate-linkedin-content-strategy-2025",
    title: "The Ultimate LinkedIn Content Strategy for 2025",
    summary: "Discover the proven framework that helped 10,000+ professionals 6x their LinkedIn engagement and build authentic professional relationships.",
    content: `# The Ultimate LinkedIn Content Strategy for 2025

LinkedIn has evolved beyond just a professional networking platform. It's now a powerful content ecosystem where thought leaders, entrepreneurs, and professionals build their personal brands and drive business growth.

After analyzing over 10,000 successful LinkedIn profiles and working with hundreds of content creators, I've identified the key patterns that separate high-performing accounts from the rest.

## The 3-Pillar Framework

### 1. Authenticity Over Perfection

The biggest mistake most professionals make is trying to sound "corporate" or overly polished. LinkedIn's algorithm and users favor authentic, human content.

**What works:**
- Personal stories and experiences
- Behind-the-scenes insights
- Honest failures and lessons learned
- Real opinions on industry topics

**What doesn't work:**
- Generic motivational quotes
- Overly promotional content
- Perfect, corporate-speak posts
- Content that sounds AI-generated

### 2. The Hook-Value-CTA Structure

Every successful LinkedIn post follows this proven structure:

**Hook (First Line):** Grab attention with a compelling statement
**Value (Middle):** Provide actionable insights or interesting information
**CTA (End):** Encourage engagement with a question or call-to-action

### 3. Consistency Beats Perfection

Posting consistently 3-5 times per week outperforms sporadic, perfect posts. The algorithm rewards regular engagement.

## Content Pillars That Work

### Personal Brand Stories
Share your journey, challenges, and victories. People connect with stories, not statistics.

### Industry Insights
Position yourself as a thought leader by sharing unique perspectives on industry trends.

### Behind-the-Scenes Content
Show the human side of your work. This builds trust and relatability.

### Educational Content
Provide value by teaching something useful to your audience.

## Engagement Optimization

### Timing
Post when your audience is most active:
- Tuesday-Thursday: 8-10 AM or 5-6 PM
- Avoid weekends and Mondays

### Visuals
Posts with images get 2.3x more engagement. Use:
- Professional headshots
- Behind-the-scenes photos
- Infographics and charts
- Screenshots of your work

### Hashtags
Use 3-5 relevant hashtags. Mix popular and niche tags for maximum reach.

## Building Your Community

### Respond to Comments
Engage with every comment within the first hour of posting. This signals to the algorithm that your content is engaging.

### Comment on Others' Posts
Spend 15-20 minutes daily commenting thoughtfully on others' content. This builds relationships and increases your visibility.

### Collaborate
Partner with other professionals in your industry for cross-promotion and content collaboration.

## Measuring Success

Track these key metrics:
- **Engagement Rate:** Comments + reactions / impressions
- **Click-through Rate:** Link clicks / impressions
- **Follower Growth:** New followers per week
- **Lead Generation:** Inquiries and business opportunities

## Common Mistakes to Avoid

1. **Posting and Ghosting:** Don't post and disappear. Engage with your audience.
2. **Over-promotion:** Keep promotional content to 20% or less of your posts.
3. **Ignoring Analytics:** Use LinkedIn's analytics to understand what works.
4. **Inconsistent Branding:** Maintain a consistent voice and visual style.

## Getting Started

1. **Audit Your Current Content:** Review your last 10 posts and identify what performed best.
2. **Define Your Brand Voice:** How do you want to be perceived by your audience?
3. **Create a Content Calendar:** Plan your posts for the next month.
4. **Set Engagement Goals:** Aim for specific metrics improvement.

Remember, building a strong LinkedIn presence takes time and consistency. Focus on providing value, being authentic, and engaging genuinely with your community.

The professionals who succeed on LinkedIn aren't necessarily the most talented or experienced—they're the ones who show up consistently and provide value to their audience.

Start implementing these strategies today, and watch your LinkedIn presence transform from invisible to influential.`,
    author: "Sarah Chen",
    authorBio: "LinkedIn Growth Strategist with 5+ years helping professionals build authentic personal brands. Featured in Forbes and Entrepreneur.",
    publishDate: "2025-01-15",
    readTime: "8 min read",
    category: "Strategy",
    tags: ["LinkedIn", "Content Strategy", "Personal Branding", "Social Media"],
    imageUrl: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=400&fit=crop",
    featured: true
  }
];

const BlogPostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const foundPost = blogPosts.find(p => p.slug === slug);
    if (foundPost) {
      setPost(foundPost);
    }
  }, [slug]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.summary,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  if (!post) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <Link to="/blogs">
            <Button>Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/blogs">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </div>

        {/* Article Header */}
        <div className="mb-8">
          <div className="bg-primary text-white px-3 py-1 rounded text-sm font-medium inline-block mb-4">
            {post.category}
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            {post.title}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {post.summary}
          </p>

          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-6 mb-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(post.publishDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{post.readTime}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 mb-8">
            <Button onClick={handleShare} variant="outline" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button onClick={handleBookmark} variant="outline" className="gap-2">
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
              {isBookmarked ? 'Bookmarked' : 'Bookmark'}
            </Button>
          </div>

          {/* Featured Image */}
          <div className="mb-8">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-64 lg:h-96 object-cover rounded-lg shadow-lg"
            />
          </div>
        </div>

        {/* Article Content */}
        <Card className="p-8 gradient-card shadow-card mb-8">
          <div className="prose prose-lg max-w-none">
            {post.content.split('\n').map((paragraph, index) => {
              if (paragraph.startsWith('# ')) {
                return <h1 key={index} className="text-3xl font-bold mb-6 mt-8 first:mt-0">{paragraph.slice(2)}</h1>;
              } else if (paragraph.startsWith('## ')) {
                return <h2 key={index} className="text-2xl font-bold mb-4 mt-6">{paragraph.slice(3)}</h2>;
              } else if (paragraph.startsWith('### ')) {
                return <h3 key={index} className="text-xl font-semibold mb-3 mt-4">{paragraph.slice(4)}</h3>;
              } else if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                return <p key={index} className="font-semibold mb-4">{paragraph.slice(2, -2)}</p>;
              } else if (paragraph.startsWith('- ')) {
                return <li key={index} className="mb-2">{paragraph.slice(2)}</li>;
              } else if (paragraph.trim() === '') {
                return <br key={index} />;
              } else if (paragraph.trim()) {
                return <p key={index} className="mb-4 leading-relaxed">{paragraph}</p>;
              }
              return null;
            })}
          </div>
        </Card>

        {/* Author Bio */}
        <Card className="p-6 gradient-card shadow-card mb-8">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">{post.author}</h3>
              <p className="text-muted-foreground">{post.authorBio}</p>
            </div>
          </div>
        </Card>

        {/* Back to Blog */}
        <div className="text-center">
          <Link to="/blogs">
            <Button size="lg" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to All Articles
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogPostPage;