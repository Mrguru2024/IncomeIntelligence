import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2, BrainCircuit, ArrowRight, Lightbulb, LineChart, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// Default userId for demo purposes (would be retrieved from auth context in production)
const DEMO_USER_ID = 1;

const FinancialAdvice = () => {
  const { toast } = useToast();
  const [question, setQuestion] = useState('');
  const [activeTab, setActiveTab] = useState('advice');
  const [expensePeriod, setExpensePeriod] = useState<'week' | 'month' | 'year'>('month');
  const [showFullAdvice, setShowFullAdvice] = useState(false);
  
  // Fetch general financial advice
  const { 
    data: adviceData, 
    isPending: isAdviceLoading,
    refetch: refetchAdvice,
    isError: isAdviceError 
  } = useQuery({
    queryKey: ['/api/ai/financial-advice', question],
    queryFn: async () => {
      const response = await apiRequest('/api/ai/financial-advice', {
        method: 'POST',
        body: JSON.stringify({ 
          userId: DEMO_USER_ID, 
          question: question || undefined 
        })
      });
      // Record that the user used AI advice
      apiRequest('/api/ai/mark-advice-used', {
        method: 'POST',
        body: JSON.stringify({ 
          userId: DEMO_USER_ID,
          adviceType: 'financial_advice'
        })
      });
      return response;
    },
    enabled: false, // We'll manually trigger this
  });

  // Fetch AI suggested goals
  const { 
    data: goalSuggestions, 
    isPending: isGoalsLoading,
    refetch: refetchGoals,
    isError: isGoalsError 
  } = useQuery({
    queryKey: ['/api/ai/suggest-goals'],
    queryFn: async () => {
      const response = await apiRequest('/api/ai/suggest-goals', {
        method: 'POST',
        body: JSON.stringify({ 
          userId: DEMO_USER_ID
        })
      });
      // Record that the user used AI goal suggestions
      apiRequest('/api/ai/mark-advice-used', {
        method: 'POST',
        body: JSON.stringify({ 
          userId: DEMO_USER_ID,
          adviceType: 'goal_suggestion'
        })
      });
      return response;
    },
    enabled: false, // We'll manually trigger this
  });
  
  // Fetch expense analysis
  const { 
    data: expenseAnalysis,
    isPending: isAnalysisLoading,
    refetch: refetchAnalysis,
    isError: isAnalysisError
  } = useQuery({
    queryKey: ['/api/ai/analyze-expenses', expensePeriod],
    queryFn: async () => {
      const response = await apiRequest('/api/ai/analyze-expenses', {
        method: 'POST',
        body: JSON.stringify({ 
          userId: DEMO_USER_ID,
          period: expensePeriod
        })
      });
      // Record that the user used AI expense analysis
      apiRequest('/api/ai/mark-advice-used', {
        method: 'POST',
        body: JSON.stringify({ 
          userId: DEMO_USER_ID,
          adviceType: 'expense_analysis'
        })
      });
      return response;
    },
    enabled: false, // We'll manually trigger this
  });
  
  // Create goal from suggestion mutation
  const createGoalMutation = useMutation({
    mutationFn: async (goalData: any) => {
      return await apiRequest('/api/goals', {
        method: 'POST',
        body: JSON.stringify({
          ...goalData,
          userId: DEMO_USER_ID,
          startDate: new Date(),
          currentAmount: "0",
          isCompleted: false
        })
      });
    },
    onSuccess: () => {
      toast({
        title: "Goal Created",
        description: "Your new financial goal has been created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${DEMO_USER_ID}/goals`] });
    },
    onError: (error) => {
      toast({
        title: "Error Creating Goal",
        description: "There was a problem creating your goal. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleGetAdvice = () => {
    refetchAdvice();
  };
  
  const handleGetGoalSuggestions = () => {
    refetchGoals();
  };
  
  const handleAnalyzeExpenses = () => {
    refetchAnalysis();
  };
  
  const handleCreateGoalFromSuggestion = (goal: any) => {
    createGoalMutation.mutate({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      type: 'savings',
      description: goal.description,
      deadline: new Date(new Date().setMonth(new Date().getMonth() + 
        (goal.timeframe.includes('month') ? 
          parseInt(goal.timeframe.split(' ')[0]) : 
          parseInt(goal.timeframe.split(' ')[0]) * 12)))
    });
  };
  
  // Render helpers
  const renderAdviceSuggestions = () => {
    if (!adviceData?.suggestions || adviceData.suggestions.length === 0) {
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
        AI-Powered Financial Advice
      </h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0">
          <TabsTrigger value="advice" className="px-3 py-2 text-sm sm:text-base flex items-center justify-center">
            <BrainCircuit className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="whitespace-nowrap">Financial Advice</span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="px-3 py-2 text-sm sm:text-base flex items-center justify-center">
            <Lightbulb className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="whitespace-nowrap">Goal Suggestions</span>
          </TabsTrigger>
          <TabsTrigger value="expenses" className="px-3 py-2 text-sm sm:text-base flex items-center justify-center">
            <LineChart className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="whitespace-nowrap">Expense Analysis</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Financial Advice Tab */}
        <TabsContent value="advice" className="space-y-4">
          <Card className="overflow-hidden border-gray-200">
            <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
              <CardTitle className="text-lg sm:text-xl">Get Personalized Financial Advice</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Our AI will provide customized financial advice based on your income, expenses, and goals.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 py-4 sm:px-6 sm:py-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="question" className="text-sm font-medium">Ask a specific question (optional)</Label>
                  <Textarea
                    id="question"
                    placeholder="E.g., How can I save more money for retirement? Should I focus on reducing expenses?"
                    className="min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                  />
                </div>
                
                {isAdviceError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      Unable to generate financial advice at this time. Please try again later.
                    </AlertDescription>
                  </Alert>
                )}
                
                {adviceData && (
                  <div className="mt-6 space-y-4">
                    {adviceData.summary && (
                      <Alert>
                        <AlertTitle>Summary</AlertTitle>
                        <AlertDescription>{adviceData.summary}</AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Detailed Advice</h3>
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
                          <div className="whitespace-pre-line">{adviceData.advice}</div>
                        ) : (
                          <div>{adviceData.advice.substring(0, 300)}... 
                            <Button variant="link" onClick={() => setShowFullAdvice(true)} className="p-0 h-auto">
                              Read more
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Suggested Actions</h3>
                      {renderAdviceSuggestions()}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleGetAdvice} 
                disabled={isAdviceLoading}
                className="w-full"
              >
                {isAdviceLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Advice...
                  </>
                ) : (
                  <>
                    {adviceData ? "Refresh Advice" : "Get Financial Advice"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Goal Suggestions Tab */}
        <TabsContent value="goals" className="space-y-4">
          <Card className="overflow-hidden border-gray-200">
            <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
              <CardTitle className="text-lg sm:text-xl">AI-Suggested Financial Goals</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Based on your income patterns, our AI can suggest realistic financial goals to help you succeed.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 py-4 sm:px-6 sm:py-6">
              {isGoalsError && (
                <Alert variant="destructive" className="mb-2">
                  <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <AlertTitle className="text-xs sm:text-sm font-medium">Error</AlertTitle>
                  <AlertDescription className="text-xs sm:text-sm">
                    Unable to generate goal suggestions at this time. Please try again later.
                  </AlertDescription>
                </Alert>
              )}
              
              {goalSuggestions && goalSuggestions.goals && (
                <div className="space-y-4 sm:space-y-6">
                  {goalSuggestions.goals.map((goal: any, index: number) => (
                    <Card key={index} className="overflow-hidden border-gray-100">
                      <div className="bg-primary/10 px-3 sm:px-4 py-2 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                        <h3 className="font-medium text-sm sm:text-base">{goal.name}</h3>
                        <Badge variant="outline" className="self-start sm:self-auto text-xs">{goal.timeframe}</Badge>
                      </div>
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs sm:text-sm text-muted-foreground">Target Amount</span>
                          <span className="font-semibold text-sm sm:text-base">${typeof goal.targetAmount === 'number' ? 
                            goal.targetAmount.toFixed(2) : goal.targetAmount}</span>
                        </div>
                        <p className="text-xs sm:text-sm mb-3 sm:mb-4">{goal.description}</p>
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
              
              {!goalSuggestions && !isGoalsLoading && (
                <div className="flex flex-col items-center justify-center text-center p-4 sm:p-8">
                  <Lightbulb className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">No Goal Suggestions Yet</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
                    Click the button below to generate AI-powered goal suggestions based on your financial situation.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="px-4 py-4 sm:px-6">
              <Button 
                onClick={handleGetGoalSuggestions} 
                disabled={isGoalsLoading}
                className="w-full text-sm sm:text-base"
              >
                {isGoalsLoading ? (
                  <>
                    <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    <span className="whitespace-nowrap">Generating Suggestions...</span>
                  </>
                ) : (
                  <>
                    <span className="whitespace-nowrap">{goalSuggestions ? "Refresh Goal Suggestions" : "Get Goal Suggestions"}</span>
                    <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Expense Analysis Tab */}
        <TabsContent value="expenses" className="space-y-4">
          <Card className="overflow-hidden border-gray-200">
            <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
              <CardTitle className="text-lg sm:text-xl">Expense Analysis & Optimization</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Let our AI analyze your spending patterns and suggest ways to optimize your expenses.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 py-4 sm:px-6 sm:py-6">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <Label className="text-sm font-medium sm:text-base">Time Period:</Label>
                  <div className="flex border rounded-md overflow-hidden w-full sm:w-auto">
                    <Button 
                      type="button"
                      variant={expensePeriod === 'week' ? 'default' : 'ghost'} 
                      className="rounded-none flex-1 text-xs sm:text-sm py-1 px-2 sm:py-2 sm:px-3"
                      onClick={() => setExpensePeriod('week')}
                    >
                      Week
                    </Button>
                    <Separator orientation="vertical" />
                    <Button 
                      type="button"
                      variant={expensePeriod === 'month' ? 'default' : 'ghost'} 
                      className="rounded-none flex-1 text-xs sm:text-sm py-1 px-2 sm:py-2 sm:px-3"
                      onClick={() => setExpensePeriod('month')}
                    >
                      Month
                    </Button>
                    <Separator orientation="vertical" />
                    <Button 
                      type="button"
                      variant={expensePeriod === 'year' ? 'default' : 'ghost'} 
                      className="rounded-none flex-1 text-xs sm:text-sm py-1 px-2 sm:py-2 sm:px-3"
                      onClick={() => setExpensePeriod('year')}
                    >
                      Year
                    </Button>
                  </div>
                </div>
                
                {isAnalysisError && (
                  <Alert variant="destructive" className="mb-2">
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    <AlertTitle className="text-xs sm:text-sm font-medium">Error</AlertTitle>
                    <AlertDescription className="text-xs sm:text-sm">
                      Unable to analyze expenses at this time. Please try again later.
                    </AlertDescription>
                  </Alert>
                )}
                
                {expenseAnalysis && (
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Analysis</h3>
                      <p className="text-xs sm:text-sm leading-relaxed">{expenseAnalysis.analysis}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Optimization Suggestions</h3>
                      <div className="space-y-2">
                        {expenseAnalysis.suggestions && expenseAnalysis.suggestions.map((suggestion: string, index: number) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="bg-primary/10 p-1 rounded-full mt-0.5 flex-shrink-0">
                              <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                            </div>
                            <p className="text-xs sm:text-sm">{suggestion}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {expenseAnalysis.potentialSavings && (
                      <Alert className="bg-primary/10 border-primary">
                        <AlertTitle className="text-primary text-sm sm:text-base">Potential Monthly Savings</AlertTitle>
                        <AlertDescription className="text-xs sm:text-sm font-semibold">
                          ${typeof expenseAnalysis.potentialSavings === 'number' ? 
                            expenseAnalysis.potentialSavings.toFixed(2) : expenseAnalysis.potentialSavings}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
                
                {!expenseAnalysis && !isAnalysisLoading && (
                  <div className="flex flex-col items-center justify-center text-center p-4 sm:p-8">
                    <LineChart className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">No Expense Analysis Yet</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
                      Click the button below to analyze your spending patterns and get optimization suggestions.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="px-4 py-4 sm:px-6">
              <Button 
                onClick={handleAnalyzeExpenses} 
                disabled={isAnalysisLoading}
                className="w-full text-sm sm:text-base"
              >
                {isAnalysisLoading ? (
                  <>
                    <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    <span className="whitespace-nowrap">Analyzing Expenses...</span>
                  </>
                ) : (
                  <>
                    <span className="whitespace-nowrap">{expenseAnalysis ? "Refresh Analysis" : "Analyze My Expenses"}</span>
                    <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialAdvice;