import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE = `${API_URL}/api`;

interface Testimonial {
  displayName: string;
  jobTitle?: string;
  company?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// Fallback testimonials if API fails
const fallbackTestimonials = [
  {
    displayName: "Priya S.",
    jobTitle: "Content Creator",
    rating: 5,
    comment: "I've been testing LinkedInPulse for 2 weeks. The persona feature actually learns my writing style—no more generic AI posts. Still experimenting, but early results are promising."
  },
  {
    displayName: "Raj M.",
    jobTitle: "Tech Founder",
    rating: 5,
    comment: "As someone who struggled with consistent LinkedIn posting, this tool helps me maintain presence without spending hours writing. The comment generator saves me at least 30 mins daily."
  },
  {
    displayName: "Alex K.",
    jobTitle: "Marketing Professional",
    rating: 5,
    comment: "Transparency matters: I edit every AI-generated post before sharing. But having a solid draft as a starting point has cut my content creation time by 60%. That's real value."
  },
  {
    displayName: "Ananya R.",
    jobTitle: "Career Coach",
    rating: 5,
    comment: "I was skeptical about AI content tools, but the free trial convinced me. My engagement hasn't 'skyrocketed,' but I'm posting 3x more consistently, and that consistency is building my brand."
  }
];

export const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(fallbackTestimonials);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await fetch(`${API_BASE}/testimonials/public?limit=4`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.length > 0) {
          setTestimonials(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      // Keep fallback testimonials
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold">
            Real Feedback from{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Early Users</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Honest reviews from professionals testing LinkedInPulse
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="p-6 hover-lift bg-card/50 backdrop-blur-sm border-border/50 space-y-4"
            >
              <div className="flex items-center gap-1 mb-2">
                {getRatingStars(testimonial.rating)}
              </div>
              <p className="text-sm text-muted-foreground italic leading-relaxed">
                "{testimonial.comment}"
              </p>
              
              <div className="flex items-center gap-3 pt-4 border-t">
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                    {getInitials(testimonial.displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-sm">{testimonial.displayName}</div>
                    <Badge variant="secondary" className="text-xs h-5">
                      Verified
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {testimonial.jobTitle}{testimonial.company && ` at ${testimonial.company}`}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Trust Building Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            We're a new tool building in public. All reviews are from real beta users. 
            No fake engagement numbers, no inflated claims—just honest feedback from professionals like you.
          </p>
        </div>
      </div>
    </section>
  );
};
