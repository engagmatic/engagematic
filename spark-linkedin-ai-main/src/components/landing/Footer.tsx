import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <>
      {/* Sticky CTA Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-40 gradient-pulse p-4 shadow-elevated">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="text-white">
            <div className="font-bold">Ready to boost your LinkedIn pulse?</div>
            <div className="text-sm opacity-90">Join 10,000+ creators growing their presence</div>
          </div>
          <Button size="lg" variant="secondary" className="shadow-elevated">
            Get The Pulse!
          </Button>
        </div>
      </div>
      
      {/* Main Footer */}
      <footer className="bg-secondary/30 border-t pb-24">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl gradient-pulse flex items-center justify-center shadow-pulse">
                  <Activity className="h-6 w-6 text-white" />
                </div>
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
                <li><Link to="/roadmap" className="hover:text-foreground transition-smooth">Roadmap</Link></li>
                <li><Link to="/changelog" className="hover:text-foreground transition-smooth">Changelog</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/blogs" className="hover:text-foreground transition-smooth">Blog</Link></li>
                <li><Link to="/help" className="hover:text-foreground transition-smooth">Help Center</Link></li>
                <li><Link to="/community" className="hover:text-foreground transition-smooth">Community</Link></li>
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
