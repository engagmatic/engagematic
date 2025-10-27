import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  User, 
  Bookmark, 
  Crown, 
  Settings, 
  LogOut
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSubscription } from "../hooks/useSubscription";

export const UserDropdownMenu = () => {
  const { user, logout } = useAuth();
  const { subscription } = useSubscription();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    navigate("/");
    setIsLoggingOut(false);
  };

  const getPlanBadge = () => {
    if (!subscription) return "Trial";
    if (subscription.plan === "starter") return "Starter";
    if (subscription.plan === "pro") return "Pro";
    return "Trial";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-muted/50">
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-sm font-bold">
              {getInitials(user?.name || "User")}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        {/* User Info */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
              <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                {getPlanBadge()}
              </span>
            </div>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Profile Menu Items */}
        <DropdownMenuItem asChild>
          <Link to="/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>My Profile</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/profile?saved=true" className="cursor-pointer">
            <Bookmark className="mr-2 h-4 w-4" />
            <span>Saved</span>
          </Link>
        </DropdownMenuItem>
        
        {subscription && subscription.plan !== "trial" && (
          <DropdownMenuItem asChild>
            <Link to="/plan-management" className="cursor-pointer">
              <Crown className="mr-2 h-4 w-4" />
              <span>Subscription</span>
            </Link>
          </DropdownMenuItem>
        )}
        
        {subscription && subscription.plan === "trial" && (
          <DropdownMenuItem 
            onClick={() => window.location.href = "/#pricing"}
            className="cursor-pointer"
          >
            <Crown className="mr-2 h-4 w-4" />
            <span>Upgrade Plan</span>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link to="/profile" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

