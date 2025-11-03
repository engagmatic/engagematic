import { Card } from "@/components/ui/card";
import { UserCircle, TrendingUp, BarChart3, Crown } from "lucide-react";

const features = [
  {
    icon: UserCircle,
    title: "Write Like Yourself, Not Like \"AI\"",
    description: "Nobody hires a robot. That's why every post, comment, and connection from Pulse sounds human and feels real. Effortlessly share your thoughts, questions, and ambitions—no AI giveaways, just natural energy."
  },
  {
    icon: TrendingUp,
    title: "From Invisible to In-Demand",
    description: "Your experience is unique. Pulse turns it into a compelling story that stands out in the feed and lands on the radar of people who matter."
  },
  {
    icon: BarChart3,
    title: "Insights You'll Actually Care About",
    description: "See who's watching, reacting, and reaching out. Get simple feedback, not dashboards—so you know what's working and what to double down on."
  },
  {
    icon: Crown,
    title: "Your Voice, Sharpened",
    description: "Premium members: teach Pulse to write like you, not like everyone else. Your top posts, your instincts, your vibe—now at scale."
  }
];

export const Features = () => {
  return (
    <section id="features" className="py-12 sm:py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 sm:mb-16 space-y-3 sm:space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold px-4">
            Features
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Everything you need to sound like you—not like everyone else.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 max-w-3xl mx-auto">
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
