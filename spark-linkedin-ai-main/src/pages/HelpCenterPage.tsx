import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Video, FileText, MessageSquare, Search, ArrowRight, Play, Download } from "lucide-react";
import { Link } from "react-router-dom";

const HelpCenterPage = () => {
  const helpCategories = [
    {
      title: "Getting Started",
      icon: "🚀",
      description: "Learn the basics of LinkedInPulse and get up and running quickly",
      articles: [
        "Creating Your First Account",
        "Setting Up Your Profile",
        "Creating Your First AI Persona",
        "Generating Your First Post",
        "Understanding Your Dashboard"
      ]
    },
    {
      title: "AI Content Generation",
      icon: "🤖",
      description: "Master the art of AI-powered content creation",
      articles: [
        "How AI Content Generation Works",
        "Creating Effective Personas",
        "Using Viral Hooks Effectively",
        "Customizing AI-Generated Content",
        "Best Practices for AI Content"
      ]
    },
    {
      title: "LinkedIn Integration",
      icon: "💼",
      description: "Connect and optimize your LinkedIn presence",
      articles: [
        "Connecting Your LinkedIn Account",
        "Posting Directly to LinkedIn",
        "Scheduling Posts",
        "Managing Multiple Accounts",
        "LinkedIn Best Practices"
      ]
    },
    {
      title: "Account Management",
      icon: "⚙️",
      description: "Manage your subscription, billing, and account settings",
      articles: [
        "Managing Your Subscription",
        "Understanding Usage Limits",
        "Upgrading or Downgrading Plans",
        "Billing and Payment Questions",
        "Account Security Settings"
      ]
    },
    {
      title: "Troubleshooting",
      icon: "🔧",
      description: "Solve common issues and technical problems",
      articles: [
        "Login and Authentication Issues",
        "Content Generation Problems",
        "LinkedIn Connection Issues",
        "Performance and Speed Issues",
        "Browser Compatibility"
      ]
    },
    {
      title: "Advanced Features",
      icon: "⭐",
      description: "Unlock the full potential of LinkedInPulse",
      articles: [
        "Advanced Persona Settings",
        "Analytics and Insights",
        "Team Collaboration Features",
        "API and Integrations",
        "Custom Templates"
      ]
    }
  ];

  const videoTutorials = [
    {
      title: "LinkedIn Content Strategy 101",
      description: "High-level strategy for growing on LinkedIn the right way",
      duration: "12:45",
      thumbnail: "https://img.youtube.com/vi/2k5C0s4Gg0o/hqdefault.jpg",
      url: "https://www.youtube.com/watch?v=2k5C0s4Gg0o"
    },
    {
      title: "Write Better LinkedIn Hooks",
      description: "Practical tips to craft hooks that stop the scroll",
      duration: "8:15",
      thumbnail: "https://img.youtube.com/vi/7H8bQ8f3BfQ/hqdefault.jpg",
      url: "https://www.youtube.com/watch?v=7H8bQ8f3BfQ"
    },
    {
      title: "Persona-Driven Content",
      description: "How to create content that sounds like you",
      duration: "9:20",
      thumbnail: "https://img.youtube.com/vi/9m1q4B9yY8Q/hqdefault.jpg",
      url: "https://www.youtube.com/watch?v=9m1q4B9yY8Q"
    },
    {
      title: "Scheduling & Posting Best Practices",
      description: "When to post and how to plan for consistency",
      duration: "6:20",
      thumbnail: "https://img.youtube.com/vi/G3hJ4cP8S9E/hqdefault.jpg",
      url: "https://www.youtube.com/watch?v=G3hJ4cP8S9E"
    }
  ];

  const quickLinks = [
    { title: "Getting Started", icon: "📋", link: "https://www.linkedin.com/help/linkedin" },
    { title: "Persona Best Practices", icon: "🎭", link: "https://blog.hubspot.com/marketing/buyer-persona-research" },
    { title: "Content Templates", icon: "📝", link: "/templates" },
    { title: "LinkedIn Algorithm Guide", icon: "📊", link: "https://blog.hootsuite.com/linkedin-algorithm/" },
    { title: "Usage & Limits", icon: "📈", link: "/faq#usage" },
    { title: "Tech Requirements", icon: "💻", link: "https://www.linkedin.com/help/linkedin/answer/a521735" }
  ];

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-xl gradient-pulse flex items-center justify-center mx-auto mb-4 shadow-pulse">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Resources
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Guides, templates, tutorials and best practices to master LinkedIn content with LinkedInPulse.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search help articles..."
              className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Quick Links</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.map((link, index) => (
              <Link key={index} to={link.link}>
                <Card className="p-4 gradient-card shadow-card hover-lift cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{link.icon}</span>
                    <span className="font-medium">{link.title}</span>
                    <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Video Tutorials */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Video Tutorials</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {videoTutorials.map((video, index) => (
              <a key={index} href={video.url} target="_blank" rel="noopener noreferrer">
              <Card className="overflow-hidden gradient-card shadow-card hover-lift group cursor-pointer">
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="h-6 w-6 text-primary ml-1" />
                    </div>
                  </div>
                  <Badge className="absolute top-2 right-2 bg-black/80 text-white">
                    {video.duration}
                  </Badge>
                </div>
                <div className="p-4">
                  <h3 className="font-bold mb-2 line-clamp-2">{video.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
                </div>
              </Card>
              </a>
            ))}
          </div>
        </div>

        {/* Help Categories */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Browse by Category</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpCategories.map((category, index) => (
              <Card key={index} className="p-6 gradient-card shadow-card hover-lift">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{category.icon}</span>
                  <h3 className="text-xl font-bold">{category.title}</h3>
                </div>
                <p className="text-muted-foreground mb-4">{category.description}</p>
                <div className="space-y-2">
                  {category.articles.map((article, articleIndex) => (
                    <div key={articleIndex} className="flex items-center gap-2 text-sm">
                      <FileText className="h-3 w-3 text-muted-foreground" />
                      <span className="hover:text-primary cursor-pointer">{article}</span>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="w-full mt-4 gap-2">
                  View All Articles
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Downloadable Resources */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Downloadable Resources</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 gradient-card shadow-card hover-lift text-center">
              <div className="w-16 h-16 rounded-xl gradient-pulse flex items-center justify-center mx-auto mb-4 shadow-pulse">
                <Download className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold mb-2">LinkedInPulse User Guide</h3>
              <p className="text-sm text-muted-foreground mb-4">Complete guide to using all LinkedInPulse features</p>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </Card>
            <Card className="p-6 gradient-card shadow-card hover-lift text-center">
              <div className="w-16 h-16 rounded-xl gradient-pulse flex items-center justify-center mx-auto mb-4 shadow-pulse">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold mb-2">Content Templates</h3>
              <p className="text-sm text-muted-foreground mb-4">Ready-to-use templates for different LinkedIn content types</p>
              <a href="/templates" className="inline-flex items-center gap-2 px-3 py-2 border rounded-md text-sm">
                  <Download className="h-4 w-4" />
                  Open Templates
                </a>
            </Card>
            <Card className="p-6 gradient-card shadow-card hover-lift text-center">
              <div className="w-16 h-16 rounded-xl gradient-pulse flex items-center justify-center mx-auto mb-4 shadow-pulse">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold mb-2">Best Practices Guide</h3>
              <p className="text-sm text-muted-foreground mb-4">LinkedIn content creation best practices and tips</p>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Download Guide
              </Button>
            </Card>
            <Card className="p-6 gradient-card shadow-card hover-lift text-center">
              <div className="w-16 h-16 rounded-xl gradient-pulse flex items-center justify-center mx-auto mb-4 shadow-pulse">
                <Video className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold mb-2">Video Tutorials</h3>
              <p className="text-sm text-muted-foreground mb-4">Step-by-step video tutorials for all features</p>
              <Button variant="outline" size="sm" className="gap-2">
                <Play className="h-4 w-4" />
                Watch Videos
              </Button>
            </Card>
          </div>
        </div>

        {/* Contact Support */}
        <div className="text-center">
          <Card className="p-8 gradient-card shadow-card">
            <div className="w-16 h-16 rounded-xl gradient-pulse flex items-center justify-center mx-auto mb-4 shadow-pulse">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Can't find what you're looking for? Our support team is here to help you succeed with LinkedInPulse.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Contact Support
                </Button>
              </Link>
              <Link to="/faq">
                <Button variant="outline" size="lg">
                  Browse FAQ
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage;
