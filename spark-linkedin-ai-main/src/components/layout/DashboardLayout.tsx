import { Outlet } from "react-router-dom";
import { OnboardingModal } from "@/components/OnboardingModal";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

export const DashboardLayout = () => {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Show onboarding modal if user hasn't completed it
  useEffect(() => {
    if (user && !user.profile?.onboardingCompleted) {
      // Delay to let dashboard load smoothly before showing modal
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      // Hide modal if onboarding is completed
      setShowOnboarding(false);
    }
  }, [user]);

  return (
    <>
      <Outlet />
      
      {/* Onboarding Modal - Smooth transition */}
      <OnboardingModal 
        isOpen={showOnboarding}
        onComplete={async () => {
          setShowOnboarding(false);
          // Small delay before refresh to allow modal close animation
          setTimeout(() => {
            window.location.reload();
          }, 300);
        }}
      />
    </>
  );
};

