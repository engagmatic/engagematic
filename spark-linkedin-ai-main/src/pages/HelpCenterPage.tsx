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
      title: "LinkedInPulse Overview",
      description: "Get a complete overview of LinkedInPulse features and capabilities",
      duration: "5:30",
      thumbnail: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=225&fit=crop"
    },
    {
      title: "Creating Your First AI Persona",
      description: "Learn how to create and customize AI personas for different content types",
      duration: "8:15",
      thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=225&fit=crop"
    },
    {
      title: "Generating Viral LinkedIn Posts",
      description: "Master the art of creating engaging LinkedIn content with AI assistance",
      duration: "12:45",
      thumbnail: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=225&fit=crop"
    },
    {
      title: "LinkedIn Integration Setup",
      description: "Connect your LinkedIn account and start posting directly from LinkedInPulse",
      duration: "6:20",
      thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=225&fit=crop"
    }
  ];

  const quickLinks = [
    { title: "Account Setup Guide", icon: "📋", link: "/help/account-setup" },
    { title: "AI Persona Best Practices", icon: "🎭", link: "/help/persona-guide" },
    { title: "Content Templates", icon: "📝", link: "/help/templates" },
    { title: "LinkedIn Algorithm Guide", icon: "📊", link: "/help/algorithm" },
    { title: "Billing FAQ", icon: "💳", link: "/help/billing" },
    { title: "Technical Requirements", icon: "💻", link: "/help/technical" }
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
            Help{" "}
            <span className="bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent">
              Center
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to know to get the most out of LinkedInPulse. Find tutorials, guides, and answers to your questions.
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
              <Card key={index} className="overflow-hidden gradient-card shadow-card hover-lift group">
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
              <p className="text-sm text-muted-foreground mb-4">Ready-to-use templates for different content types</p>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Download Templates
              </Button>
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
