import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const testimonials = [
  {
    name: "Priya S.",
    role: "Content Creator",
    verified: true,
    content: "I've been testing LinkedInPulse for 2 weeks. The persona feature actually learns my writing style—no more generic AI posts. Still experimenting, but early results are promising.",
    initials: "PS"
  },
  {
    name: "Raj M.",
    role: "Tech Founder",
    verified: true,
    content: "As someone who struggled with consistent LinkedIn posting, this tool helps me maintain presence without spending hours writing. The comment generator saves me at least 30 mins daily.",
    initials: "RM"
  },
  {
    name: "Alex K.",
    role: "Marketing Professional",
    verified: true,
    content: "Transparency matters: I edit every AI-generated post before sharing. But having a solid draft as a starting point has cut my content creation time by 60%. That's real value.",
    initials: "AK"
  },
  {
    name: "Ananya R.",
    role: "Career Coach",
    verified: true,
    content: "I was skeptical about AI content tools, but the free trial convinced me. My engagement hasn't 'skyrocketed,' but I'm posting 3x more consistently, and that consistency is building my brand.",
    initials: "AR"
  }
];

export const Testimonials = () => {
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
              <p className="text-sm text-muted-foreground italic leading-relaxed">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center gap-3 pt-4 border-t">
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                    {testimonial.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-sm">{testimonial.name}</div>
                    {testimonial.verified && (
                      <Badge variant="secondary" className="text-xs h-5">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {testimonial.role}
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
