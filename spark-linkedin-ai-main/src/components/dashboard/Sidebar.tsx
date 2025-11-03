import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  MessageSquare, 
  Lightbulb, 
  BarChart3,
  Settings,
  User,
  X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navigationItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/post-generator', label: 'Post Generator', icon: FileText },
  { path: '/comment-generator', label: 'Comment Generator', icon: MessageSquare },
  { path: '/idea-generator', label: 'Idea Generator', icon: Lightbulb },
  { path: '/plan-management', label: 'Analytics', icon: BarChart3 },
  { path: '/profile', label: 'Settings', icon: Settings },
];

export const Sidebar = ({ isOpen = true, onClose }: SidebarProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const { subscription } = useSubscription();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getPlanBadge = () => {
    if (!subscription) return "Trial";
    if (subscription.plan === "starter") return "Starter";
    if (subscription.plan === "pro") return "Pro";
    if (subscription.plan === "custom") return "Custom";
    return "Trial";
  };

  const getCreditDisplay = () => {
    if (!subscription) return "Loading...";
    // Get credits from subscription if available
    const credits = subscription.creditsRemaining || subscription.creditsUsed || 0;
    return `${credits.toFixed(1)} credits`;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && onClose && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-14 sm:top-16 z-50 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-transform duration-300 ease-in-out",
        "lg:translate-x-0 lg:static",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Mobile Close Button */}
        {onClose && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 lg:hidden">
            <span className="font-semibold text-gray-900 dark:text-gray-100">Menu</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}
      {/* User Info Card at Top */}
      <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border-2 border-blue-100 dark:border-blue-900 flex-shrink-0">
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xs sm:text-sm font-bold">
              {getInitials(user?.name || "User")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {user?.name || "User"}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email || ""}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">Remaining:</span>
          <span className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">
            {getCreditDisplay()}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
            (item.path === '/dashboard' && location.pathname === '/dashboard') ||
            (item.path === '/post-generator' && location.pathname.startsWith('/post')) ||
            (item.path === '/comment-generator' && location.pathname.startsWith('/comment')) ||
            (item.path === '/idea-generator' && location.pathname.startsWith('/idea'));

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => {
                // Close sidebar on mobile when navigating
                if (onClose && window.innerWidth < 1024) {
                  setTimeout(() => onClose(), 100);
                }
              }}
              className={cn(
                "flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-2.5 rounded-lg mb-1 transition-all duration-200 touch-manipulation min-h-[44px] sm:min-h-0",
                "active:scale-[0.98] active:bg-gray-100 dark:active:bg-gray-800",
                isActive
                  ? "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 font-medium"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 flex-shrink-0",
                isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
              )} />
              <span className="text-sm sm:text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
    </>
  );
};

