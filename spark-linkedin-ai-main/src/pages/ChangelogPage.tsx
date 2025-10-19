import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, Star, Bug, Plus, ArrowRight, Download } from "lucide-react";
import { Link } from "react-router-dom";

const ChangelogPage = () => {
  const changelogEntries = [
    {
      version: "v2.1.0",
      date: "January 15, 2025",
      type: "major",
      title: "Enhanced AI Models & Personalization",
      description: "Major update with improved AI content generation and better personalization features",
      changes: [
        {
          type: "feature",
          title: "Advanced AI Personalization",
          description: "AI now better understands your writing style and creates more authentic content"
        },
        {
          type: "feature",
          title: "Multi-Persona Support",
          description: "Create and manage multiple personas for different content types and audiences"
        },
        {
          type: "enhancement",
          title: "Improved Content Quality",
          description: "Enhanced content generation algorithms for better engagement and authenticity"
        },
        {
          type: "fix",
          title: "Bug Fixes",
          description: "Fixed several issues with content generation and user interface"
        }
      ]
    },
    {
      version: "v2.0.5",
      date: "January 10, 2025",
      type: "minor",
      title: "New Template Library",
      description: "Added extensive template library with industry-specific content templates",
      changes: [
        {
          type: "feature",
          title: "Template Library",
          description: "Added 50+ new content templates across different industries and use cases"
        },
        {
          type: "feature",
          title: "Template Categories",
          description: "Organized templates by industry, content type, and engagement level"
        },
        {
          type: "enhancement",
          title: "Template Search",
          description: "Improved search functionality for finding the right templates quickly"
        }
      ]
    },
    {
      version: "v2.0.0",
      date: "January 5, 2025",
      type: "major",
      title: "Mobile App Launch",
      description: "Launch of LinkedInPulse mobile app with full feature parity",
      changes: [
        {
          type: "feature",
          title: "Mobile App",
          description: "Native mobile app for iOS and Android with full feature support"
        },
        {
          type: "feature",
          title: "Offline Mode",
          description: "Create and edit content even when offline, sync when connected"
        },
        {
          type: "feature",
          title: "Push Notifications",
          description: "Get notified about content performance and engagement updates"
        },
        {
          type: "enhancement",
          title: "Mobile-Optimized UI",
          description: "Redesigned interface optimized for mobile devices"
        }
      ]
    },
    {
      version: "v1.9.2",
      date: "December 28, 2024",
      type: "minor",
      title: "Analytics Dashboard",
      description: "New comprehensive analytics dashboard with detailed performance metrics",
      changes: [
        {
          type: "feature",
          title: "Analytics Dashboard",
          description: "Comprehensive dashboard showing content performance and engagement metrics"
        },
        {
          type: "feature",
          title: "Performance Tracking",
          description: "Track engagement rates, reach, and other key metrics for your content"
        },
        {
          type: "feature",
          title: "Export Reports",
          description: "Export analytics data to CSV and PDF formats"
        },
        {
          type: "enhancement",
          title: "Data Visualization",
          description: "Interactive charts and graphs for better data understanding"
        }
      ]
    },
    {
      version: "v1.9.0",
      date: "December 20, 2024",
      type: "minor",
      title: "LinkedIn Integration Improvements",
      description: "Enhanced LinkedIn integration with better posting and scheduling features",
      changes: [
        {
          type: "feature",
          title: "Scheduled Posting",
          description: "Schedule posts to be published at optimal times automatically"
        },
        {
          type: "feature",
          title: "Multi-Account Support",
          description: "Manage multiple LinkedIn accounts from a single LinkedInPulse account"
        },
        {
          type: "enhancement",
          title: "Post Preview",
          description: "Preview how your posts will look on LinkedIn before publishing"
        },
        {
          type: "fix",
          title: "Connection Issues",
          description: "Fixed issues with LinkedIn account connection and authentication"
        }
      ]
    },
    {
      version: "v1.8.5",
      date: "December 10, 2024",
      type: "patch",
      title: "Performance Improvements",
      description: "Various performance improvements and bug fixes",
      changes: [
        {
          type: "enhancement",
          title: "Faster Content Generation",
          description: "Improved AI processing speed for faster content generation"
        },
        {
          type: "enhancement",
          title: "Better Error Handling",
          description: "Improved error messages and handling for better user experience"
        },
        {
          type: "fix",
          title: "UI Fixes",
          description: "Fixed various UI issues and improved responsive design"
        },
        {
          type: "fix",
          title: "Authentication Issues",
          description: "Resolved issues with user authentication and session management"
        }
      ]
    }
  ];

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'feature':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'enhancement':
        return <Star className="h-4 w-4 text-blue-500" />;
      case 'fix':
        return <Bug className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getChangeBadgeColor = (type: string) => {
    switch (type) {
      case 'feature':
        return 'bg-green-500';
      case 'enhancement':
        return 'bg-blue-500';
      case 'fix':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getVersionBadgeColor = (type: string) => {
    switch (type) {
      case 'major':
        return 'bg-purple-500';
      case 'minor':
        return 'bg-blue-500';
      case 'patch':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-xl gradient-pulse flex items-center justify-center mx-auto mb-4 shadow-pulse">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Changelog
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Stay up to date with the latest features, improvements, and fixes in LinkedInPulse. We're constantly working to make your experience better.
          </p>
        </div>

        {/* Changelog Entries */}
        <div className="space-y-8">
          {changelogEntries.map((entry, index) => (
            <Card key={index} className="p-8 gradient-card shadow-card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Badge className={getVersionBadgeColor(entry.type)}>
                      {entry.version}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Calendar className="h-3 w-3" />
                      {entry.date}
                    </Badge>
                  </div>
                </div>
                <Badge className={getVersionBadgeColor(entry.type)}>
                  {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)} Release
                </Badge>
              </div>

              <h2 className="text-2xl font-bold mb-3">{entry.title}</h2>
              <p className="text-muted-foreground mb-6">{entry.description}</p>

              <div className="space-y-4">
                {entry.changes.map((change, changeIndex) => (
                  <div key={changeIndex} className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      {getChangeIcon(change.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`${getChangeBadgeColor(change.type)} text-xs`}>
                          {change.type.charAt(0).toUpperCase() + change.type.slice(1)}
                        </Badge>
                        <h3 className="font-semibold">{change.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{change.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Subscribe to Updates */}
        <div className="mt-16">
          <Card className="p-8 gradient-card shadow-card text-center">
            <div className="w-16 h-16 rounded-xl gradient-pulse flex items-center justify-center mx-auto mb-4 shadow-pulse">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Get notified about new releases, features, and updates. Be the first to know about what's coming next.
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

        {/* Download Release Notes */}
        <div className="mt-8 text-center">
          <Button variant="outline" size="lg" className="gap-2">
            <Download className="h-4 w-4" />
            Download Release Notes PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChangelogPage;
