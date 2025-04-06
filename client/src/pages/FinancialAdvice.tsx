import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Loader2,
  BrainCircuit,
  ArrowRight,
  Lightbulb,
  LineChart,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Custom component for tab content
const TabPanel = ({
  children,
  value,
  activeTab,
}: {
  children: React.ReactNode;
  value: string;
  activeTab: string;
}) => {
  return (
    <div className={`${activeTab === value ? "block" : "hidden"} space-y-4`}>
      {children}
    </div>
  );
};

// Default userId for demo purposes (would be retrieved from auth context in production)
const DEMO_USER_ID = 1;

const FinancialAdvice = () => {
  const { toast } = useToast();
  const [question, setQuestion] = useState("");
  const [activeTab, setActiveTab] = useState("advice");
  const [expensePeriod, setExpensePeriod] = useState<"week" | "month" | "year">(
    "month",
  );
  const [showFullAdvice, setShowFullAdvice] = useState(false);
  const [preferredProvider, setPreferredProvider] = useState<string>("auto");

  // Add local loading states to avoid buttons being stuck
  const [manuallyLoadingAdvice, setManuallyLoadingAdvice] = useState(false);
  const [manuallyLoadingGoals, setManuallyLoadingGoals] = useState(false);
  const [manuallyLoadingAnalysis, setManuallyLoadingAnalysis] = useState(false);

  // Fetch AI settings to get available providers
  const { data: aiSettings } = useQuery({
    queryKey: ["/api/ai/settings"],
    queryFn: async () => {
      const response = await apiRequest("/api/ai/settings", {
        method: "GET",
      });
      return response;
    },
  });

  // Fetch general financial advice
  const {
    data: adviceData,
    isPending: isQueryLoading,
    refetch: refetchAdvice,
    isError: isAdviceError,
  } = useQuery({
    queryKey: ["/api/ai/financial-advice", question, preferredProvider],
    queryFn: async () => {
      try {
        console.log("Fetching financial advice...");
        const response = await apiRequest("/api/ai/financial-advice", {
          method: "POST",
          body: JSON.stringify({
            userId: DEMO_USER_ID,
            question: question || undefined,
            preferredProvider:
              preferredProvider === "auto" ? undefined : preferredProvider,
          }),
        });

        console.log("Advice response received:", response);

        // Record that the user used AI advice
        await apiRequest("/api/ai/mark-advice-used", {
          method: "POST",
          body: JSON.stringify({
            userId: DEMO_USER_ID,
            adviceType: "financial_advice",
          }),
        }).catch((err) => {
          // Log but don't fail the main request if tracking fails
          console.error("Error tracking advice usage:", err);
        });

        return response;
      } catch (error) {
        console.error("Error fetching financial advice:", error);
        throw error; // Re-throw to let React Query handle it
      }
    },
    enabled: false, // We'll manually trigger this
    retry: 1, // Only retry once on failure
  });

  // Fetch AI suggested goals
  const {
    data: goalSuggestions,
    isPending: isGoalsLoading,
    refetch: refetchGoals,
    isError: isGoalsError,
  } = useQuery({
    queryKey: ["/api/ai/suggest-goals"],
    queryFn: async () => {
      try {
        const response = await apiRequest("/api/ai/suggest-goals", {
          method: "POST",
          body: JSON.stringify({
            userId: DEMO_USER_ID,
          }),
        });

        // Record that the user used AI goal suggestions
        await apiRequest("/api/ai/mark-advice-used", {
          method: "POST",
          body: JSON.stringify({
            userId: DEMO_USER_ID,
            adviceType: "goal_suggestion",
          }),
        }).catch((err) => {
          // Log but don't fail the main request if tracking fails
          console.error("Error tracking goal suggestion usage:", err);
        });

        return response;
      } catch (error) {
        console.error("Error fetching goal suggestions:", error);
        throw error; // Re-throw to let React Query handle it
      }
    },
    enabled: false, // We'll manually trigger this
    retry: 1, // Only retry once on failure
  });

  // Fetch expense analysis
  const {
    data: expenseAnalysis,
    isPending: isAnalysisLoading,
    refetch: refetchAnalysis,
    isError: isAnalysisError,
  } = useQuery({
    queryKey: ["/api/ai/analyze-expenses", expensePeriod],
    queryFn: async () => {
      try {
        const response = await apiRequest("/api/ai/analyze-expenses", {
          method: "POST",
          body: JSON.stringify({
            userId: DEMO_USER_ID,
            period: expensePeriod,
          }),
        });

        // Record that the user used AI expense analysis
        await apiRequest("/api/ai/mark-advice-used", {
          method: "POST",
          body: JSON.stringify({
            userId: DEMO_USER_ID,
            adviceType: "expense_analysis",
          }),
        }).catch((err) => {
          // Log but don't fail the main request if tracking fails
          console.error("Error tracking expense analysis usage:", err);
        });

        return response;
      } catch (error) {
        console.error("Error analyzing expenses:", error);
        throw error; // Re-throw to let React Query handle it
      }
    },
    enabled: false, // We'll manually trigger this
    retry: 1, // Only retry once on failure
  });

  // Combine loading states - make sure to default to false if undefined
  const isAdviceLoading =
    isQueryLoading === true || manuallyLoadingAdvice === true;
  const isGoalSuggestionsLoading =
    isGoalsLoading === true || manuallyLoadingGoals === true;
  const isExpenseAnalysisLoading =
    isAnalysisLoading === true || manuallyLoadingAnalysis === true;

  // Create goal from suggestion mutation
  const createGoalMutation = useMutation({
    mutationFn: async (goalData: any) => {
      return await apiRequest("/api/goals", {
        method: "POST",
        body: JSON.stringify({
          ...goalData,
          userId: DEMO_USER_ID,
          startDate: new Date(),
          currentAmount: "0",
          isCompleted: false,
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Goal Created",
        description: "Your new financial goal has been created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      queryClient.invalidateQueries({
        queryKey: [`/api/users/${DEMO_USER_ID}/goals`],
      });
    },
    onError: (error) => {
      toast({
        title: "Error Creating Goal",
        description:
          "There was a problem creating your goal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGetAdvice = () => {
    console.log("Generating advice button clicked");

    setManuallyLoadingAdvice(true);

    apiRequest("/api/ai/financial-advice", {
      method: "POST",
      body: JSON.stringify({
        userId: DEMO_USER_ID,
        question: question || undefined,
        preferredProvider:
          preferredProvider === "auto" ? undefined : preferredProvider,
      }),
    })
      .then((response) => {
        console.log("Manual API response:", response);

        // Record usage
        return apiRequest("/api/ai/mark-advice-used", {
          method: "POST",
          body: JSON.stringify({
            userId: DEMO_USER_ID,
            adviceType: "financial_advice",
          }),
        })
          .catch(() => {}) // Ignore tracking errors
          .then(() => response); // Return original response
      })
      .then((response) => {
        // Update cache
        queryClient.setQueryData(
          ["/api/ai/financial-advice", question, preferredProvider],
          response,
        );

        // Show success message
        toast({
          title: "Success!",
          description: "Financial advice generated successfully.",
        });
      })
      .catch((error) => {
        console.error("Error fetching advice:", error);

        // Display more specific error messages based on the error response
        let errorMessage =
          "Failed to generate financial advice. Please try again.";

        if (error.response) {
          // Handle specific API error responses
          if (error.response.status === 429) {
            if (error.response.data?.errorType === "quota_exceeded") {
              errorMessage =
                "AI API quota has been exceeded. The system will automatically try another AI provider.";
            } else if (error.response.data?.errorType === "rate_limited") {
              errorMessage =
                "Too many requests to the AI service. Please try again in a few minutes.";
            }
          }

          // Use the message from the server if available
          if (error.response.data?.message) {
            errorMessage = error.response.data.message;
          }
        }

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });

        // Update data cache to include error information if needed
        queryClient.setQueryData(
          ["/api/ai/financial-advice", question, preferredProvider],
          {
            error: true,
            errorType: error.response?.data?.errorType || "unknown",
          },
        );
      })
      .finally(() => {
        // Always reset loading state
        setManuallyLoadingAdvice(false);
      });
  };

  const handleGetGoalSuggestions = () => {
    console.log("Generating goal suggestions button clicked");

    setManuallyLoadingGoals(true);

    apiRequest("/api/ai/suggest-goals", {
      method: "POST",
      body: JSON.stringify({
        userId: DEMO_USER_ID,
      }),
    })
      .then((response) => {
        console.log("Manual API response (goals):", response);

        // Record usage
        return apiRequest("/api/ai/mark-advice-used", {
          method: "POST",
          body: JSON.stringify({
            userId: DEMO_USER_ID,
            adviceType: "goal_suggestion",
          }),
        })
          .catch(() => {}) // Ignore tracking errors
          .then(() => response); // Return original response
      })
      .then((response) => {
        // Update cache
        queryClient.setQueryData(["/api/ai/suggest-goals"], response);

        // Show success message
        toast({
          title: "Success!",
          description: "Goal suggestions generated successfully.",
        });
      })
      .catch((error) => {
        console.error("Error fetching goal suggestions:", error);

        // Display more specific error messages based on the error response
        let errorMessage =
          "Failed to generate goal suggestions. Please try again.";

        if (error.response) {
          // Handle specific API error responses
          if (error.response.status === 429) {
            if (error.response.data?.errorType === "quota_exceeded") {
              errorMessage =
                "AI API quota has been exceeded. The system will automatically try another AI provider.";
            } else if (error.response.data?.errorType === "rate_limited") {
              errorMessage =
                "Too many requests to the AI service. Please try again in a few minutes.";
            }
          }

          // Use the message from the server if available
          if (error.response.data?.message) {
            errorMessage = error.response.data.message;
          }
        }

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });

        // Update data cache to include error information if needed
        queryClient.setQueryData(["/api/ai/suggest-goals"], {
          error: true,
          errorType: error.response?.data?.errorType || "unknown",
        });
      })
      .finally(() => {
        // Always reset loading state
        setManuallyLoadingGoals(false);
      });
  };

  const handleAnalyzeExpenses = () => {
    console.log("Analyzing expenses button clicked");

    setManuallyLoadingAnalysis(true);

    apiRequest("/api/ai/analyze-expenses", {
      method: "POST",
      body: JSON.stringify({
        userId: DEMO_USER_ID,
        period: expensePeriod,
      }),
    })
      .then((response) => {
        console.log("Manual API response (expenses):", response);

        // Record usage
        return apiRequest("/api/ai/mark-advice-used", {
          method: "POST",
          body: JSON.stringify({
            userId: DEMO_USER_ID,
            adviceType: "expense_analysis",
          }),
        })
          .catch(() => {}) // Ignore tracking errors
          .then(() => response); // Return original response
      })
      .then((response) => {
        // Update cache
        queryClient.setQueryData(
          ["/api/ai/analyze-expenses", expensePeriod],
          response,
        );

        // Show success message
        toast({
          title: "Success!",
          description: "Expense analysis generated successfully.",
        });
      })
      .catch((error) => {
        console.error("Error analyzing expenses:", error);

        // Display more specific error messages based on the error response
        let errorMessage = "Failed to analyze expenses. Please try again.";

        if (error.response) {
          // Handle specific API error responses
          if (error.response.status === 429) {
            if (error.response.data?.errorType === "quota_exceeded") {
              errorMessage =
                "AI API quota has been exceeded. The system will automatically try another AI provider.";
            } else if (error.response.data?.errorType === "rate_limited") {
              errorMessage =
                "Too many requests to the AI service. Please try again in a few minutes.";
            }
          }

          // Use the message from the server if available
          if (error.response.data?.message) {
            errorMessage = error.response.data.message;
          }
        }

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });

        // Update data cache to include error information if needed
        queryClient.setQueryData(["/api/ai/analyze-expenses", expensePeriod], {
          error: true,
          errorType: error.response?.data?.errorType || "unknown",
        });
      })
      .finally(() => {
        // Always reset loading state
        setManuallyLoadingAnalysis(false);
      });
  };

  const handleCreateGoalFromSuggestion = (goal: any) => {
    createGoalMutation.mutate({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      type: "savings",
      description: goal.description,
      deadline: new Date(
        new Date().setMonth(
          new Date().getMonth() +
            (goal.timeframe.includes("month")
              ? parseInt(goal.timeframe.split(" ")[0])
              : parseInt(goal.timeframe.split(" ")[0]) * 12),
        ),
      ),
    });
  };

  // Render helpers
  const renderAdviceSuggestions = () => {
    if (
      !adviceData?.suggestions ||
      adviceData.suggestions.length === 0 ||
      adviceData.error
    ) {
      return <p className="text-muted-foreground">No suggestions available.</p>;
    }

    return (
      <div className="space-y-2 mt-4">
        {adviceData.suggestions.map((suggestion: string, index: number) => (
          <div key={index} className="flex items-start gap-2">
            <div className="bg-primary/10 p-1 rounded-full mt-0.5">
              <Lightbulb className="h-4 w-4 text-primary" />
            </div>
            <p>{suggestion}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden px-3 sm:px-6 py-4 sm:py-6">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4 sm:mb-6">
        AI-Powered Stackr Advice
      </h1>

      <div className="space-y-4">
        <div className="flex flex-row gap-2 w-full overflow-x-auto pb-2">
          <Button
            variant={activeTab === "advice" ? "default" : "outline"}
            className="flex items-center whitespace-nowrap"
            onClick={() => setActiveTab("advice")}
          >
            <BrainCircuit className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="whitespace-nowrap">Stackr Advice</span>
          </Button>

          <Button
            variant={activeTab === "goals" ? "default" : "outline"}
            className="flex items-center whitespace-nowrap"
            onClick={() => setActiveTab("goals")}
          >
            <Lightbulb className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="whitespace-nowrap">Goal Suggestions</span>
          </Button>

          <Button
            variant={activeTab === "expenses" ? "default" : "outline"}
            className="flex items-center whitespace-nowrap"
            onClick={() => setActiveTab("expenses")}
          >
            <LineChart className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="whitespace-nowrap">Expense Analysis</span>
          </Button>
        </div>

        {/* Financial Advice Tab */}
        <TabPanel value="advice" activeTab={activeTab}>
          <Card className="overflow-hidden border-gray-200">
            <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
              <CardTitle className="text-lg sm:text-xl mb-2">
                Get Personalized Stackr Advice
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm max-w-full whitespace-normal break-words">
                Our AI will provide customized financial advice based on your
                income, expenses, and goals.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 py-4 sm:px-6 sm:py-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="question" className="text-sm font-medium">
                    Ask a specific question (optional)
                  </Label>
                  <Textarea
                    id="question"
                    placeholder="E.g., How can I save more money for retirement? Should I focus on reducing expenses?"
                    className="min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ai-provider" className="text-sm font-medium">
                    Choose AI Provider (Optional)
                  </Label>
                  <Select
                    value={preferredProvider}
                    onValueChange={setPreferredProvider}
                  >
                    <SelectTrigger id="ai-provider" className="w-full">
                      <SelectValue placeholder="Auto (System Default)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">
                        Auto (System Default)
                      </SelectItem>
                      {aiSettings?.availableProviders
                        ?.filter((provider: string) => provider.trim() !== "")
                        .map((provider: string) => (
                          <SelectItem key={provider} value={provider}>
                            {provider.charAt(0).toUpperCase() +
                              provider.slice(1)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Select a specific AI provider or leave as "Auto" to use the
                    system default.
                  </p>
                </div>

                {isAdviceError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      {adviceData?.errorType === "quota_exceeded"
                        ? "AI API quota has been exceeded. The system will automatically try another AI provider."
                        : adviceData?.errorType === "rate_limited"
                          ? "Too many requests to the AI service. Please try again in a few minutes."
                          : "Unable to generate financial advice at this time. Please try again later."}
                    </AlertDescription>
                  </Alert>
                )}

                {adviceData && !adviceData.error && adviceData.advice && (
                  <div className="mt-6 space-y-4">
                    {adviceData.summary && (
                      <Alert>
                        <AlertTitle>Summary</AlertTitle>
                        <AlertDescription>
                          {adviceData.summary}
                        </AlertDescription>
                      </Alert>
                    )}

                    {adviceData.provider && (
                      <div className="flex items-center justify-end space-x-2 text-xs text-muted-foreground italic">
                        <span>Powered by:</span>
                        <Badge variant="outline" className="font-normal">
                          {adviceData.provider === "openai"
                            ? "OpenAI GPT-4o"
                            : adviceData.provider === "anthropic"
                              ? "Anthropic Claude"
                              : adviceData.provider === "perplexity"
                                ? "Perplexity AI"
                                : adviceData.provider === "mistral"
                                  ? "Mistral AI"
                                  : adviceData.provider === "llama"
                                    ? "LLaMA"
                                    : adviceData.provider === "open-assistant"
                                      ? "Open Assistant"
                                      : adviceData.provider === "whisper"
                                        ? "Whisper"
                                        : adviceData.provider === "scikit-learn"
                                          ? "scikit-learn"
                                          : adviceData.provider === "fasttext"
                                            ? "fastText"
                                            : adviceData.provider ===
                                                "json-logic"
                                              ? "JSON Logic"
                                              : adviceData.provider === "t5"
                                                ? "T5"
                                                : "AI Assistant"}
                        </Badge>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">
                          Detailed Advice
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="show-full"
                            checked={showFullAdvice}
                            onCheckedChange={setShowFullAdvice}
                          />
                          <Label htmlFor="show-full">Show Full Details</Label>
                        </div>
                      </div>

                      <div className="text-sm leading-relaxed">
                        {showFullAdvice ? (
                          <div className="whitespace-pre-line">
                            {adviceData.advice}
                          </div>
                        ) : (
                          <div>
                            {adviceData.advice.substring(0, 300)}...
                            <Button
                              variant="link"
                              onClick={() => setShowFullAdvice(true)}
                              className="p-0 h-auto"
                            >
                              Read more
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        Suggested Actions
                      </h3>
                      {renderAdviceSuggestions()}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleGetAdvice}
                disabled={manuallyLoadingAdvice === true}
                className="w-full"
              >
                {manuallyLoadingAdvice === true ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Advice...
                  </>
                ) : (
                  <>
                    {adviceData ? "Refresh Advice" : "Get Stackr Advice"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabPanel>

        {/* Goal Suggestions Tab */}
        <TabPanel value="goals" activeTab={activeTab}>
          <Card className="overflow-hidden border-gray-200">
            <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
              <CardTitle className="text-lg sm:text-xl mb-2">
                AI-Suggested Financial Goals
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm max-w-full whitespace-normal break-words">
                Based on your income patterns, our AI can suggest realistic
                financial goals to help you succeed.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 py-4 sm:px-6 sm:py-6">
              {isGoalsError && (
                <Alert variant="destructive" className="mb-2">
                  <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <AlertTitle className="text-xs sm:text-sm font-medium">
                    Error
                  </AlertTitle>
                  <AlertDescription className="text-xs sm:text-sm">
                    {goalSuggestions?.errorType === "quota_exceeded"
                      ? "AI API quota has been exceeded. The system will automatically try another AI provider."
                      : goalSuggestions?.errorType === "rate_limited"
                        ? "Too many requests to the AI service. Please try again in a few minutes."
                        : "Unable to generate goal suggestions at this time. Please try again later."}
                  </AlertDescription>
                </Alert>
              )}

              {goalSuggestions && goalSuggestions.goals && (
                <div className="space-y-4 sm:space-y-6">
                  {goalSuggestions.provider && (
                    <div className="flex items-center justify-end space-x-2 text-xs text-muted-foreground italic">
                      <span>Powered by:</span>
                      <Badge variant="outline" className="font-normal">
                        {goalSuggestions.provider === "openai"
                          ? "OpenAI GPT-4o"
                          : goalSuggestions.provider === "anthropic"
                            ? "Anthropic Claude"
                            : goalSuggestions.provider === "perplexity"
                              ? "Perplexity AI"
                              : goalSuggestions.provider === "mistral"
                                ? "Mistral AI"
                                : goalSuggestions.provider === "llama"
                                  ? "LLaMA"
                                  : goalSuggestions.provider ===
                                      "open-assistant"
                                    ? "Open Assistant"
                                    : goalSuggestions.provider === "whisper"
                                      ? "Whisper"
                                      : goalSuggestions.provider ===
                                          "scikit-learn"
                                        ? "scikit-learn"
                                        : goalSuggestions.provider ===
                                            "fasttext"
                                          ? "fastText"
                                          : goalSuggestions.provider ===
                                              "json-logic"
                                            ? "JSON Logic"
                                            : goalSuggestions.provider === "t5"
                                              ? "T5"
                                              : "AI Assistant"}
                      </Badge>
                    </div>
                  )}
                  {goalSuggestions.goals.map((goal: any, index: number) => (
                    <Card
                      key={index}
                      className="overflow-hidden border-gray-100"
                    >
                      <div className="bg-primary/10 px-3 sm:px-4 py-2 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                        <h3 className="font-medium text-sm sm:text-base">
                          {goal.name}
                        </h3>
                        <Badge
                          variant="outline"
                          className="self-start sm:self-auto text-xs"
                        >
                          {goal.timeframe}
                        </Badge>
                      </div>
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            Target Amount
                          </span>
                          <span className="font-semibold text-sm sm:text-base">
                            $
                            {typeof goal.targetAmount === "number"
                              ? goal.targetAmount.toFixed(2)
                              : goal.targetAmount}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm mb-3 sm:mb-4">
                          {goal.description}
                        </p>
                        <Button
                          variant="outline"
                          className="w-full text-xs sm:text-sm"
                          onClick={() => handleCreateGoalFromSuggestion(goal)}
                          disabled={createGoalMutation.isPending}
                        >
                          {createGoalMutation.isPending ? (
                            <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                          ) : (
                            <>Create This Goal</>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {!goalSuggestions && !isGoalSuggestionsLoading && (
                <div className="flex flex-col items-center justify-center text-center p-4 sm:p-8">
                  <Lightbulb className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">
                    No Goal Suggestions Yet
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
                    Click the button below to generate AI-powered goal
                    suggestions based on your financial situation.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="px-4 py-4 sm:px-6">
              <Button
                onClick={handleGetGoalSuggestions}
                disabled={manuallyLoadingGoals === true}
                className="w-full text-sm sm:text-base"
              >
                {manuallyLoadingGoals === true ? (
                  <>
                    <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    <span className="whitespace-nowrap">
                      Generating Suggestions...
                    </span>
                  </>
                ) : (
                  <>
                    <span className="whitespace-nowrap">
                      {goalSuggestions
                        ? "Refresh Goal Suggestions"
                        : "Get Goal Suggestions"}
                    </span>
                    <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabPanel>

        {/* Expense Analysis Tab */}
        <TabPanel value="expenses" activeTab={activeTab}>
          <Card className="overflow-hidden border-gray-200">
            <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
              <CardTitle className="text-lg sm:text-xl mb-2">
                Expense Analysis & Optimization
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm max-w-full whitespace-normal break-words">
                Let our AI analyze your spending patterns and suggest ways to
                optimize your expenses.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 py-4 sm:px-6 sm:py-6">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <Label className="text-sm font-medium sm:text-base">
                    Time Period:
                  </Label>
                  <div className="flex border rounded-md overflow-hidden w-full sm:w-auto">
                    <Button
                      type="button"
                      variant={expensePeriod === "week" ? "default" : "ghost"}
                      className="rounded-none flex-1 text-xs sm:text-sm py-1 px-2 sm:py-2 sm:px-3"
                      onClick={() => setExpensePeriod("week")}
                    >
                      Week
                    </Button>
                    <Separator orientation="vertical" />
                    <Button
                      type="button"
                      variant={expensePeriod === "month" ? "default" : "ghost"}
                      className="rounded-none flex-1 text-xs sm:text-sm py-1 px-2 sm:py-2 sm:px-3"
                      onClick={() => setExpensePeriod("month")}
                    >
                      Month
                    </Button>
                    <Separator orientation="vertical" />
                    <Button
                      type="button"
                      variant={expensePeriod === "year" ? "default" : "ghost"}
                      className="rounded-none flex-1 text-xs sm:text-sm py-1 px-2 sm:py-2 sm:px-3"
                      onClick={() => setExpensePeriod("year")}
                    >
                      Year
                    </Button>
                  </div>
                </div>

                {isAnalysisError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    <AlertTitle className="text-xs sm:text-sm font-medium">
                      Error
                    </AlertTitle>
                    <AlertDescription className="text-xs sm:text-sm">
                      {expenseAnalysis?.errorType === "quota_exceeded"
                        ? "AI API quota has been exceeded. The system will automatically try another AI provider."
                        : expenseAnalysis?.errorType === "rate_limited"
                          ? "Too many requests to the AI service. Please try again in a few minutes."
                          : "Unable to analyze expenses at this time. Please try again later."}
                    </AlertDescription>
                  </Alert>
                )}

                {expenseAnalysis ? (
                  <div className="space-y-4 sm:space-y-6">
                    {expenseAnalysis.summary && (
                      <Alert>
                        <AlertTitle className="text-sm sm:text-base">
                          Summary
                        </AlertTitle>
                        <AlertDescription className="text-xs sm:text-sm">
                          {expenseAnalysis.summary}
                        </AlertDescription>
                      </Alert>
                    )}

                    {expenseAnalysis.provider && (
                      <div className="flex items-center justify-end space-x-2 text-xs text-muted-foreground italic">
                        <span>Powered by:</span>
                        <Badge variant="outline" className="font-normal">
                          {expenseAnalysis.provider === "openai"
                            ? "OpenAI GPT-4o"
                            : expenseAnalysis.provider === "anthropic"
                              ? "Anthropic Claude"
                              : expenseAnalysis.provider === "perplexity"
                                ? "Perplexity AI"
                                : expenseAnalysis.provider === "mistral"
                                  ? "Mistral AI"
                                  : expenseAnalysis.provider === "llama"
                                    ? "LLaMA"
                                    : expenseAnalysis.provider ===
                                        "open-assistant"
                                      ? "Open Assistant"
                                      : expenseAnalysis.provider === "whisper"
                                        ? "Whisper"
                                        : expenseAnalysis.provider ===
                                            "scikit-learn"
                                          ? "scikit-learn"
                                          : expenseAnalysis.provider ===
                                              "fasttext"
                                            ? "fastText"
                                            : expenseAnalysis.provider ===
                                                "json-logic"
                                              ? "JSON Logic"
                                              : expenseAnalysis.provider ===
                                                  "t5"
                                                ? "T5"
                                                : "AI Assistant"}
                        </Badge>
                      </div>
                    )}

                    {expenseAnalysis.topCategories && (
                      <div>
                        <h3 className="text-sm sm:text-base font-medium mb-2">
                          Top Spending Categories
                        </h3>
                        <div className="space-y-2">
                          {expenseAnalysis.topCategories.map(
                            (category: any, index: number) => (
                              <div
                                key={index}
                                className="flex justify-between items-center p-2 sm:p-3 border rounded-md bg-background/50"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-2 h-8 rounded-sm bg-primary/70 opacity-${90 - index * 20}`}
                                  />
                                  <span className="text-xs sm:text-sm font-medium">
                                    {category.name}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="block text-xs sm:text-sm font-semibold">
                                    $
                                    {typeof category.amount === "number"
                                      ? category.amount.toFixed(2)
                                      : category.amount}
                                  </span>
                                  <span className="block text-xs text-muted-foreground">
                                    {category.percentage}%
                                  </span>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                    {expenseAnalysis.insights && (
                      <div>
                        <h3 className="text-sm sm:text-base font-medium mb-2">
                          Insights
                        </h3>
                        <div className="space-y-2">
                          {expenseAnalysis.insights.map(
                            (insight: string, index: number) => (
                              <div
                                key={index}
                                className="flex items-start gap-2 text-xs sm:text-sm"
                              >
                                <div className="bg-primary/10 p-1 rounded-full mt-0.5 flex-shrink-0">
                                  <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                                </div>
                                <p>{insight}</p>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                    {expenseAnalysis.recommendations && (
                      <div>
                        <h3 className="text-sm sm:text-base font-medium mb-2">
                          Recommendations
                        </h3>
                        <div className="space-y-2">
                          {expenseAnalysis.recommendations.map(
                            (recommendation: any, index: number) => (
                              <Card key={index} className="overflow-hidden">
                                <div className="bg-primary/5 p-2 sm:p-3">
                                  <h4 className="font-medium text-xs sm:text-sm">
                                    {recommendation.title}
                                  </h4>
                                </div>
                                <CardContent className="p-2 sm:p-3 text-xs sm:text-sm">
                                  <p>{recommendation.description}</p>
                                  {recommendation.savingsEstimate && (
                                    <div className="mt-2 text-xs sm:text-sm bg-primary/10 rounded-md p-2 text-center">
                                      <span className="font-semibold">
                                        Potential savings: $
                                        {recommendation.savingsEstimate}
                                      </span>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  !isExpenseAnalysisLoading && (
                    <div className="flex flex-col items-center justify-center text-center p-4 sm:p-8">
                      <LineChart className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
                      <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">
                        No Expense Analysis Yet
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
                        Click the button below to analyze your spending patterns
                        and get personalized recommendations.
                      </p>
                    </div>
                  )
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleAnalyzeExpenses}
                disabled={manuallyLoadingAnalysis === true}
                className="w-full text-sm sm:text-base"
              >
                {manuallyLoadingAnalysis === true ? (
                  <>
                    <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    <span className="whitespace-nowrap">
                      Analyzing Expenses...
                    </span>
                  </>
                ) : (
                  <>
                    <span className="whitespace-nowrap">
                      {expenseAnalysis
                        ? "Refresh Analysis"
                        : "Analyze Expenses"}
                    </span>
                    <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabPanel>
      </div>
    </div>
  );
};

export default FinancialAdvice;
