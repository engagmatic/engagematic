import { Card } from "@/components/ui/card";
import { Sparkles, MessageSquare, TrendingUp, Zap, Users } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "AI Persona Engine",
    description: "Creates content that matches your professional voice and industry expertise."
  },
  {
    icon: Zap,
    title: "Smart Hook Generator",
    description: "AI-generated hooks designed to grab attention and start conversations."
  },
  {
    icon: MessageSquare,
    title: "Comment Generator",
    description: "Generate thoughtful comments to engage with others' LinkedIn posts."
  },
  {
    icon: TrendingUp,
    title: "Content Templates",
    description: "Ready-to-use templates for different types of LinkedIn content and industries."
  }
];

export const Features = () => {
  return (
    <section id="features" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Create Better Content</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered tools to help you create engaging LinkedIn posts, comments, and content that resonates with your audience.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
