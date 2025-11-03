import { Outlet } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { OnboardingModal } from "@/components/OnboardingModal";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

export const DashboardLayout = () => {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Detect desktop vs mobile
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true); // Always open on desktop
      }
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Show onboarding modal if user hasn't completed it
  useEffect(() => {
    if (user && !user.profile?.onboardingCompleted) {
      // Small delay to let dashboard load first
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar 
        isOpen={isDesktop ? true : sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      {/* Main Content Area - Offset for header and sidebar */}
      <main className="lg:ml-64 mt-14 sm:mt-16 p-4 sm:p-5 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>

      {/* Onboarding Modal */}
      <OnboardingModal 
        isOpen={showOnboarding}
        onComplete={() => {
          setShowOnboarding(false);
          // Refresh user data to get updated profile
          window.location.reload();
        }}
      />
    </div>
  );
};

