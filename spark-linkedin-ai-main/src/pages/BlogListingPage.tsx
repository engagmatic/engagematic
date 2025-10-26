import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Clock, ArrowRight, Users, TrendingUp, Target, Briefcase, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";

interface Blog {
  id: string;
  title: string;
  excerpt: string;
  category: 'comparison' | 'usecase';
  targetAudience?: string;
  readTime: string;
  publishDate: string;
  banner: string;
  slug: string;
}

const blogs: Blog[] = [
  {
    id: "linkedinpulse-vs-chatgpt",
    title: "LinkedInPulse vs ChatGPT: Why LinkedInPulse Wins for Professional Content",
    excerpt: "Discover why LinkedInPulse outperforms ChatGPT for LinkedIn content creation with specialized AI, industry expertise, and professional optimization.",
    category: "comparison",
    readTime: "8 min read",
    publishDate: "2025-01-15",
    banner: "/blog-banners/chatgpt-comparison.jpg",
    slug: "linkedinpulse-vs-chatgpt"
  },
  {
    id: "linkedinpulse-vs-taplio",
    title: "LinkedInPulse vs Taplio: The Ultimate LinkedIn Content Tool Comparison",
    excerpt: "Compare LinkedInPulse and Taplio side-by-side. See why LinkedInPulse offers better AI, more features, and superior value for LinkedIn creators.",
    category: "comparison",
    readTime: "7 min read",
    publishDate: "2025-01-15",
    banner: "/blog-banners/taplio-comparison.jpg",
    slug: "linkedinpulse-vs-taplio"
  },
  {
    id: "linkedinpulse-vs-hootsuite",
    title: "LinkedInPulse vs Hootsuite: AI Content Creation vs Social Media Management",
    excerpt: "Learn why LinkedInPulse's AI-powered content creation beats Hootsuite's generic scheduling tools for LinkedIn success.",
    category: "comparison",
    readTime: "6 min read",
    publishDate: "2025-01-15",
    banner: "/blog-banners/hootsuite-comparison.jpg",
    slug: "linkedinpulse-vs-hootsuite"
  },
  {
    id: "linkedinpulse-vs-authoredup",
    title: "LinkedInPulse vs AuthoredUp: Advanced AI vs Basic Content Tools",
    excerpt: "See how LinkedInPulse's advanced AI and LinkedIn specialization outperforms AuthoredUp's basic content generation features.",
    category: "comparison",
    readTime: "7 min read",
    publishDate: "2025-01-15",
    banner: "/blog-banners/authoredup-comparison.jpg",
    slug: "linkedinpulse-vs-authoredup"
  },
  {
    id: "linkedinpulse-vs-kleo",
    title: "LinkedInPulse vs Kleo: Professional Content AI vs Generic Automation",
    excerpt: "Compare LinkedInPulse's professional-grade AI with Kleo's generic automation. Discover why LinkedInPulse delivers superior LinkedIn content.",
    category: "comparison",
    readTime: "6 min read",
    publishDate: "2025-01-15",
    banner: "/blog-banners/kleo-comparison.jpg",
    slug: "linkedinpulse-vs-kleo"
  },
  {
    id: "linkedin-creators-guide",
    title: "The Complete Guide to LinkedIn Content Creation for Creators",
    excerpt: "Master LinkedIn content creation with LinkedInPulse. Learn strategies, tools, and techniques used by top LinkedIn creators to build engaged audiences.",
    category: "usecase",
    targetAudience: "LinkedIn Creators",
    readTime: "12 min read",
    publishDate: "2025-01-15",
    banner: "/blog-banners/linkedin-creators.jpg",
    slug: "linkedin-creators-guide"
  },
  {
    id: "founders-ceos-guide",
    title: "LinkedIn Content Strategy for Founders & CEOs: Build Authority and Drive Growth",
    excerpt: "Elevate your executive presence on LinkedIn with LinkedInPulse. Learn how founders and CEOs use strategic content to build authority and drive business growth.",
    category: "usecase",
    targetAudience: "Founders & CEOs",
    readTime: "10 min read",
    publishDate: "2025-01-15",
    banner: "/blog-banners/founders-ceos.jpg",
    slug: "founders-ceos-guide"
  },
  {
    id: "freelancers-guide",
    title: "LinkedIn Marketing for Freelancers: Attract Clients and Build Your Brand",
    excerpt: "Transform your LinkedIn presence into a client magnet with LinkedInPulse. Discover proven strategies freelancers use to attract high-quality clients.",
    category: "usecase",
    targetAudience: "Freelancers",
    readTime: "9 min read",
    publishDate: "2025-01-15",
    banner: "/blog-banners/freelancers.jpg",
    slug: "freelancers-guide"
  },
  {
    id: "recruiters-guide",
    title: "LinkedIn Recruiting Strategies: Find and Engage Top Talent",
    excerpt: "Master LinkedIn recruiting with LinkedInPulse. Learn how top recruiters use content marketing to attract and engage the best candidates.",
    category: "usecase",
    targetAudience: "Recruiters",
    readTime: "11 min read",
    publishDate: "2025-01-15",
    banner: "/blog-banners/recruiters.jpg",
    slug: "recruiters-guide"
  },
  {
    id: "sales-reps-guide",
    title: "LinkedIn Sales Prospecting: Generate Leads and Close Deals",
    excerpt: "Boost your sales performance with LinkedInPulse. Learn how sales professionals use LinkedIn content to generate leads and build relationships.",
    category: "usecase",
    targetAudience: "Sales Reps",
    readTime: "10 min read",
    publishDate: "2025-01-15",
    banner: "/blog-banners/sales-reps.jpg",
    slug: "sales-reps-guide"
  }
];

const BlogListingPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "comparison" | "usecase">("all");

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || blog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                LinkedInPulse Blog
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Expert insights, comparisons, and strategies to help you master LinkedIn content creation
            </p>
            
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search blogs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  onClick={() => setSelectedCategory("all")}
                  size="sm"
                >
                  All
                </Button>
                <Button
                  variant={selectedCategory === "comparison" ? "default" : "outline"}
                  onClick={() => setSelectedCategory("comparison")}
                  size="sm"
                >
                  Comparisons
                </Button>
                <Button
                  variant={selectedCategory === "usecase" ? "default" : "outline"}
                  onClick={() => setSelectedCategory("usecase")}
                  size="sm"
                >
                  Use Cases
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBlogs.map((blog) => (
            <Card key={blog.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
              {/* Banner Image */}
              <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-100 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute top-4 left-4">
                  <Badge 
                    variant={blog.category === "comparison" ? "default" : "secondary"}
                    className="flex items-center gap-1"
                  >
                    {getCategoryIcon(blog.category)}
                    {blog.category === "comparison" ? "Comparison" : "Use Case"}
                  </Badge>
                </div>
                {blog.targetAudience && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="outline" className="flex items-center gap-1 bg-white/90">
                      {getAudienceIcon(blog.targetAudience)}
                      {blog.targetAudience}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {blog.title}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {blog.excerpt}
                </p>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(blog.publishDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {blog.readTime}
                  </div>
                </div>

                {/* CTA */}
                <Link to={`/blogs/${blog.slug}`}>
                  <Button className="w-full group-hover:bg-blue-600 transition-colors">
                    Read More
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        {filteredBlogs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No blogs found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your LinkedIn Content?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals using LinkedInPulse to create engaging content that drives results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/pricing">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                Start Free Trial
              </Button>
            </Link>
            <Link to="/features">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Explore Features
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogListingPage;
