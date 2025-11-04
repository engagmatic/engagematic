import { Outlet } from "react-router-dom";
import { OnboardingModal } from "@/components/OnboardingModal";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

export const DashboardLayout = () => {
  const { user, isLoading, checkAuthStatus } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  // Show onboarding modal if user hasn't completed it
  useEffect(() => {
    // Wait for auth to finish loading
    if (isLoading) {
      return;
    }

    // If user data is not loaded yet, check auth status
    if (!user && !isLoading) {
      checkAuthStatus?.();
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

    if (needsOnboarding && !hasChecked) {
      // Delay to let dashboard load smoothly before showing modal
      const timer = setTimeout(() => {
        setShowOnboarding(true);
        setHasChecked(true);
      }, 800); // Smooth delay for better UX
      return () => clearTimeout(timer);
    } else if (!needsOnboarding) {
      // Hide modal if onboarding is completed
      setShowOnboarding(false);
      setHasChecked(true);
    }
  }, [user, isLoading, checkAuthStatus, hasChecked]);

  return (
    <>
      <Outlet />
      
      {/* Onboarding Modal - World-class experience */}
      <OnboardingModal 
        isOpen={showOnboarding}
        onComplete={async () => {
          setShowOnboarding(false);
          // Refresh user data instead of full page reload for better UX
          if (checkAuthStatus) {
            await checkAuthStatus();
          }
        }}
      />
    </>
  );
};

