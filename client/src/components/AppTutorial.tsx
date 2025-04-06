import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, ArrowRight, ArrowLeft, Info, CheckCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useLocalStorage } from "@/hooks/use-local-storage";

type TutorialStep = {
  title: string;
  description: string;
  highlightSelector?: string;
  position?: "top" | "right" | "bottom" | "left";
  imageUrl?: string;
};

type TutorialSections = {
  [key: string]: TutorialStep[];
};

const tutorialSections: TutorialSections = {
  dashboard: [
    {
      title: "Welcome to Your Dashboard",
      description:
        "This is your financial command center where you can see an overview of your finances at a glance.",
      highlightSelector: ".dashboard-header",
    },
    {
      title: "Income Allocation",
      description:
        "See how your income is allocated into the 40/30/30 split for Needs, Investments, and Savings.",
      highlightSelector: ".allocation-chart",
    },
    {
      title: "Recent Transactions",
      description: "View your most recent income and expense transactions.",
      highlightSelector: ".transactions-card",
    },
    {
      title: "Goal Progress",
      description: "Track your progress towards your financial goals.",
      highlightSelector: ".goals-card",
    },
  ],
  income: [
    {
      title: "Income Management",
      description: "Here you can view and manage all your income sources.",
      highlightSelector: ".income-header",
    },
    {
      title: "Add New Income",
      description: "Click this button to add a new income entry.",
      highlightSelector: ".add-income-button",
    },
    {
      title: "Income History",
      description: "View your income history and trends over time.",
      highlightSelector: ".income-history",
    },
  ],
  expenses: [
    {
      title: "Expense Tracking",
      description:
        "Monitor and categorize your expenses to better understand your spending patterns.",
      highlightSelector: ".expenses-header",
    },
    {
      title: "Add New Expense",
      description: "Click this button to add a new expense.",
      highlightSelector: ".add-expense-button",
    },
    {
      title: "Expense Categories",
      description:
        "View your expenses organized by category to identify spending patterns.",
      highlightSelector: ".category-breakdown",
    },
  ],
  goals: [
    {
      title: "Financial Goals",
      description: "Set and track your financial goals here.",
      highlightSelector: ".goals-header",
    },
    {
      title: "Create New Goal",
      description: "Click this button to create a new financial goal.",
      highlightSelector: ".add-goal-button",
    },
    {
      title: "Track Progress",
      description:
        "See your progress towards each goal and adjust contributions as needed.",
      highlightSelector: ".goals-list",
    },
  ],
  settings: [
    {
      title: "Settings & Preferences",
      description: "Customize your Stackr experience and account settings.",
      highlightSelector: ".settings-header",
    },
    {
      title: "Allocation Ratios",
      description:
        "Adjust your default income allocation ratios to better match your financial strategy.",
      highlightSelector: ".allocation-settings",
    },
    {
      title: "Notification Preferences",
      description:
        "Manage how and when you receive notifications and reminders.",
      highlightSelector: ".notification-settings",
    },
  ],
};

const AppTutorial = () => {
  const [location] = useLocation();
  const [currentPage, setCurrentPage] = useState<string>("dashboard");
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isTutorialCompleted, setIsTutorialCompleted] = useLocalStorage(
    "stackr-tutorial-completed",
    false,
  );
  const [completedSections, setCompletedSections] = useLocalStorage<string[]>(
    "stackr-completed-tutorials",
    [],
  );

  useEffect(() => {
    // Extract the current page from the URL
    const pagePath = location.split("/")[1] || "dashboard";
    setCurrentPage(pagePath);

    // Auto-show tutorial for this page if not already seen
    if (
      !isTutorialCompleted &&
      !completedSections.includes(pagePath) &&
      tutorialSections[pagePath]
    ) {
      setShowTutorial(true);
      setCurrentStepIndex(0);
    }
  }, [location, isTutorialCompleted, completedSections]);

  const currentSteps = tutorialSections[currentPage] || [];
  const progress = currentSteps.length
    ? ((currentStepIndex + 1) / currentSteps.length) * 100
    : 0;

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < currentSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setShowTutorial(false);

    // Mark this section as completed
    if (!completedSections.includes(currentPage)) {
      setCompletedSections([...completedSections, currentPage]);
    }

    // If all sections are completed, mark the entire tutorial as completed
    const allSections = Object.keys(tutorialSections);
    const updatedCompleted = [...completedSections, currentPage];
    const allCompleted = allSections.every((section) =>
      updatedCompleted.includes(section),
    );

    if (allCompleted) {
      setIsTutorialCompleted(true);
    }
  };

  const resetTutorial = () => {
    setCompletedSections([]);
    setIsTutorialCompleted(false);
    setShowTutorial(true);
    setCurrentStepIndex(0);
  };

  // Check if we have tutorial steps for this page
  const hasTutorial = tutorialSections[currentPage]?.length > 0;
  const currentStep = currentSteps[currentStepIndex];

  if (!hasTutorial) return null;

  return (
    <>
      {/* Help button that opens the tutorial */}
      <Sheet open={showTutorial} onOpenChange={setShowTutorial}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg z-50 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setShowTutorial(true)}
          >
            <Info className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent className="sm:max-w-md p-0 gap-0" side="right">
          <SheetHeader className="p-6 border-b sticky top-0 bg-background z-10">
            <SheetTitle className="text-xl">App Tutorial</SheetTitle>
            <Button
              variant="ghost"
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
              onClick={() => setShowTutorial(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </SheetHeader>
          <div className="px-6 py-4">
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Step {currentStepIndex + 1} of {currentSteps.length}
                </span>
                <span className="text-sm font-medium">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
          <div className="flex-1 overflow-auto px-6">
            <Card>
              <CardHeader>
                <CardTitle>{currentStep?.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{currentStep?.description}</p>
                {currentStep?.imageUrl && (
                  <div className="rounded-md overflow-hidden border">
                    <img
                      src={currentStep.imageUrl}
                      alt={currentStep.title}
                      className="w-full object-cover"
                    />
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStepIndex === 0}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <Button onClick={handleNext}>
                  {currentStepIndex === currentSteps.length - 1 ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" /> Complete
                    </>
                  ) : (
                    <>
                      Next <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Tutorial Sections</h3>
                <Button variant="ghost" size="sm" onClick={resetTutorial}>
                  Reset All
                </Button>
              </div>
              <div className="space-y-2">
                {Object.entries(tutorialSections).map(([section, steps]) => (
                  <div
                    key={section}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <span className="capitalize">{section}</span>
                    {completedSections.includes(section) ? (
                      <span className="text-sm font-medium text-green-500 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" /> Completed
                      </span>
                    ) : section === currentPage ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCurrentStepIndex(0);
                          setShowTutorial(true);
                        }}
                      >
                        View
                      </Button>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Not visited
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default AppTutorial;
