import { useEffect } from "react";
import Dashboard from "@/pages/Dashboard";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import { useOnboarding } from "@/hooks/use-onboarding";

const DashboardWithOnboarding = () => {
  const { showOnboarding, completeOnboarding } = useOnboarding();

  // Log onboarding status for debugging
  useEffect(() => {
    console.log("Onboarding status:", { showOnboarding });
  }, [showOnboarding]);

  return (
    <>
      <Dashboard />
      <OnboardingModal
        open={showOnboarding}
        onComplete={completeOnboarding}
        userId="current-user" // In a real app, this would be the actual user ID
      />
    </>
  );
};

export default DashboardWithOnboarding;