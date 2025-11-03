import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { UserDropdownMenu } from "@/components/UserDropdownMenu";
import { Diamond, Gift, HelpCircle, Menu } from "lucide-react";

interface DashboardHeaderProps {
  onMenuClick?: () => void;
}

export const DashboardHeader = ({ onMenuClick }: DashboardHeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 sm:h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between h-full px-3 sm:px-4 md:px-6">
        {/* Left: Logo & Branding */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden h-9 w-9 p-0 flex-shrink-0 touch-manipulation"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <Link 
            to="/dashboard" 
            className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity min-w-0 flex-1"
          >
            <Logo size={28} className="sm:w-8 sm:h-8 flex-shrink-0" />
            <div className="hidden sm:block min-w-0">
              <div className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 truncate">
                LinkedInPulse
              </div>
              <div className="hidden sm:block text-xs text-gray-500 dark:text-gray-400 truncate">
                AI-Powered LinkedIn Content
              </div>
            </div>
          </Link>
        </div>

        {/* Right: Actions & User Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Upgrade Button - Icon only on mobile */}
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex items-center gap-2 bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 touch-manipulation"
            onClick={() => window.location.href = "/#pricing"}
          >
            <Diamond className="h-4 w-4" />
            <span className="font-medium">Upgrade</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden h-9 w-9 p-0 touch-manipulation"
            onClick={() => window.location.href = "/#pricing"}
            aria-label="Upgrade"
          >
            <Diamond className="h-4 w-4" />
          </Button>

          {/* Referral Button - Icon only on mobile */}
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex items-center gap-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 touch-manipulation"
            onClick={() => window.location.href = "/referral"}
          >
            <Gift className="h-4 w-4" />
            <span className="font-medium">Referral</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden h-9 w-9 p-0 touch-manipulation"
            onClick={() => window.location.href = "/referral"}
            aria-label="Referral"
          >
            <Gift className="h-4 w-4" />
          </Button>

          {/* Help Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 touch-manipulation"
            onClick={() => window.open("https://help.linkedinpulse.com", "_blank")}
            aria-label="Help"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>

          {/* User Menu */}
          <div className="touch-manipulation">
            <UserDropdownMenu />
          </div>
        </div>
      </div>
    </header>
  );
};

