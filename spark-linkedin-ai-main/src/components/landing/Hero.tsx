import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowRight, Play, Sparkles, Star } from "lucide-react";
import heroImage from "@/assets/hero-pulse.jpg";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[90vh] flex items-center gradient-hero overflow-hidden">
      {/* Subtle integration tile grid background (inspired style) */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.65] hidden md:block">
        <div className="absolute left-1/2 -translate-x-1/2 top-[-120px] rotate-6">
          <div className="grid grid-cols-8 lg:grid-cols-10 gap-2 lg:gap-3">
            {Array.from({ length: 70 }).map((_, i) => (
              <div
                key={i}
                className="h-8 w-8 lg:h-10 lg:w-10 rounded-xl border border-yellow-100/40 bg-white/30 backdrop-blur-[2px] shadow-sm"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Animated glow accents */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-glow animation-delay-1000" />
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        {/* Centered hero core */}
        <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in-up">
              <Badge className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
              <Sparkles className="w-4 h-4" />
              7-Day Free Trial • No Credit Card Required
            </Badge>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-tight tracking-tight px-4">
              Never Run Out of{" "}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Content
              </span>{" "}
              Again.
            </h1>            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl leading-relaxed mx-auto px-4">
              <span className="text-foreground font-semibold">AI that writes in your voice.</span> Show up. Stand out.
            </p>

            {/* Feature cards around the headline (premium UI) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {/* Hooks */}
              <div className="rounded-2xl border bg-white shadow-card p-6 hover-lift text-left">
                <div className="text-xs font-semibold text-muted-foreground mb-2">Hooks</div>
                <div className="flex items-center gap-2 mb-2">
                  <img src="https://img.icons8.com/fluency/48/sparkling.png" alt="Hooks" className="h-5 w-5" />
                  <h4 className="text-base font-semibold">50+ viral openings</h4>
                </div>
                <p className="text-sm text-muted-foreground">Proven patterns that stop the scroll and start conversations.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-2 py-1 text-xs rounded-full border bg-muted">Story</span>
                  <span className="px-2 py-1 text-xs rounded-full border bg-muted">Question</span>
                  <span className="px-2 py-1 text-xs rounded-full border bg-muted">Insight</span>
                </div>
              </div>

              {/* Story */}
              <div className="rounded-2xl border bg-white shadow-card p-6 hover-lift text-left">
                <div className="text-xs font-semibold text-muted-foreground mb-2">Story</div>
                <div className="flex items-center gap-2 mb-2">
                  <img src="https://img.icons8.com/fluency/48/speech-bubble.png" alt="Story" className="h-5 w-5" />
                  <h4 className="text-base font-semibold">Your voice</h4>
                </div>
                <p className="text-sm text-muted-foreground">Question, insight, persona. Your authentic voice baked into every post.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-2 py-1 text-xs rounded-full border bg-muted">Persona</span>
                  <span className="px-2 py-1 text-xs rounded-full border bg-muted">Insight</span>
                </div>
              </div>

              {/* Professional */}
              <div className="rounded-2xl border bg-white shadow-card p-6 hover-lift text-left">
                <div className="text-xs font-semibold text-muted-foreground mb-2">Professional</div>
                <div className="flex items-center gap-2 mb-2">
                  <img src="https://img.icons8.com/color/48/combo-chart--v1.png" alt="Professional" className="h-5 w-5" />
                  <h4 className="text-base font-semibold">Optimized to perform</h4>
                </div>
                <p className="text-sm text-muted-foreground">Uses your LinkedIn profile insights, best posting times, and top tags.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-2 py-1 text-xs rounded-full border bg-muted">Best time</span>
                  <span className="px-2 py-1 text-xs rounded-full border bg-muted">Top tags</span>
                  <span className="px-2 py-1 text-xs rounded-full border bg-muted">Tone fit</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center px-4">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth/register')}
                className="group shadow-pulse hover-pulse text-sm sm:text-base h-12 sm:h-14 px-6 sm:px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full sm:w-auto"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank')}
                className="group text-sm sm:text-base h-12 sm:h-14 px-6 sm:px-8 border-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 w-full sm:w-auto"
              >
                Watch Demo
                <Play className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
              </Button>
            </div>

            {/* Social proof below CTAs */}
            <div className="mt-3 flex items-center justify-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-0.5 text-yellow-500">
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
              </div>
              <span>Rated 5/5 by 500+ creators</span>
            </div>

            <div className="flex flex-col gap-3 pt-2 px-4">
              <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span className="font-semibold text-green-600">Free 7-day trial • No credit card required</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Up to 300 posts & comments/month • Cancel anytime</span>
              </div>
            </div>
            
            {/* Trust bar */}
            <div className="pt-6 px-4">
              <div className="text-xs text-muted-foreground mb-3">Trusted by creators and operators at</div>
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 opacity-80">
                <div className="h-5 w-16 sm:h-6 sm:w-20 rounded-md bg-muted" />
                <div className="h-5 w-14 sm:h-6 sm:w-16 rounded-md bg-muted" />
                <div className="h-5 w-20 sm:h-6 sm:w-24 rounded-md bg-muted" />
                <div className="h-5 w-14 sm:h-6 sm:w-16 rounded-md bg-muted" />
                <div className="h-5 w-16 sm:h-6 sm:w-20 rounded-md bg-muted" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-8 pt-6 border-t border-border/50 px-4">
              <div className="text-center">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">500+</div>
                <div className="text-xs lg:text-sm text-muted-foreground">Beta Users</div>
              </div>
              <div className="h-8 sm:h-10 w-px bg-border/50 hidden sm:block" />
              <div className="text-center">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">5K+</div>
                <div className="text-xs lg:text-sm text-muted-foreground">Posts Generated</div>
              </div>
              <div className="h-8 sm:h-10 w-px bg-border/50 hidden sm:block" />
              <div className="text-center">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">30s</div>
                <div className="text-xs lg:text-sm text-muted-foreground">Avg. Generation Time</div>
              </div>
            </div>
          </div>

        {/* Removed older duplicate section; cards are now integrated near headline */}

        {/* Removed legacy features grid (replaced by new premium cards above) */}
      </div>
    </section>
  );
};
