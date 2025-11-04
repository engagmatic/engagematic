import { Card } from "@/components/ui/card";
import { UserCircle, TrendingUp, BarChart3, Crown } from "lucide-react";
import { useEffect, useState } from "react";

const features = [
  {
    icon: UserCircle,
    title: "Write Like Yourself, Not Like \"AI\"",
    description: "Every post sounds authentically you. No robotic templates—just your natural voice, amplified.",
    gradient: "from-blue-500 via-purple-500 to-pink-500",
    shadowColor: "shadow-blue-500/20"
  },
  {
    icon: TrendingUp,
    title: "From Invisible to In-Demand",
    description: "Turn your unique experience into stories that grab attention and connect with the right people.",
    gradient: "from-purple-500 via-pink-500 to-orange-500",
    shadowColor: "shadow-purple-500/20"
  },
  {
    icon: BarChart3,
    title: "Insights You'll Actually Care About",
    description: "Simple, actionable feedback on what's working—not overwhelming dashboards you'll never check.",
    gradient: "from-indigo-500 via-blue-500 to-cyan-500",
    shadowColor: "shadow-indigo-500/20"
  },
  {
    icon: Crown,
    title: "Your Voice, Sharpened",
    description: "Teach Pulse your writing style. Your best posts, your instincts, your vibe—now on autopilot.",
    gradient: "from-pink-500 via-rose-500 to-orange-500",
    shadowColor: "shadow-pink-500/20"
  }
];

export const Features = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section id="features" className="py-16 sm:py-20 md:py-24 lg:py-28 relative overflow-hidden bg-gray-50 dark:bg-slate-950">
      {/* Subtle dotted background pattern */}
      <div className="absolute inset-0 opacity-40 dark:opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(0,0,0,0.08)_1px,_transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.08)_1px,_transparent_0)] [background-size:24px_24px]" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20 space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-50">
            What You Get
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Everything you need to sound like you—not like everyone else.
          </p>
        </div>

        {/* Features Grid - Perfect Square Cards - 2x2 Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className={`group relative p-6 sm:p-7 bg-white dark:bg-slate-900 border-0 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden aspect-square flex flex-col ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{
                  transitionDelay: `${index * 50}ms`
                }}
              >
                {/* Icon Container - Clean and Simple */}
                <div className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 flex-shrink-0`}>
                  <Icon className="relative w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={2.5} />
                </div>
                
                {/* Content - Fits completely */}
                <div className="relative z-10 flex flex-col flex-grow">
                  <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-900 dark:text-gray-50 leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
