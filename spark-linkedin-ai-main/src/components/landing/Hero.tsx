import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowRight, Play, Sparkles, Wand2, MessageSquare, TrendingUp, User } from "lucide-react";
import heroImage from "@/assets/hero-pulse.jpg";

const features = [
  {
    icon: User,
    title: "Persona Engine",
    description: "AI learns your unique voice and writing style for authentic content",
    color: "text-blue-500"
  },
  {
    icon: TrendingUp,
    title: "Viral Hook Selector",
    description: "Proven templates that stop the scroll and boost engagement",
    color: "text-green-500"
  },
  {
    icon: MessageSquare,
    title: "Smart Comment Generator",
    description: "Genuine, human-like comments that build real connections",
    color: "text-purple-500"
  },
  {
    icon: Wand2,
    title: "Pulse Analytics",
    description: "Track performance and optimize your LinkedIn growth strategy",
    color: "text-pink-500"
  }
];

export const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center gradient-hero overflow-hidden">
      {/* Animated pulse circles */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-glow animation-delay-1000" />
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in-up">
              <Badge className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
              <Sparkles className="w-4 h-4" />
              7-Day Free Trial • No Credit Card Required
            </Badge>
            
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight">
              Stop Staring at a
              Blank Screen.{" "}
              <span className="gradient-pulse bg-clip-text text-transparent">
                Start Growing
              </span>{" "}
              on LinkedIn.
            </h1>
            
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-2xl leading-relaxed">
              LinkedInPulse turns your ideas into viral-worthy posts in seconds. 
              <span className="text-foreground font-medium"> Authentic voice. Real engagement. Zero writer's block.</span>
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="group shadow-pulse hover-pulse text-base h-14 px-8">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline" className="group text-base h-14 px-8">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                Free 7-day trial, then from ₹299/mo or $9/mo
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                Up to 300 posts & comments/month • Cancel anytime
              </div>
            </div>
            
            <div className="flex items-center gap-6 lg:gap-8 pt-6 border-t border-border/50">
              <div>
                <div className="text-2xl lg:text-3xl font-bold text-foreground">500+</div>
                <div className="text-xs lg:text-sm text-muted-foreground">Beta Users</div>
              </div>
              <div className="h-10 w-px bg-border/50" />
              <div>
                <div className="text-2xl lg:text-3xl font-bold text-foreground">50K+</div>
                <div className="text-xs lg:text-sm text-muted-foreground">Posts Generated</div>
              </div>
              <div className="h-10 w-px bg-border/50" />
              <div>
                <div className="text-2xl lg:text-3xl font-bold text-foreground">3x</div>
                <div className="text-xs lg:text-sm text-muted-foreground">Faster Content</div>
              </div>
            </div>
          </div>
          
          <div className="relative animate-fade-in-up animation-delay-300">
            <div className="absolute inset-0 gradient-pulse opacity-20 blur-3xl rounded-3xl" />
            <img 
              src={heroImage} 
              alt="LinkedInPulse Dashboard Preview" 
              className="relative rounded-3xl shadow-elevated hover-lift w-full"
            />
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mt-20 pt-12 border-t border-border/50">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index}
                  className="p-6 gradient-card border hover-lift group cursor-pointer"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${feature.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
