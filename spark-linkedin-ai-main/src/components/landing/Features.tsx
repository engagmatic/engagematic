import { Card } from "@/components/ui/card";
import { Sparkles, MessageSquare, TrendingUp, Zap, Copy, Users } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Persona Engine",
    description: "AI learns your unique voice and style to create authentic content that sounds like you."
  },
  {
    icon: Zap,
    title: "Viral Hook Selector",
    description: "Choose from proven hooks that stop the scroll and drive engagement."
  },
  {
    icon: MessageSquare,
    title: "Genuine Comment Generator",
    description: "Create thoughtful, human comments that build real relationships."
  },
  {
    icon: TrendingUp,
    title: "Analytics Dashboard",
    description: "Track your pulse meter and see your engagement grow in real-time."
  },
  {
    icon: Copy,
    title: "One-Click Copy/Paste",
    description: "Instantly copy your AI-generated content and paste directly into LinkedIn."
  },
  {
    icon: Sparkles,
    title: "Engagement Boost",
    description: "Proven to increase engagement by 6x with authentic, strategic content."
  }
];

export const Features = () => {
  return (
    <section id="features" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold">
            Everything You Need to{" "}
            <span className="gradient-pulse bg-clip-text text-transparent">Boost Your Pulse</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to amplify your LinkedIn presence and drive authentic engagement.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="p-6 hover-lift gradient-card border-border/50 group"
              >
                <div className="w-12 h-12 rounded-xl gradient-pulse flex items-center justify-center mb-4 shadow-pulse group-hover:animate-heartbeat">
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
