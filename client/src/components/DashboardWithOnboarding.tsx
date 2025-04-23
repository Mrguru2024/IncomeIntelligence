import { useEffect, useState } from "react";
import Dashboard from "@/pages/Dashboard";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import { useOnboarding } from "@/hooks/use-onboarding";
import { Button } from "@/components/ui/button";

const DashboardWithOnboarding = () => {
  const { showOnboarding, completeOnboarding, resetOnboarding } = useOnboarding();
  const [modalForceOpen, setModalForceOpen] = useState(false);

  // Log onboarding status for debugging
  useEffect(() => {
    console.log("Onboarding status:", { showOnboarding });
  }, [showOnboarding]);

  // Force modal open for debugging
  const handleForceOpen = () => {
    console.log("Forcing onboarding modal open");
    setModalForceOpen(true);
  };

  return (
    <>
      <Dashboard />
      
      {/* Developer control for testing */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={resetOnboarding}
          className="bg-white shadow-md"
        >
          Reset Onboarding
        </Button>
      </div>
      
      <OnboardingModal
        open={showOnboarding || modalForceOpen}
        onComplete={() => {
          completeOnboarding();
          setModalForceOpen(false);
        }}
        userId="current-user" // In a real app, this would be the actual user ID
      />
    </>
  );
};

export default DashboardWithOnboarding;