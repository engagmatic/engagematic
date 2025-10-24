import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Copy, Download, Star, Users, Calendar, TrendingUp, Check, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { PAGE_SEO } from "@/constants/seo";

const TemplatesPage = () => {
  const { toast } = useToast();
  const [copiedTemplates, setCopiedTemplates] = useState(new Set());
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const handleCopyTemplate = async (template, templateIndex, categoryIndex = null) => {
    try {
      await navigator.clipboard.writeText(template.preview);
      const templateId = categoryIndex !== null ? `${categoryIndex}-${templateIndex}` : `popular-${templateIndex}`;
      setCopiedTemplates(prev => new Set([...prev, templateId]));
      
      toast({
        title: "Template copied! 📋",
        description: "Template copied to clipboard. Ready to customize!",
      });

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedTemplates(prev => {
          const newSet = new Set(prev);
          newSet.delete(templateId);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy template to clipboard",
        variant: "destructive",
      });
    }
  };

  const handlePreviewTemplate = (template) => {
    setPreviewTemplate(template);
  };

  const handleUseTemplate = (template) => {
    // Navigate to post generator with template pre-filled
    const templateData = {
      title: template.title,
      content: template.preview,
      category: template.category
    };
    
    // Store template data in localStorage for post generator to use
    localStorage.setItem('selectedTemplate', JSON.stringify(templateData));
    
    toast({
      title: "Template selected! 🎯",
      description: "Redirecting to Post Generator with your template...",
    });

    // Navigate to post generator
    window.location.href = '/post-generator';
  };

  const templateCategories = [
    {
      title: "Personal Branding",
      icon: "🎯",
      description: "Build your personal brand with authentic, engaging content",
      templates: [
        {
          title: "Career Journey Story",
          description: "Share your professional journey and lessons learned",
          category: "Personal Branding",
          downloads: 1250,
          rating: 4.9,
          preview: "I started my career as a junior developer 5 years ago. Today, I'm leading a team of 12 engineers. Here's what I learned along the way..."
        },
        {
          title: "Behind-the-Scenes Content",
          description: "Show the human side of your work and daily routine",
          category: "Personal Branding",
          downloads: 980,
          rating: 4.8,
          preview: "What does a typical day look like for a [your role]? Here's a peek behind the curtain..."
        },
        {
          title: "Industry Insights",
          description: "Share your expertise and thought leadership",
          category: "Personal Branding",
          downloads: 2100,
          rating: 4.9,
          preview: "After 10 years in [industry], I've noticed a pattern that most people miss..."
        }
      ]
    },
    {
      title: "Business & Entrepreneurship",
      icon: "💼",
      description: "Content for entrepreneurs and business leaders",
      templates: [
        {
          title: "Startup Lessons",
          description: "Share lessons from building and scaling a business",
          category: "Business",
          downloads: 850,
          rating: 4.7,
          preview: "3 years ago, I started [company name] with just an idea. Today, we're serving 10,000+ customers. Here are the 5 biggest lessons..."
        },
        {
          title: "Leadership Insights",
          description: "Share your leadership philosophy and experiences",
          category: "Business",
          downloads: 1200,
          rating: 4.8,
          preview: "The best leaders I've worked with all share one trait: [insight]. Here's why it matters..."
        },
        {
          title: "Business Growth Tips",
          description: "Share strategies for growing and scaling businesses",
          category: "Business",
          downloads: 1500,
          rating: 4.9,
          preview: "Most businesses fail because they focus on the wrong metrics. Here's what you should track instead..."
        }
      ]
    },
    {
      title: "Technology & Innovation",
      icon: "🚀",
      description: "Content for tech professionals and innovators",
      templates: [
        {
          title: "Tech Trend Analysis",
          description: "Share insights on emerging technologies and trends",
          category: "Technology",
          downloads: 1800,
          rating: 4.8,
          preview: "Everyone's talking about [technology], but most people are missing the real opportunity. Here's what's actually happening..."
        },
        {
          title: "Coding & Development",
          description: "Share coding tips, best practices, and technical insights",
          category: "Technology",
          downloads: 2200,
          rating: 4.9,
          preview: "After debugging this issue for 3 hours, I finally found the solution. Here's what I learned..."
        },
        {
          title: "AI & Machine Learning",
          description: "Share insights on AI, ML, and data science",
          category: "Technology",
          downloads: 1600,
          rating: 4.7,
          preview: "AI is changing everything, but most companies are implementing it wrong. Here's the right approach..."
        }
      ]
    },
    {
      title: "Sales & Marketing",
      icon: "📈",
      description: "Content for sales and marketing professionals",
      templates: [
        {
          title: "Sales Strategies",
          description: "Share proven sales techniques and strategies",
          category: "Sales",
          downloads: 1400,
          rating: 4.8,
          preview: "I've closed $2M in deals this quarter using this simple framework. Here's how it works..."
        },
        {
          title: "Marketing Insights",
          description: "Share marketing strategies and campaign insights",
          category: "Marketing",
          downloads: 1900,
          rating: 4.9,
          preview: "This marketing campaign generated 500% ROI. Here's the strategy behind it..."
        },
        {
          title: "Customer Success Stories",
          description: "Share success stories and case studies",
          category: "Marketing",
          downloads: 1100,
          rating: 4.7,
          preview: "Our client increased their revenue by 300% in 6 months. Here's how we did it..."
        }
      ]
    }
  ];

  const popularTemplates = [
    {
      title: "The Hook Template",
      description: "Start with a compelling hook that grabs attention",
      category: "General",
      downloads: 5000,
      rating: 4.9,
      preview: "I made a mistake that cost me $10,000. Here's what I learned..."
    },
    {
      title: "The Question Template",
      description: "Engage your audience with thought-provoking questions",
      category: "General",
      downloads: 4200,
      rating: 4.8,
      preview: "What if I told you that everything you know about [topic] is wrong?"
    },
    {
      title: "The Story Template",
      description: "Share personal stories that connect with your audience",
      category: "General",
      downloads: 3800,
      rating: 4.9,
      preview: "3 years ago, I was [situation]. Today, I'm [current state]. Here's what changed..."
    },
    {
      title: "The Insight Template",
      description: "Share unique insights and perspectives",
      category: "General",
      downloads: 3600,
      rating: 4.8,
      preview: "After analyzing 1000+ [data point], I discovered something surprising..."
    }
  ];

  return (
    <div className="min-h-screen gradient-hero">
      <SEO {...PAGE_SEO.templates} />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-xl gradient-pulse flex items-center justify-center mx-auto mb-4 shadow-pulse">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Content{" "}
            <span className="bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent">
              Templates
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Ready-to-use templates for creating engaging LinkedIn content. Choose from our curated collection of proven templates that drive engagement and build your professional presence.
          </p>
        </div>

        {/* Popular Templates */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Most Popular Templates</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularTemplates.map((template, index) => (
              <Card key={index} className="p-6 gradient-card shadow-card hover-lift">
                <div className="flex items-center justify-between mb-4">
                  <Badge className="gradient-pulse">{template.category}</Badge>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{template.rating}</span>
                  </div>
                </div>
                <h3 className="font-bold mb-2">{template.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                <div className="bg-muted/50 p-3 rounded-lg mb-4">
                  <p className="text-sm italic">"{template.preview}"</p>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    <span>{template.downloads.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1 gap-2"
                    onClick={() => handleUseTemplate(template)}
                  >
                    <FileText className="h-3 w-3" />
                    Use Template
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCopyTemplate(template, index)}
                  >
                    {copiedTemplates.has(`popular-${index}`) ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handlePreviewTemplate(template)}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Template Categories */}
        <div className="space-y-12">
          {templateCategories.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">{category.icon}</span>
                <h2 className="text-2xl font-bold">{category.title}</h2>
              </div>
              <p className="text-muted-foreground mb-6">{category.description}</p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.templates.map((template, templateIndex) => (
                  <Card key={templateIndex} className="p-6 gradient-card shadow-card hover-lift">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="outline">{template.category}</Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{template.rating}</span>
                      </div>
                    </div>
                    <h3 className="font-bold mb-2">{template.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                    <div className="bg-muted/50 p-3 rounded-lg mb-4">
                      <p className="text-sm italic">"{template.preview}"</p>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        <span>{template.downloads.toLocaleString()} downloads</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1 gap-2"
                        onClick={() => handleUseTemplate(template)}
                      >
                        <FileText className="h-3 w-3" />
                        Use Template
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCopyTemplate(template, templateIndex, categoryIndex)}
                      >
                        {copiedTemplates.has(`${categoryIndex}-${templateIndex}`) ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePreviewTemplate(template)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Template Benefits */}
        <div className="mt-16">
          <Card className="p-8 gradient-card shadow-card">
            <h2 className="text-2xl font-bold mb-6 text-center">Why Use Our Templates?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-xl gradient-pulse flex items-center justify-center mx-auto mb-4 shadow-pulse">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold mb-2">Proven Results</h3>
                <p className="text-sm text-muted-foreground">Templates based on high-performing LinkedIn content patterns</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-xl gradient-pulse flex items-center justify-center mx-auto mb-4 shadow-pulse">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold mb-2">Community Tested</h3>
                <p className="text-sm text-muted-foreground">Templates used and refined by thousands of professionals</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-xl gradient-pulse flex items-center justify-center mx-auto mb-4 shadow-pulse">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold mb-2">Save Time</h3>
                <p className="text-sm text-muted-foreground">Create engaging content in minutes, not hours</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-xl gradient-pulse flex items-center justify-center mx-auto mb-4 shadow-pulse">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold mb-2">High Quality</h3>
                <p className="text-sm text-muted-foreground">Curated templates that maintain professional standards</p>
              </div>
            </div>
          </Card>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Card className="p-8 gradient-card shadow-card">
            <h2 className="text-2xl font-bold mb-4">Ready to Create Amazing Content?</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Start using our templates today and transform your LinkedIn presence with engaging, professional content.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth/register">
                <Button size="lg" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Get Started Free
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg">
                  Request Custom Template
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Preview Modal */}
        {previewTemplate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">{previewTemplate.title}</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewTemplate(null)}
                  >
                    ✕
                  </Button>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Description:</h4>
                    <p className="text-muted-foreground">{previewTemplate.description}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Template Preview:</h4>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="italic">"{previewTemplate.preview}"</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={() => handleUseTemplate(previewTemplate)} className="flex-1">
                      <FileText className="h-4 w-4 mr-2" />
                      Use This Template
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleCopyTemplate(previewTemplate, 0)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplatesPage;
