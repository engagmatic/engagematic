import { Button } from "@/components/ui/button";
import { User, LogOut, Home, MessageSquare, FileText, BarChart3, Settings, Target, Crown, Lock, Lightbulb } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export const Navigation = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    navigate('/');
    setIsLoggingOut(false);
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/idea-generator', label: 'Ideas', icon: Lightbulb },
    { path: '/post-generator', label: 'Posts', icon: FileText },
    { path: '/comment-generator', label: 'Comments', icon: MessageSquare },
    { path: '/profile-analyzer', label: 'Analyzer', icon: Target, premium: true, disabled: true },
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img 
              src="/logo.svg" 
              alt="LinkedInPulse Logo" 
              className="w-10 h-10 hover:scale-110 transition-transform duration-200"
            />
            <span className="text-xl font-bold">LinkedInPulse</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              // If item is disabled (premium), show disabled button with tooltip
              if (item.disabled) {
                return (
                  <Tooltip key={item.path}>
                    <TooltipTrigger asChild>
                      <div
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium cursor-not-allowed opacity-50 ${
                          'text-muted-foreground'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                        {item.premium && <Crown className="h-3 w-3 text-amber-500" />}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="flex items-center gap-1">
                        <Crown className="h-3 w-3 text-amber-500" />
                        Premium Feature - Coming Soon!
                      </p>
                    </TooltipContent>
                  </Tooltip>
                );
              }
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
