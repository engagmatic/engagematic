import { Button } from "@/components/ui/button";
import { Menu, Home, FileText, MessageSquare, Lightbulb, User, LogOut } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { UserDropdownMenu } from "../UserDropdownMenu";

export const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    // If we're on the home page, scroll to section
    if (location.pathname === '/') {
      const element = document.getElementById(id);
      element?.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    } else {
      // Otherwise, navigate to home page with hash
      navigate(`/#${id}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    navigate('/');
    setIsLoggingOut(false);
  };

  const handleStartFree = () => {
    navigate('/auth/register');
  };

  // Navigation items for authenticated users
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/idea-generator', label: 'Ideas', icon: Lightbulb },
    { path: '/post-generator', label: 'Posts', icon: FileText },
    { path: '/comment-generator', label: 'Comments', icon: MessageSquare },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/logo.svg" 
              alt="LinkedInPulse Logo" 
              className="w-8 h-8 sm:w-10 sm:h-10 hover:scale-110 transition-transform duration-200"
            />
            <span className="text-lg sm:text-xl font-bold">LinkedInPulse</span>
          </Link>
          
          {/* Desktop Navigation */}
          {isAuthenticated ? (
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden lg:inline">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          ) : (
            <nav className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => scrollToSection('features')}
                className="text-foreground/80 hover:text-foreground transition-smooth"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('pricing')}
                className="text-foreground/80 hover:text-foreground transition-smooth"
              >
                Pricing
              </button>
              <Link 
                to="/blogs"
                className="text-foreground/80 hover:text-foreground transition-smooth"
              >
                Blog
              </Link>
              <button 
                onClick={() => scrollToSection('faq')}
                className="text-foreground/80 hover:text-foreground transition-smooth"
              >
                FAQ
              </button>
            </nav>
          )}
          
          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated ? (
              <UserDropdownMenu />
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/auth/login')}
                  size="sm"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={handleStartFree}
                  className="shadow-pulse hover-pulse"
                  size="sm"
                >
                  Start Free
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="sm:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[350px]">
              <div className="flex flex-col gap-6 mt-8">
                {isAuthenticated ? (
                  <>
                    {/* User Profile in Mobile */}
                    <div className="flex items-center gap-3 pb-4 border-b">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      </div>
                    </div>

                    {/* Navigation Links in Mobile */}
                    <nav className="flex flex-col gap-2">
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                              isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'text-foreground hover:bg-muted'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            {item.label}
                          </Link>
                        );
                      })}
                    </nav>

                    {/* Logout Button */}
                    <div className="pt-4 border-t mt-auto">
                      <Button 
                        variant="outline" 
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        {isLoggingOut ? 'Signing out...' : 'Logout'}
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <nav className="flex flex-col gap-4">
                      <button 
                        onClick={() => scrollToSection('features')}
                        className="text-left text-lg font-medium text-foreground/80 hover:text-foreground transition-smooth"
                      >
                        Features
                      </button>
                      <button 
                        onClick={() => scrollToSection('pricing')}
                        className="text-left text-lg font-medium text-foreground/80 hover:text-foreground transition-smooth"
                      >
                        Pricing
                      </button>
                      <Link 
                        to="/blogs"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-left text-lg font-medium text-foreground/80 hover:text-foreground transition-smooth"
                      >
                        Blog
                      </Link>
                      <button 
                        onClick={() => scrollToSection('faq')}
                        className="text-left text-lg font-medium text-foreground/80 hover:text-foreground transition-smooth"
                      >
                        FAQ
                      </button>
                    </nav>

                    <div className="flex flex-col gap-3 pt-4 border-t">
                      <Button 
                        onClick={() => {
                          navigate('/auth/login');
                          setMobileMenuOpen(false);
                        }}
                        variant="ghost"
                        className="w-full"
                      >
                        Sign In
                      </Button>
                      <Button 
                        onClick={() => {
                          handleStartFree();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full shadow-pulse hover-pulse"
                      >
                        Start Free Trial
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
