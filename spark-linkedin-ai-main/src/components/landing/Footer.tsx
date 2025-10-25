import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";

export const Footer = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Sticky CTA Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-3 sm:p-4 shadow-2xl border-t border-white/20">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-white text-center sm:text-left">
            <div className="font-bold text-sm sm:text-base">Ready to boost your LinkedIn pulse?</div>
            <div className="text-xs sm:text-sm opacity-90">Join 1000+ creators growing their presence</div>
          </div>
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={() => navigate('/auth/register')}
            className="shadow-lg hover:shadow-xl bg-white text-primary hover:bg-white/90 w-full sm:w-auto whitespace-nowrap font-bold transition-all"
          >
            Get The Pulse!
          </Button>
        </div>
      </div>
      
      {/* Main Footer */}
      <footer className="bg-secondary/30 border-t pb-20 sm:pb-24">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img 
                  src="/logo.svg" 
                  alt="LinkedInPulse Logo" 
                  className="w-10 h-10"
                />
                <span className="text-xl font-bold">LinkedInPulse</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Amplify your LinkedIn presence with AI-powered content that feels authentically you.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-smooth">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-smooth">Pricing</a></li>
                {/* Roadmap removed */}
                {/* Changelog removed */}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/blogs" className="hover:text-foreground transition-smooth">Blog</Link></li>
                <li><Link to="/resources" className="hover:text-foreground transition-smooth">Resources</Link></li>
                {/* Community removed */}
                <li><Link to="/templates" className="hover:text-foreground transition-smooth">Templates</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-foreground transition-smooth">About</Link></li>
                <li><Link to="/contact" className="hover:text-foreground transition-smooth">Contact</Link></li>
                <li><Link to="/privacy" className="hover:text-foreground transition-smooth">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-foreground transition-smooth">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 LinkedInPulse. All rights reserved. Built with 💙 for LinkedIn creators.</p>
          </div>
        </div>
      </footer>
    </>
  );
};
