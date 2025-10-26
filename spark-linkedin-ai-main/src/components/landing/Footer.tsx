import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { X, Gift, Users, Star } from "lucide-react";

export const Footer = () => {
  const navigate = useNavigate();
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  const handleCloseBanner = () => {
    setIsBannerVisible(false);
  };

  return (
    <>
      {/* Referral Offer Banner */}
      {isBannerVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-3 sm:p-4 shadow-2xl border-t border-white/20">
          <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-white text-center sm:text-left flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Gift className="h-4 w-4 text-yellow-300" />
                <span className="font-bold text-sm sm:text-base">Referral Bonus Active!</span>
              </div>
              <div className="text-xs sm:text-sm opacity-90">
                Invite friends & get <span className="font-semibold text-yellow-300">₹500 credits</span> for each successful referral
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="secondary" 
                onClick={() => navigate('/referral')}
                className="shadow-lg hover:shadow-xl bg-white text-green-600 hover:bg-white/90 w-full sm:w-auto whitespace-nowrap font-bold transition-all"
              >
                <Users className="h-4 w-4 mr-1" />
                Invite Friends
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCloseBanner}
                className="text-white hover:bg-white/20 p-1 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Footer */}
      <footer className={`bg-secondary/30 border-t ${isBannerVisible ? 'pb-20 sm:pb-24' : 'pb-8 sm:pb-12'}`}>
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8">
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
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-smooth">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-smooth">Pricing</a></li>
                <li><Link to="/blogs" className="hover:text-foreground transition-smooth">Blog</Link></li>
                <li><Link to="/resources" className="hover:text-foreground transition-smooth">Resources</Link></li>
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
            
            <div>
              <h3 className="font-semibold mb-4">Why Us</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/blogs/linkedinpulse-vs-chatgpt" className="hover:text-foreground transition-smooth">vs ChatGPT</Link></li>
                <li><Link to="/blogs/linkedinpulse-vs-taplio" className="hover:text-foreground transition-smooth">vs Taplio</Link></li>
                <li><Link to="/blogs/linkedinpulse-vs-hootsuite" className="hover:text-foreground transition-smooth">vs Hootsuite</Link></li>
                <li><Link to="/blogs/linkedinpulse-vs-authoredup" className="hover:text-foreground transition-smooth">vs AuthoredUp</Link></li>
                <li><Link to="/blogs/linkedinpulse-vs-kleo" className="hover:text-foreground transition-smooth">vs Kleo</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Built For</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/blogs/linkedin-creators-guide" className="hover:text-foreground transition-smooth">LinkedIn Creators</Link></li>
                <li><Link to="/blogs/founders-ceos-guide" className="hover:text-foreground transition-smooth">Founders & CEOs</Link></li>
                <li><Link to="/blogs/freelancers-guide" className="hover:text-foreground transition-smooth">Freelancers</Link></li>
                <li><Link to="/blogs/recruiters-guide" className="hover:text-foreground transition-smooth">Recruiters</Link></li>
                <li><Link to="/blogs/sales-reps-guide" className="hover:text-foreground transition-smooth">Sales Reps</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 LinkedInPulse. All rights reserved. Built with 💙 for LinkedIn creators.</p>
            <p className="text-xs text-muted-foreground/80 mt-2">
              LinkedInPulse© is not affiliated, associated, authorized, endorsed by, or in any way officially connected with LinkedIn Corporation.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};
