import { Home, MessageSquare, FileText, Lightbulb } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { UserDropdownMenu } from "./UserDropdownMenu";
import { Logo } from "./Logo";

export const Navigation = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/idea-generator', label: 'Ideas', icon: Lightbulb },
    { path: '/post-generator', label: 'Posts', icon: FileText },
    { path: '/comment-generator', label: 'Comments', icon: MessageSquare },
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Logo 
              className="w-10 h-10 hover:scale-110 transition-transform duration-200"
              size={40}
            />
            <span className="text-xl font-bold">LinkedInPulse</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
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

          <div className="flex items-center gap-3">
            <UserDropdownMenu />
          </div>
        </div>
      </div>
    </header>
  );
};
