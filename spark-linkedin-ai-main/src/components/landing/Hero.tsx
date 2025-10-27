import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowRight, Play, Sparkles, Star } from "lucide-react";
import heroImage from "@/assets/hero-pulse.jpg";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

// Animated words for hero headline
const ROTATING_WORDS = ["Content", "Ideas", "Posts", "Comments", "Engagement", "Growth"];

export const Hero = () => {
  const navigate = useNavigate();
  
  // Animated word rotation
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
        setIsAnimating(false);
      }, 500);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

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
              <span 
                className={`inline-block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent transition-all duration-500 ${
                  isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
                }`}
                style={{ minWidth: '280px', display: 'inline-block' }}
              >
                {ROTATING_WORDS[currentWordIndex]}
              </span>{" "}
              Again.
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl leading-relaxed mx-auto px-4">
              <span className="text-foreground font-semibold">AI that writes in your voice.</span> Show up. Stand out.
            </p>

            {/* Feature cards around the headline (premium UI) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {/* AI Persona */}
              <div className="rounded-2xl border bg-white shadow-card p-6 hover-lift text-left">
                <div className="text-xs font-semibold text-muted-foreground mb-2">Persona</div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h4 className="text-base font-semibold">Your authentic voice</h4>
                </div>
                <p className="text-sm text-muted-foreground">AI learns your unique style and creates content that sounds like YOU, not a robot.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-2 py-1 text-xs rounded-full border bg-muted">Authentic</span>
                  <span className="px-2 py-1 text-xs rounded-full border bg-muted">Voice AI</span>
                </div>
              </div>

              {/* Profile Analyzer */}
              <div className="rounded-2xl border bg-white shadow-card p-6 hover-lift text-left">
                <div className="text-xs font-semibold text-muted-foreground mb-2">Analyzer</div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h4 className="text-base font-semibold">Profile optimization</h4>
                </div>
                <p className="text-sm text-muted-foreground">Get AI-powered score & actionable tips to boost your LinkedIn visibility.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-2 py-1 text-xs rounded-full border bg-muted">Score</span>
                  <span className="px-2 py-1 text-xs rounded-full border bg-muted">Tips</span>
                  <span className="px-2 py-1 text-xs rounded-full border bg-muted">Insights</span>
                </div>
              </div>

              {/* Smart Comments */}
              <div className="rounded-2xl border bg-white shadow-card p-6 hover-lift text-left">
                <div className="text-xs font-semibold text-muted-foreground mb-2">Engagement</div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h4 className="text-base font-semibold">Smart comments</h4>
                </div>
                <p className="text-sm text-muted-foreground">Generate genuine comments that build real relationships and conversations.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-2 py-1 text-xs rounded-full border bg-muted">Genuine</span>
                  <span className="px-2 py-1 text-xs rounded-full border bg-muted">Engage</span>
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
                onClick={() => {
                  const featuresSection = document.getElementById('features');
                  featuresSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group text-sm sm:text-base h-12 sm:h-14 px-6 sm:px-8 border-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 w-full sm:w-auto"
              >
                Learn More
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
            
            {/* Product Hunt Badge */}
            <div className="pt-6 px-4 flex justify-center">
              <a 
                href="https://www.producthunt.com/products/linkedinpulse?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-linkedinpulse" 
                target="_blank" 
                rel="noopener noreferrer"
                className="transition-transform hover:scale-105"
              >
                <img 
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1030934&theme=light&t=1761584253218" 
                  alt="LinkedInPulse - AI Content & Analytics for LinkedIn Creators, Free | Product Hunt" 
                  style={{width: "250px", height: "54px"}}
                  width="250" 
                  height="54"
                />
              </a>
            </div>

            {/* Trust bar - Professional Roles */}
            <div className="pt-6 px-4">
              <div className="text-xs text-muted-foreground mb-4">Trusted by professionals worldwide</div>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                <Badge variant="secondary" className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 hover:border-blue-300 transition-colors">
                  Startup Founders
                </Badge>
                <Badge variant="secondary" className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50 hover:border-purple-300 transition-colors">
                  Marketing Teams
                </Badge>
                <Badge variant="secondary" className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 hover:border-green-300 transition-colors">
                  Sales Leaders
                </Badge>
                <Badge variant="secondary" className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200/50 hover:border-orange-300 transition-colors">
                  Content Creators
                </Badge>
                <Badge variant="secondary" className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200/50 hover:border-cyan-300 transition-colors">
                  Coaches & Consultants
                </Badge>
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
