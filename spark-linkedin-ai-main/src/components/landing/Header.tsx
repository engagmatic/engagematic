import { Button } from "@/components/ui/button";
import { Activity, User, LogOut, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    navigate('/');
    setIsLoggingOut(false);
  };

  const handleStartFree = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/auth/register');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl gradient-pulse flex items-center justify-center shadow-pulse">
              <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-white animate-heartbeat" />
            </div>
            <span className="text-lg sm:text-xl font-bold">LinkedInPulse</span>
          </Link>
          
          {/* Desktop Navigation */}
          {!isAuthenticated && (
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
              <>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium hidden lg:block">
                    {user?.name}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="gap-2"
                  size="sm"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden md:inline">{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
                </Button>
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="shadow-pulse hover-pulse"
                  size="sm"
                >
                  Dashboard
                </Button>
              </>
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
                {!isAuthenticated && (
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
                    <button 
                      onClick={() => scrollToSection('faq')}
                      className="text-left text-lg font-medium text-foreground/80 hover:text-foreground transition-smooth"
                    >
                      FAQ
                    </button>
                  </nav>
                )}

                <div className="flex flex-col gap-3 pt-4 border-t">
                  {isAuthenticated ? (
                    <>
                      <div className="flex items-center gap-3 pb-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-sm font-medium">{user?.name}</span>
                      </div>
                      <Button 
                        onClick={() => {
                          navigate('/dashboard');
                          setMobileMenuOpen(false);
                        }}
                        className="w-full shadow-pulse hover-pulse"
                      >
                        Dashboard
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        {isLoggingOut ? 'Signing out...' : 'Sign Out'}
                      </Button>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
