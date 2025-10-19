import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare, Calendar, Award, TrendingUp, Heart, Share2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CommunityPage = () => {
  const communityStats = [
    { label: "Active Members", value: "10,000+", icon: Users },
    { label: "Posts Created", value: "50,000+", icon: MessageSquare },
    { label: "Success Stories", value: "2,500+", icon: Award },
    { label: "Engagement Rate", value: "85%", icon: TrendingUp }
  ];

  const upcomingEvents = [
    {
      title: "LinkedIn Growth Masterclass",
      date: "January 25, 2025",
      time: "2:00 PM PST",
      type: "Webinar",
      attendees: 150,
      description: "Learn advanced strategies for growing your LinkedIn presence with AI-powered content."
    },
    {
      title: "AI Content Creation Workshop",
      date: "February 2, 2025",
      time: "10:00 AM PST",
      type: "Workshop",
      attendees: 75,
      description: "Hands-on workshop on creating authentic AI-generated content that resonates with your audience."
    },
    {
      title: "LinkedInPulse User Meetup",
      date: "February 15, 2025",
      time: "6:00 PM PST",
      type: "Networking",
      attendees: 200,
      description: "Connect with other LinkedInPulse users and share success stories and best practices."
    }
  ];

  const successStories = [
    {
      name: "Sarah Chen",
      role: "Marketing Director",
      company: "TechCorp",
      achievement: "6x LinkedIn engagement increase",
      story: "Using LinkedInPulse helped me create consistent, engaging content that built my personal brand and generated 50+ qualified leads in just 3 months.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Marcus Rodriguez",
      role: "Sales Manager",
      company: "GrowthCo",
      achievement: "2M+ post impressions",
      story: "The AI-generated content templates helped me maintain a consistent posting schedule while focusing on closing deals. My LinkedIn presence became a lead generation machine.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Jennifer Walsh",
      role: "Entrepreneur",
      company: "StartupXYZ",
      achievement: "500+ new connections",
      story: "As a startup founder, LinkedInPulse helped me build credibility and attract investors. The authentic AI content made me stand out in a crowded market.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
    }
  ];

  const communityFeatures = [
    {
      icon: MessageSquare,
      title: "Discussion Forums",
      description: "Join conversations about LinkedIn strategies, AI content creation, and professional growth.",
      color: "text-blue-500"
    },
    {
      icon: Users,
      title: "Networking Groups",
      description: "Connect with professionals in your industry and build meaningful business relationships.",
      color: "text-green-500"
    },
    {
      icon: Award,
      title: "Success Showcases",
      description: "Share your achievements and get inspired by others' success stories.",
      color: "text-purple-500"
    },
    {
      icon: Calendar,
      title: "Virtual Events",
      description: "Attend webinars, workshops, and networking events hosted by industry experts.",
      color: "text-orange-500"
    }
  ];

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-xl gradient-pulse flex items-center justify-center mx-auto mb-4 shadow-pulse">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            LinkedInPulse{" "}
            <span className="gradient-pulse bg-clip-text text-transparent">Community</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Connect with thousands of professionals who are transforming their LinkedIn presence with AI-powered content creation.
          </p>
        </div>

        {/* Community Stats */}
        <div className="mb-16">
          <Card className="p-8 gradient-card shadow-card">
            <h2 className="text-2xl font-bold mb-6 text-center">Community Impact</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {communityStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 rounded-xl gradient-pulse flex items-center justify-center mx-auto mb-4 shadow-pulse">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                    <div className="text-muted-foreground">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Community Features */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">What You Can Do</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {communityFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="p-6 gradient-card shadow-card hover-lift text-center">
                  <div className={`w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Success Stories */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Success Stories</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {successStories.map((story, index) => (
              <Card key={index} className="p-6 gradient-card shadow-card hover-lift">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={story.image}
                    alt={story.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-bold">{story.name}</h3>
                    <p className="text-sm text-muted-foreground">{story.role} at {story.company}</p>
                  </div>
                </div>
                <Badge className="mb-3 gradient-pulse">{story.achievement}</Badge>
                <p className="text-muted-foreground text-sm">{story.story}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Upcoming Events</h2>
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <Card key={index} className="p-6 gradient-card shadow-card hover-lift">
                <div className="grid md:grid-cols-4 gap-4 items-center">
                  <div>
                    <h3 className="font-bold mb-1">{event.title}</h3>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Date</div>
                    <div className="font-semibold">{event.date}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Time</div>
                    <div className="font-semibold">{event.time}</div>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline" className="mb-2">{event.type}</Badge>
                    <div className="text-sm text-muted-foreground">{event.attendees} attendees</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Community Guidelines */}
        <div className="mb-16">
          <Card className="p-8 gradient-card shadow-card">
            <h2 className="text-2xl font-bold mb-6 text-center">Community Guidelines</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Be Respectful</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Treat all members with respect and professionalism</li>
                  <li>• Use inclusive language and avoid discriminatory comments</li>
                  <li>• Respect different opinions and perspectives</li>
                  <li>• Keep discussions constructive and helpful</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Share Value</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Share insights, tips, and experiences that help others</li>
                  <li>• Ask thoughtful questions and provide helpful answers</li>
                  <li>• Celebrate others' successes and achievements</li>
                  <li>• Contribute to meaningful discussions</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Join Community */}
        <div className="text-center">
          <Card className="p-8 gradient-card shadow-card">
            <div className="w-16 h-16 rounded-xl gradient-pulse flex items-center justify-center mx-auto mb-4 shadow-pulse">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Connect with like-minded professionals, share your success stories, and learn from others who are building their LinkedIn presence with AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth/register">
                <Button size="lg" className="gap-2">
                  <Users className="h-4 w-4" />
                  Join Community
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
