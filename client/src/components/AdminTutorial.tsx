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
import { X, ArrowRight, ArrowLeft, Shield, CheckCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useAuth } from "@/hooks/use-auth";

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

// Admin-specific tutorial content
const adminTutorialSections: TutorialSections = {
  dashboard: [
    {
      title: "Admin Dashboard",
      description:
        "This is your administrative command center where you can manage users, monitor platform metrics, and oversee the entire Stackr ecosystem.",
      highlightSelector: ".admin-dashboard-header",
    },
    {
      title: "Platform Metrics",
      description:
        "Monitor key platform metrics such as active users, new sign-ups, revenue, and engagement statistics.",
      highlightSelector: ".metrics-grid",
    },
    {
      title: "User Growth",
      description: "Track user acquisition and retention trends over time.",
      highlightSelector: ".growth-chart",
    },
  ],
  "user-management": [
    {
      title: "User Management",
      description: "View, search, filter, and manage all users on the platform.",
      highlightSelector: ".user-management-header",
    },
    {
      title: "User Search",
      description: "Quickly find users by name, email, or ID.",
      highlightSelector: ".user-search",
    },
    {
      title: "User Actions",
      description: "Perform administrative actions like password reset, account status changes, and subscription management.",
      highlightSelector: ".user-actions",
    },
  ],
  "content-management": [
    {
      title: "Content Management",
      description:
        "Create, edit, and publish content for affiliate programs, money challenges, and other platform offerings.",
      highlightSelector: ".content-management-header",
    },
    {
      title: "Affiliate Programs",
      description: "Manage affiliate program listings and track performance metrics.",
      highlightSelector: ".affiliate-programs-section",
    },
    {
      title: "Money Challenges",
      description: "Create and manage money-saving challenges for users to participate in.",
      highlightSelector: ".money-challenges-section",
    },
  ],
  "subscription-management": [
    {
      title: "Subscription Management",
      description: "Oversee user subscriptions, payment processing, and billing.",
      highlightSelector: ".subscription-header",
    },
    {
      title: "Subscription Tiers",
      description: "Manage subscription tiers, pricing, and features.",
      highlightSelector: ".subscription-tiers",
    },
    {
      title: "Payment Processing",
      description: "Monitor payment processing status and manage transaction issues.",
      highlightSelector: ".payment-processing",
    },
  ],
  "gigs-management": [
    {
      title: "Stackr Gigs Management",
      description: "Review, approve, and manage marketplace gigs.",
      highlightSelector: ".gigs-management-header",
    },
    {
      title: "Gig Approval",
      description: "Review and approve new gig submissions from service providers.",
      highlightSelector: ".gig-approval",
    },
    {
      title: "Dispute Resolution",
      description: "Handle disputes between clients and service providers.",
      highlightSelector: ".dispute-resolution",
    },
  ],
  "admin-settings": [
    {
      title: "Admin Settings",
      description: "Configure platform-wide settings and administrative access.",
      highlightSelector: ".admin-settings-header",
    },
    {
      title: "Admin Accounts",
      description: "Manage administrator accounts and permission levels.",
      highlightSelector: ".admin-accounts",
    },
    {
      title: "Platform Configuration",
      description: "Adjust global platform settings and feature flags.",
      highlightSelector: ".platform-config",
    },
  ],
};

const AdminTutorial = () => {
  const { user } = useAuth();
  const [location] = useLocation();
  const [currentPage, setCurrentPage] = useState<string>("dashboard");
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAdminTutorialCompleted, setIsAdminTutorialCompleted] = useLocalStorage(
    "stackr-admin-tutorial-completed",
    false,
  );
  const [completedSections, setCompletedSections] = useLocalStorage<string[]>(
    "stackr-admin-completed-tutorials",
    [],
  );

  // Only show for admin users
  if (!user || user.role !== "admin") {
    return null;
  }

  useEffect(() => {
    // Extract the current page from the URL
    const pagePath = location.split("/")[1] || "dashboard";
    setCurrentPage(pagePath);

    // Auto-show tutorial for this page if not already seen
    if (
      !isAdminTutorialCompleted &&
      !completedSections.includes(pagePath) &&
      adminTutorialSections[pagePath]
    ) {
      setShowTutorial(true);
      setCurrentStepIndex(0);
    }
  }, [location, isAdminTutorialCompleted, completedSections]);

  const currentSteps = adminTutorialSections[currentPage] || [];
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
    const allSections = Object.keys(adminTutorialSections);
    const updatedCompleted = [...completedSections, currentPage];
    const allCompleted = allSections.every((section) =>
      updatedCompleted.includes(section),
    );

    if (allCompleted) {
      setIsAdminTutorialCompleted(true);
    }
  };

  const resetTutorial = () => {
    setCompletedSections([]);
    setIsAdminTutorialCompleted(false);
    setShowTutorial(true);
    setCurrentStepIndex(0);
  };

  // Check if we have tutorial steps for this page
  const hasTutorial = adminTutorialSections[currentPage]?.length > 0;
  const currentStep = currentSteps[currentStepIndex];

  if (!hasTutorial) return null;

  return (
    <>
      {/* Admin Help button that opens the tutorial */}
      <Sheet open={showTutorial} onOpenChange={setShowTutorial}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed bottom-6 right-20 h-12 w-12 rounded-full shadow-lg z-50 bg-purple-600 text-white hover:bg-purple-700"
            onClick={() => setShowTutorial(true)}
          >
            <Shield className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent className="sm:max-w-md p-0 gap-0" side="right">
          <SheetHeader className="p-6 border-b sticky top-0 bg-background z-10">
            <SheetTitle className="text-xl flex items-center">
              <Shield className="mr-2 h-5 w-5 text-purple-600" />
              Admin Tutorial
            </SheetTitle>
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
            <Card className="border-purple-200">
              <CardHeader className="bg-purple-50 dark:bg-purple-900/10">
                <CardTitle>{currentStep?.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
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
                <Button onClick={handleNext} className="bg-purple-600 hover:bg-purple-700">
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
                <h3 className="text-sm font-medium">Admin Tutorial Sections</h3>
                <Button variant="ghost" size="sm" onClick={resetTutorial}>
                  Reset All
                </Button>
              </div>
              <div className="space-y-2">
                {Object.entries(adminTutorialSections).map(([section, steps]) => (
                  <div
                    key={section}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <span className="capitalize">{section.replace("-", " ")}</span>
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

export default AdminTutorial;