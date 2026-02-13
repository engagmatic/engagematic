import { FreePostGenerator } from "./FreePostGenerator";
import { ToolsShowcase } from "./ToolsShowcase";

export const TryItFreeSection = () => {
  return (
    <section 
      id="free-generator" 
      className="relative py-6 sm:py-8 lg:py-10 bg-gradient-to-b from-background via-primary/5 to-background overflow-hidden"
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

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
        {/* Section Header - More Compact */}
        <div className="text-center mb-4 sm:mb-5 space-y-1.5 sm:space-y-2 animate-fade-in-up">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-full text-[10px] sm:text-xs font-medium border border-blue-200/50">
            <span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></span>
            Try the Smartest LinkedIn Post Generator
          </div>
          
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight tracking-tight max-w-xl mx-auto">
            Experience{" "}
            <span className="text-gradient-premium-world-class">
              Real Value
            </span>
            {" "}Before You Commit
          </h2>
          
          <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
            No signup. No friction. Instantly see how Engagematic crafts a post tailored to your style and audience.
          </p>
        </div>

        {/* 2-Column Layout: Tool on Left, Tools Showcase on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
          {/* Left Column - Free Post Generator */}
          <div className="animate-fade-in-up animation-delay-1000">
            <FreePostGenerator />
            
            {/* Trust Indicators */}
            <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[10px] text-muted-foreground">
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

          {/* Right Column - Tools Showcase */}
          <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <ToolsShowcase />
          </div>
        </div>
      </div>
    </section>
  );
};

