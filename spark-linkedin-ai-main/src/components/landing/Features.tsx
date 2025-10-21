import { Card } from "@/components/ui/card";
import { Sparkles, MessageSquare, TrendingUp, Zap, Users, Target } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "AI Persona Engine",
    description: "Learns your unique voice & creates authentic content that sounds like YOU - not robotic AI."
  },
  {
    icon: Target,
    title: "Profile Analyzer",
    description: "Get AI-powered profile score & optimization tips to boost your LinkedIn visibility & engagement."
  },
  {
    icon: MessageSquare,
    title: "Smart Comment AI",
    description: "Generate genuine comments that build real professional relationships & conversations."
  },
  {
    icon: TrendingUp,
    title: "Content Templates",
    description: "Ready-to-use templates for different types of LinkedIn content and industries."
  }
];

export const Features = () => {
  return (
    <section id="features" className="py-12 sm:py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 sm:mb-16 space-y-3 sm:space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold px-4">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Create Better Content</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            AI-powered tools to help you create engaging LinkedIn posts, comments, and content that resonates with your audience.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="p-6 hover-lift bg-card/50 backdrop-blur-sm border-border/50 group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
