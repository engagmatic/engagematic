import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Map, CheckCircle, Clock, Star, Users, MessageSquare, Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const RoadmapPage = () => {
  const roadmapItems = [
    {
      quarter: "Q1 2025",
      status: "completed",
      title: "Core Platform Launch",
      description: "Launch of LinkedInPulse with basic AI content generation features",
      features: [
        "AI-powered post generation",
        "Basic persona creation",
        "LinkedIn account integration",
        "User authentication and profiles",
        "Subscription management"
      ],
      icon: CheckCircle
    },
    {
      quarter: "Q2 2025",
      status: "in-progress",
      title: "Enhanced AI & Analytics",
      description: "Advanced AI capabilities and comprehensive analytics dashboard",
      features: [
        "Advanced AI models with better personalization",
        "Comprehensive analytics dashboard",
        "Content performance tracking",
        "A/B testing for content",
        "Advanced persona customization"
      ],
      icon: Clock
    },
    {
      quarter: "Q3 2025",
      status: "planned",
      title: "Team Collaboration",
      description: "Multi-user accounts and team collaboration features",
      features: [
        "Team accounts and user management",
        "Content approval workflows",
        "Brand voice consistency tools",
        "Collaborative content creation",
        "Advanced admin controls"
      ],
      icon: Users
    },
    {
      quarter: "Q4 2025",
      status: "planned",
      title: "Advanced Integrations",
      description: "Third-party integrations and advanced automation features",
      features: [
        "CRM integrations (Salesforce, HubSpot)",
        "Social media scheduling",
        "Email marketing integration",
        "Advanced automation workflows",
        "API for custom integrations"
      ],
      icon: Star
    }
  ];

  const upcomingFeatures = [
    {
      title: "Video Content Generation",
      description: "AI-powered video scripts and visual content suggestions",
      category: "Content Creation",
      votes: 1250,
      status: "high-demand"
    },
    {
      title: "Multi-Language Support",
      description: "Generate content in multiple languages for global audiences",
      category: "Localization",
      votes: 980,
      status: "high-demand"
    },
    {
      title: "Advanced Analytics",
      description: "Deep insights into content performance and audience engagement",
      category: "Analytics",
      votes: 850,
      status: "medium-demand"
    },
    {
      title: "Content Calendar",
      description: "Visual content planning and scheduling interface",
      category: "Planning",
      votes: 720,
      status: "medium-demand"
    },
    {
      title: "AI Writing Assistant",
      description: "Real-time writing suggestions and improvements",
      category: "AI Enhancement",
      votes: 650,
      status: "medium-demand"
    },
    {
      title: "Competitor Analysis",
      description: "Track and analyze competitor content strategies",
      category: "Competitive Intelligence",
      votes: 580,
      status: "low-demand"
    }
  ];

  const recentUpdates = [
    {
      date: "January 15, 2025",
      title: "Enhanced AI Models",
      description: "Improved AI content generation with better personalization and authenticity",
      type: "Enhancement"
    },
    {
      date: "January 10, 2025",
      title: "New Template Library",
      description: "Added 50+ new content templates across different industries",
      type: "Feature"
    },
    {
      date: "January 5, 2025",
      title: "Mobile App Beta",
      description: "Launched beta version of LinkedInPulse mobile app",
      type: "Release"
    },
    {
      date: "December 28, 2024",
      title: "Analytics Dashboard",
      description: "New analytics dashboard with detailed performance metrics",
      type: "Feature"
    }
  ];

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-xl gradient-pulse flex items-center justify-center mx-auto mb-4 shadow-pulse">
            <Map className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Product{" "}
            <span className="bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent">
              Roadmap
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See what we're building next and how LinkedInPulse will evolve to better serve your professional content creation needs.
          </p>
        </div>

        {/* Roadmap Timeline */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Development Timeline</h2>
          <div className="space-y-8">
            {roadmapItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card key={index} className="p-8 gradient-card shadow-card">
                  <div className="grid lg:grid-cols-3 gap-8 items-center">
                    <div className="text-center lg:text-left">
                      <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          item.status === 'completed' ? 'bg-green-100' : 
                          item.status === 'in-progress' ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <Icon className={`h-6 w-6 ${
                            item.status === 'completed' ? 'text-green-600' : 
                            item.status === 'in-progress' ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <Badge className={`mb-2 ${
                            item.status === 'completed' ? 'bg-green-500' : 
                            item.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-500'
                          }`}>
                            {item.status === 'completed' ? 'Completed' : 
                             item.status === 'in-progress' ? 'In Progress' : 'Planned'}
                          </Badge>
                          <h3 className="text-xl font-bold">{item.quarter}</h3>
                        </div>
                      </div>
                    </div>
                    <div className="lg:col-span-2">
                      <h4 className="text-2xl font-bold mb-3">{item.title}</h4>
                      <p className="text-muted-foreground mb-4">{item.description}</p>
                      <div className="grid md:grid-cols-2 gap-2">
                        {item.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Feature Requests */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Upcoming Features</h2>
          <p className="text-center text-muted-foreground mb-8">
            Based on user feedback and demand, here are the features we're prioritizing for future releases.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingFeatures.map((feature, index) => (
              <Card key={index} className="p-6 gradient-card shadow-card hover-lift">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="outline">{feature.category}</Badge>
                  <Badge className={
                    feature.status === 'high-demand' ? 'bg-red-500' :
                    feature.status === 'medium-demand' ? 'bg-yellow-500' : 'bg-gray-500'
                  }>
                    {feature.status === 'high-demand' ? 'High Demand' :
                     feature.status === 'medium-demand' ? 'Medium Demand' : 'Low Demand'}
                  </Badge>
                </div>
                <h3 className="font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{feature.votes} votes</span>
                  </div>
                  <Button variant="outline" size="sm">
                    Vote
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Updates */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Recent Updates</h2>
          <div className="space-y-4">
            {recentUpdates.map((update, index) => (
              <Card key={index} className="p-6 gradient-card shadow-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl gradient-pulse flex items-center justify-center shadow-pulse">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold">{update.title}</h3>
                        <Badge variant="outline">{update.type}</Badge>
                      </div>
                      <p className="text-muted-foreground">{update.description}</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {update.date}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Feedback Section */}
        <div className="mb-16">
          <Card className="p-8 gradient-card shadow-card text-center">
            <div className="w-16 h-16 rounded-xl gradient-pulse flex items-center justify-center mx-auto mb-4 shadow-pulse">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Have Feature Ideas?</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              We're always looking for new ideas to improve LinkedInPulse. Share your suggestions and help shape the future of our platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Submit Feature Request
                </Button>
              </Link>
              <Link to="/community">
                <Button variant="outline" size="lg">
                  Join Community Discussion
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Stay Updated */}
        <div className="text-center">
          <Card className="p-8 gradient-card shadow-card">
            <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Get notified about new features, updates, and releases. Be the first to try new functionality.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button size="lg" className="gap-2">
                <ArrowRight className="h-4 w-4" />
                Subscribe
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RoadmapPage;
