import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Welcome from "./steps/Welcome";
import SetupIncome from "./steps/SetupIncome";
import SetupAllocation from "./steps/SetupAllocation";
import SetupGoals from "./steps/SetupGoals";
import Complete from "./steps/Complete";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

type OnboardingSteps = "welcome" | "income" | "allocation" | "goals" | "complete";

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
  userId?: string;
}

const OnboardingModal = ({ open, onComplete, userId }: OnboardingModalProps) => {
  const [currentStep, setCurrentStep] = useState<OnboardingSteps>("welcome");
  const [formData, setFormData] = useState({
    income: "",
    incomeFrequency: "monthly",
    needsPercentage: 40,
    wantsPercentage: 30,
    savingsPercentage: 30,
    savingsGoal: "",
    savingsGoalDate: "",
  });
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  // Calculate progress percentage
  useEffect(() => {
    const steps = ["welcome", "income", "allocation", "goals", "complete"];
    const currentIndex = steps.indexOf(currentStep);
    setProgress((currentIndex / (steps.length - 1)) * 100);
  }, [currentStep]);

  const nextStep = () => {
    switch (currentStep) {
      case "welcome":
        setCurrentStep("income");
        break;
      case "income":
        setCurrentStep("allocation");
        break;
      case "allocation":
        setCurrentStep("goals");
        break;
      case "goals":
        setCurrentStep("complete");
        break;
      case "complete":
        completeOnboarding();
        break;
    }
  };

  const prevStep = () => {
    switch (currentStep) {
      case "income":
        setCurrentStep("welcome");
        break;
      case "allocation":
        setCurrentStep("income");
        break;
      case "goals":
        setCurrentStep("allocation");
        break;
      case "complete":
        setCurrentStep("goals");
        break;
    }
  };

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const completeOnboarding = async () => {
    try {
      // Save onboarding data to user profile
      if (userId) {
        await apiRequest("POST", `/api/users/${userId}/onboarding`, formData);
      }
      toast({
        title: "Setup complete!",
        description: "Your financial dashboard is ready to use.",
      });
      onComplete();
    } catch (error) {
      console.error("Error saving onboarding data:", error);
      toast({
        title: "Error saving your settings",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  const skipOnboarding = () => {
    toast({
      title: "Onboarding skipped",
      description: "You can always configure your settings later.",
    });
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && skipOnboarding()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-[#805ad5] bg-clip-text text-transparent">
            Welcome to Stackr
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>Start</span>
            <span>Complete</span>
          </div>
        </div>

        <div className="py-4">
          {currentStep === "welcome" && <Welcome />}
          {currentStep === "income" && (
            <SetupIncome formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === "allocation" && (
            <SetupAllocation formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === "goals" && (
            <SetupGoals formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === "complete" && <Complete formData={formData} />}
        </div>

        <div className="flex justify-between mt-4">
          {currentStep !== "welcome" ? (
            <Button variant="outline" onClick={prevStep}>
              Back
            </Button>
          ) : (
            <Button variant="outline" onClick={skipOnboarding}>
              Skip Setup
            </Button>
          )}

          <Button onClick={nextStep}>
            {currentStep === "complete" ? "Finish" : "Continue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;