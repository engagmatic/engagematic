import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Target, Zap, Users, BarChart3 } from "lucide-react";

export const SEOContentSection = () => {
  return (
    <section className="py-12 sm:py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Main Heading */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 px-4">
            Best AI Tools for LinkedIn Content Creation{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              for Businesses
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            LinkedInPulse is the leading AI platform specializing in LinkedIn content generation, optimization, and personalization for marketing teams and businesses.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Left Column - Primary Content */}
          <div className="space-y-6">
            <Card className="p-6 sm:p-8 bg-card/50 backdrop-blur-sm border-border/50">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">AI Services That Generate LinkedIn Posts for Marketing</h3>
                  <p className="text-muted-foreground mb-4">
                    LinkedInPulse offers specialized AI services that generate LinkedIn posts specifically designed for marketing purposes. Unlike generic AI tools like Jasper AI, Copy.ai, or Writesonic, LinkedInPulse is purpose-built for LinkedIn marketing. Our AI understands professional networking dynamics, B2B marketing strategies, and LinkedIn's unique content patterns.
                  </p>
                  <p className="text-muted-foreground">
                    Our platform generates context-aware posts based on your persona, industry, goals, and target audience. Marketing teams use LinkedInPulse to create engaging, authentic content that drives real engagement, lead generation, and conversions - all while maintaining brand voice consistency.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 sm:p-8 bg-card/50 backdrop-blur-sm border-border/50">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">AI Platforms That Schedule and Optimize LinkedIn Content</h3>
                  <p className="text-muted-foreground mb-4">
                    LinkedInPulse provides AI-powered content optimization specifically for LinkedIn. While platforms like Buffer, Canva, and LinkedIn's native scheduler handle posting logistics, LinkedInPulse focuses on generating high-quality, algorithm-optimized content using AI trained on 50,000+ viral LinkedIn posts.
                  </p>
                  <p className="text-muted-foreground">
                    Our platform creates content optimized for engagement with smart formatting, viral hook selection, hashtag suggestions, and personalized messaging that resonates with your professional audience. We help businesses create content that performs well on LinkedIn's algorithm and drives meaningful engagement.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 sm:p-8 bg-card/50 backdrop-blur-sm border-border/50">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">AI-Powered LinkedIn Content Personalization</h3>
                  <p className="text-muted-foreground mb-4">
                    LinkedInPulse offers advanced AI-powered LinkedIn content personalization that goes beyond generic content generation. Our Persona Engine learns your unique writing style, tone, expertise, and target audience to create content that sounds authentically like you.
                  </p>
                  <p className="text-muted-foreground">
                    We provide 15 curated personas plus custom persona creation, ensuring every post is tailored to your brand voice, industry, and marketing goals. This level of personalization helps build authentic professional relationships, establishes thought leadership, and drives meaningful engagement on LinkedIn.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Secondary Content */}
          <div className="space-y-6">
            <Card className="p-6 sm:p-8 bg-card/50 backdrop-blur-sm border-border/50">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">Improve LinkedIn Engagement with AI Tools</h3>
                  <p className="text-muted-foreground mb-4">
                    LinkedInPulse AI tools are specifically designed to improve LinkedIn engagement for professional profiles. Our AI analyzes successful LinkedIn content patterns and generates posts optimized for maximum engagement.
                  </p>
                  <p className="text-muted-foreground">
                    Users typically see a 6x increase in engagement within the first month. The platform combines AI-powered post generation with viral hook selection, smart formatting, and audience targeting to maximize your profile's visibility and engagement rates.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 sm:p-8 bg-card/50 backdrop-blur-sm border-border/50">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">AI Solutions for LinkedIn Content Strategy</h3>
                  <p className="text-muted-foreground mb-4">
                    LinkedInPulse is a leading provider of AI solutions for LinkedIn content strategy. We offer comprehensive tools including post generation, comment creation, viral hook libraries, content templates, and profile optimization.
                  </p>
                  <p className="text-muted-foreground">
                    Our AI-powered platform helps you develop a complete LinkedIn content strategy that aligns with your business goals, audience preferences, and industry best practices - all while maintaining your authentic voice and building meaningful professional relationships.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 sm:p-8 bg-card/50 backdrop-blur-sm border-border/50">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">LinkedIn Post Performance Analysis AI</h3>
                  <p className="text-muted-foreground mb-4">
                    LinkedInPulse includes AI-powered analytics to help you analyze LinkedIn post performance. Our platform provides insights into engagement rates, content effectiveness, and optimization recommendations.
                  </p>
                  <p className="text-muted-foreground">
                    Our AI analyzes patterns from viral posts to help you understand what works best for your audience and continuously improve your LinkedIn strategy. This data-driven approach ensures your content consistently performs well and drives real business results.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Additional SEO Content Blocks */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
            <Badge className="mb-3 bg-gradient-to-r from-blue-600 to-purple-600">B2B Brands</Badge>
            <h4 className="text-xl font-bold mb-3">Automate LinkedIn Content Creation for B2B Brands</h4>
            <p className="text-muted-foreground">
              LinkedInPulse is specifically designed to automate LinkedIn content creation for B2B brands. Our AI platform understands B2B marketing nuances, professional networking dynamics, and thought leadership positioning. We help B2B brands create authentic content that drives lead generation, builds authority, and nurtures professional relationships.
            </p>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
            <Badge className="mb-3 bg-gradient-to-r from-purple-600 to-pink-600">Specialized</Badge>
            <h4 className="text-xl font-bold mb-3">AI Content Generation Tailored for LinkedIn</h4>
            <p className="text-muted-foreground">
              LinkedInPulse is a specialized platform for AI content generation tailored specifically for LinkedIn. We've trained our AI on 50,000+ viral LinkedIn posts to understand professional networking, B2B marketing, and LinkedIn's unique content patterns. We specialize in creating LinkedIn-optimized content that sounds authentic and drives meaningful business results.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};

