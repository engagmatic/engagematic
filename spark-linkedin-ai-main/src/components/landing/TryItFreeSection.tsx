import { FreePostGenerator } from "./FreePostGenerator";

export const TryItFreeSection = () => {
  return (
    <section 
      id="free-generator" 
      className="relative py-8 sm:py-10 lg:py-12 bg-gradient-to-b from-background via-primary/5 to-background overflow-hidden"
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Animated glow accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-glow animation-delay-1000" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-6xl">
        {/* Section Header - Reduced size */}
        <div className="text-center mb-4 sm:mb-5 lg:mb-6 space-y-2 sm:space-y-2.5 animate-fade-in-up">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-full text-xs sm:text-sm font-medium border border-blue-200/50">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
            Try the Smartest LinkedIn Post Generator
          </div>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight max-w-2xl mx-auto">
            Experience{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Real Value
            </span>
            {" "}Before You Commit
          </h2>
          
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            No signup. No friction. Instantly see how LinkedInPulse crafts a post tailored to your style and audience.
          </p>
        </div>

        {/* Free Post Generator Card - Smaller, Compact Design */}
        <div className="max-w-xl mx-auto animate-fade-in-up animation-delay-1000">
          <FreePostGenerator />
        </div>

        {/* Trust Indicators */}
        <div className="mt-4 sm:mt-5 lg:mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <span className="font-medium">No credit card required</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <span className="font-medium">1 free viral-grade post</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <span className="font-medium">Ready in 15 seconds</span>
          </div>
        </div>
      </div>
    </section>
  );
};

