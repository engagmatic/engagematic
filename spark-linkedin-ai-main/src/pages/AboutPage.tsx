import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Users, Target, Heart, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const AboutPage = () => {
  return (
    <div className="min-h-screen gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            About{" "}
            <span className="gradient-pulse bg-clip-text text-transparent">LinkedInPulse</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're on a mission to help professionals build authentic, engaging LinkedIn presences that drive real business results.
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-16">
          <Card className="p-8 gradient-card shadow-card">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <Badge className="mb-4 gradient-pulse">Our Mission</Badge>
                <h2 className="text-3xl font-bold mb-6">
                  Empowering Professionals to Build Authentic LinkedIn Presence
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  LinkedIn has become the world's largest professional network, but most professionals struggle to create content that resonates and drives engagement. We believe that authentic, AI-assisted content creation is the future of professional networking.
                </p>
                <p className="text-lg text-muted-foreground mb-6">
                  LinkedInPulse combines the power of artificial intelligence with human authenticity to help you create content that sounds like you, engages your audience, and builds meaningful professional relationships.
                </p>
                <div className="flex items-center gap-4">
                  <Link to="/auth/register">
                    <Button size="lg" className="gap-2">
                      Start Your Journey
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/blogs">
                    <Button variant="outline" size="lg">
                      Read Our Blog
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="w-full h-96 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                  <Activity className="h-32 w-32 text-primary/50" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              These principles guide everything we do and every decision we make.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 gradient-card shadow-card hover-lift text-center">
              <div className="w-16 h-16 rounded-xl gradient-pulse flex items-center justify-center mx-auto mb-4 shadow-pulse">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Authenticity</h3>
              <p className="text-muted-foreground">
                We believe in authentic content that reflects your true voice and values, not generic AI-generated text.
              </p>
            </Card>
            <Card className="p-6 gradient-card shadow-card hover-lift text-center">
              <div className="w-16 h-16 rounded-xl gradient-pulse flex items-center justify-center mx-auto mb-4 shadow-pulse">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Results-Driven</h3>
              <p className="text-muted-foreground">
                Every feature we build is designed to help you achieve measurable results in your professional growth.
              </p>
            </Card>
            <Card className="p-6 gradient-card shadow-card hover-lift text-center">
              <div className="w-16 h-16 rounded-xl gradient-pulse flex items-center justify-center mx-auto mb-4 shadow-pulse">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Community First</h3>
              <p className="text-muted-foreground">
                We're building a community of professionals who support and learn from each other's LinkedIn journeys.
              </p>
            </Card>
            <Card className="p-6 gradient-card shadow-card hover-lift text-center">
              <div className="w-16 h-16 rounded-xl gradient-pulse flex items-center justify-center mx-auto mb-4 shadow-pulse">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Innovation</h3>
              <p className="text-muted-foreground">
                We continuously innovate to stay ahead of LinkedIn's algorithm and provide cutting-edge content strategies.
              </p>
            </Card>
          </div>
        </div>

        {/* Story Section */}
        <div className="mb-16">
          <Card className="p-8 gradient-card shadow-card">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="relative">
                <div className="w-full h-96 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-lg flex items-center justify-center">
                  <Users className="h-32 w-32 text-secondary/50" />
                </div>
              </div>
              <div>
                <Badge className="mb-4 gradient-pulse">Our Story</Badge>
                <h2 className="text-3xl font-bold mb-6">
                  Born from Real Professional Challenges
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  LinkedInPulse was founded by a team of marketing professionals who struggled with creating consistent, engaging LinkedIn content. We spent hours crafting posts that barely got any engagement, while watching others effortlessly build massive followings.
                </p>
                <p className="text-lg text-muted-foreground mb-6">
                  We realized that the problem wasn't lack of expertise—it was lack of time, consistency, and the right tools. That's when we decided to build LinkedInPulse: a platform that combines AI efficiency with human authenticity.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Founded by LinkedIn marketing experts</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Used by 10,000+ professionals worldwide</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Featured in Forbes, Entrepreneur, and TechCrunch</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're a diverse team of marketers, developers, and LinkedIn experts passionate about helping professionals succeed.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 gradient-card shadow-card hover-lift text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Sarah Chen</h3>
              <p className="text-primary font-medium mb-2">CEO & Co-Founder</p>
              <p className="text-muted-foreground text-sm">
                LinkedIn marketing expert with 8+ years helping Fortune 500 companies build authentic professional brands.
              </p>
            </Card>
            <Card className="p-6 gradient-card shadow-card hover-lift text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Activity className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Marcus Rodriguez</h3>
              <p className="text-primary font-medium mb-2">CTO & Co-Founder</p>
              <p className="text-muted-foreground text-sm">
                AI researcher and full-stack developer passionate about making AI accessible and authentic for professionals.
              </p>
            </Card>
            <Card className="p-6 gradient-card shadow-card hover-lift text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Target className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Jennifer Walsh</h3>
              <p className="text-primary font-medium mb-2">Head of Growth</p>
              <p className="text-muted-foreground text-sm">
                Growth marketing specialist who helped scale multiple SaaS companies from startup to acquisition.
              </p>
            </Card>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-16">
          <Card className="p-8 gradient-card shadow-card">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Our Impact</h2>
              <p className="text-lg text-muted-foreground">
                Numbers that reflect our commitment to helping professionals succeed on LinkedIn.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
                <div className="text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">2.5M+</div>
                <div className="text-muted-foreground">Posts Generated</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">85%</div>
                <div className="text-muted-foreground">Engagement Increase</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">50+</div>
                <div className="text-muted-foreground">Countries Served</div>
              </div>
            </div>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="p-8 gradient-card shadow-card">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your LinkedIn Presence?</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of professionals who are already using LinkedInPulse to build authentic, engaging LinkedIn content that drives real results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth/register">
                <Button size="lg" className="gap-2">
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg">
                  Contact Us
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
