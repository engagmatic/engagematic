import { Outlet } from "react-router-dom";
import { OnboardingModal } from "@/components/OnboardingModal";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

export const DashboardLayout = () => {
  const { user, isLoading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Show onboarding modal if user hasn't completed it
  useEffect(() => {
    // Wait for auth to finish loading
    if (isLoading) {
      return;
    }

    // Check if user exists and hasn't completed onboarding
    // onboardingCompleted can be undefined, null, or false - all mean not completed
    const needsOnboarding = user && (
      !user.profile || 
      user.profile.onboardingCompleted === false || 
      user.profile.onboardingCompleted === undefined ||
      user.profile.onboardingCompleted === null
    );

    if (needsOnboarding) {
      // Delay to let dashboard load smoothly before showing modal
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 1000); // Slightly longer delay to ensure user context is fully loaded
      return () => clearTimeout(timer);
    } else {
      // Hide modal if onboarding is completed
      setShowOnboarding(false);
    }
  }, [user, isLoading]);

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

