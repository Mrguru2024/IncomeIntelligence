import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import SpendingPersonalityQuiz from "@/components/onboarding/SpendingPersonalityQuiz";

// Define the onboarding steps
type OnboardingStep =
  | "welcome"
  | "personality"
  | "profile"
  | "income"
  | "goals"
  | "tutorial"
  | "complete";

export default function OnboardingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [progress, setProgress] = useState(0);

  // Get the user's current onboarding status
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: !!user,
  });

  // Fetch the user's profile if it exists
  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: [`/api/users/${user?.id}/profile`],
    enabled: !!user?.id,
  });

  // Mutation to update onboarding status
  const updateOnboardingStatus = useMutation<
    any,
    Error,
    { onboardingStep: string; onboardingCompleted?: boolean }
  >({
    mutationFn: async (data) => {
      if (!user?.id) throw new Error("User ID not available");
      const res = await apiRequest(
        "PATCH",
        `/api/users/${user.id}/onboarding`,
        data,
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating onboarding status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // If the user has already completed onboarding, redirect to the dashboard
  useEffect(() => {
    if (userData?.onboardingCompleted) {
      navigate("/");
    } else if (
      userData?.onboardingStep &&
      userData.onboardingStep !== "welcome"
    ) {
      // Resume from the saved step
      setCurrentStep(userData.onboardingStep as OnboardingStep);
    }
  }, [userData, navigate]);

  // Calculate progress percentage based on current step
  useEffect(() => {
    const steps: OnboardingStep[] = [
      "welcome",
      "personality",
      "profile",
      "income",
      "goals",
      "tutorial",
      "complete",
    ];
    const currentIndex = steps.indexOf(currentStep);
    setProgress(Math.round((currentIndex / (steps.length - 1)) * 100));
  }, [currentStep]);

  // Handle continuing to the next step
  const handleNextStep = () => {
    const steps: OnboardingStep[] = [
      "welcome",
      "personality",
      "profile",
      "income",
      "goals",
      "tutorial",
      "complete",
    ];
    const currentIndex = steps.indexOf(currentStep);

    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      setCurrentStep(nextStep);

      // Update the user's onboarding status
      updateOnboardingStatus.mutate({
        onboardingStep: nextStep,
        onboardingCompleted: nextStep === "complete",
      });
    }

    // If the user completes the onboarding, redirect to the dashboard
    if (currentStep === "tutorial") {
      updateOnboardingStatus.mutate({
        onboardingStep: "complete",
        onboardingCompleted: true,
      });

      toast({
        title: "Onboarding Complete!",
        description: "Welcome to Stackr. Your financial journey begins now.",
      });

      // Redirect after a short delay
      setTimeout(() => {
        navigate("/");
      }, 1500);
    }
  };

  // Handle going back to the previous step
  const handlePreviousStep = () => {
    const steps: OnboardingStep[] = [
      "welcome",
      "personality",
      "profile",
      "income",
      "goals",
      "tutorial",
      "complete",
    ];
    const currentIndex = steps.indexOf(currentStep);

    if (currentIndex > 0) {
      const prevStep = steps[currentIndex - 1];
      setCurrentStep(prevStep);

      // Update the user's onboarding status
      updateOnboardingStatus.mutate({
        onboardingStep: prevStep,
      });
    }
  };

  if (userLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-semibold">Getting Started</h2>
          <span className="text-sm text-muted-foreground">
            {progress}% Complete
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step content */}
      <Card className="w-full">
        {currentStep === "welcome" && (
          <>
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl">
                Welcome to Stackr
              </CardTitle>
              <CardDescription>
                Let's set up your account to make the most of your financial
                journey.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-xl font-medium">Here's what we'll do:</h3>
                <ul className="space-y-1">
                  <li className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Discover your spending personality type</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Set up your professional profile</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Configure your income allocation ratios</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Establish your financial goals</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Learn how to use the app features</span>
                  </li>
                </ul>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">
                  This should take about 5-7 minutes to complete. Your data
                  helps us provide you with personalized recommendations and
                  insights.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleNextStep} className="flex items-center">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </>
        )}

        {currentStep === "personality" && (
          <>
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl">
                Discover Your Spending Personality
              </CardTitle>
              <CardDescription>
                Answer a few questions to find out how you relate to money.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SpendingPersonalityQuiz
                onComplete={() => {
                  toast({
                    title: "Personality Assessment Complete!",
                    description: "Your results have been saved.",
                  });
                  handleNextStep();
                }}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousStep}
                className="flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              {/* The Next button is handled by the SpendingPersonalityQuiz component */}
            </CardFooter>
          </>
        )}

        {currentStep === "profile" && (
          <>
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl">
                Professional Profile
              </CardTitle>
              <CardDescription>
                Tell us about your business and professional details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-20">
                Profile Form Component Will Go Here
              </p>
              {/* ProfileSetupForm component will be implemented later */}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousStep}
                className="flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={handleNextStep} className="flex items-center">
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </>
        )}

        {currentStep === "income" && (
          <>
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl">
                Income Allocation
              </CardTitle>
              <CardDescription>
                Configure how your income should be distributed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-20">
                Income Allocation Form Component Will Go Here
              </p>
              {/* IncomeAllocationSetup component will be implemented later */}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousStep}
                className="flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={handleNextStep} className="flex items-center">
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </>
        )}

        {currentStep === "goals" && (
          <>
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl">
                Financial Goals
              </CardTitle>
              <CardDescription>
                Set your initial financial goals to work towards.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-20">
                Financial Goals Form Component Will Go Here
              </p>
              {/* GoalsSetup component will be implemented later */}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousStep}
                className="flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={handleNextStep} className="flex items-center">
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </>
        )}

        {currentStep === "tutorial" && (
          <>
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl">
                App Tutorial
              </CardTitle>
              <CardDescription>
                Learn how to use the key features of Stackr.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-20">
                App Tutorial Component Will Go Here
              </p>
              {/* AppTutorialContent component will be implemented later */}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousStep}
                className="flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={handleNextStep} className="flex items-center">
                Complete Setup <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </>
        )}

        {currentStep === "complete" && (
          <>
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl">
                Setup Complete!
              </CardTitle>
              <CardDescription>
                You're all set to start using Stackr.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Your financial journey begins now
              </h3>
              <p className="text-muted-foreground">
                You've completed all the setup steps. You'll be redirected to
                your dashboard in a moment.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button
                onClick={() => navigate("/")}
                className="flex items-center"
              >
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}