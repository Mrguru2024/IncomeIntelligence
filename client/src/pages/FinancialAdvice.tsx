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
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">
        AI-Powered Financial Advice
      </h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="advice">
            <BrainCircuit className="h-4 w-4 mr-2" />
            Financial Advice
          </TabsTrigger>
          <TabsTrigger value="goals">
            <Lightbulb className="h-4 w-4 mr-2" />
            Goal Suggestions
          </TabsTrigger>
          <TabsTrigger value="expenses">
            <LineChart className="h-4 w-4 mr-2" />
            Expense Analysis
          </TabsTrigger>
        </TabsList>
        
        {/* Financial Advice Tab */}
        <TabsContent value="advice" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Get Personalized Financial Advice</CardTitle>
              <CardDescription>
                Our AI will provide customized financial advice based on your income, expenses, and goals.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="question">Ask a specific question (optional)</Label>
                  <Textarea
                    id="question"
                    placeholder="E.g., How can I save more money for retirement? Should I focus on reducing expenses?"
                    className="min-h-[100px]"
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
          <Card>
            <CardHeader>
              <CardTitle>AI-Suggested Financial Goals</CardTitle>
              <CardDescription>
                Based on your income patterns, our AI can suggest realistic financial goals to help you succeed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isGoalsError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Unable to generate goal suggestions at this time. Please try again later.
                  </AlertDescription>
                </Alert>
              )}
              
              {goalSuggestions && goalSuggestions.goals && (
                <div className="space-y-6">
                  {goalSuggestions.goals.map((goal: any, index: number) => (
                    <Card key={index} className="overflow-hidden">
                      <div className="bg-primary/10 px-4 py-2 flex justify-between items-center">
                        <h3 className="font-medium">{goal.name}</h3>
                        <Badge variant="outline">{goal.timeframe}</Badge>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-muted-foreground">Target Amount</span>
                          <span className="font-semibold">${typeof goal.targetAmount === 'number' ? 
                            goal.targetAmount.toFixed(2) : goal.targetAmount}</span>
                        </div>
                        <p className="text-sm mb-4">{goal.description}</p>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => handleCreateGoalFromSuggestion(goal)}
                          disabled={createGoalMutation.isPending}
                        >
                          {createGoalMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
                <div className="flex flex-col items-center justify-center text-center p-8">
                  <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Goal Suggestions Yet</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Click the button below to generate AI-powered goal suggestions based on your financial situation.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleGetGoalSuggestions} 
                disabled={isGoalsLoading}
                className="w-full"
              >
                {isGoalsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Goal Suggestions...
                  </>
                ) : (
                  <>
                    {goalSuggestions ? "Refresh Goal Suggestions" : "Get Goal Suggestions"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Expense Analysis Tab */}
        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expense Analysis & Optimization</CardTitle>
              <CardDescription>
                Let our AI analyze your spending patterns and suggest ways to optimize your expenses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Label>Time Period:</Label>
                  <div className="flex border rounded-md overflow-hidden">
                    <Button 
                      type="button"
                      variant={expensePeriod === 'week' ? 'default' : 'ghost'} 
                      className="rounded-none"
                      onClick={() => setExpensePeriod('week')}
                    >
                      Week
                    </Button>
                    <Separator orientation="vertical" />
                    <Button 
                      type="button"
                      variant={expensePeriod === 'month' ? 'default' : 'ghost'} 
                      className="rounded-none"
                      onClick={() => setExpensePeriod('month')}
                    >
                      Month
                    </Button>
                    <Separator orientation="vertical" />
                    <Button 
                      type="button"
                      variant={expensePeriod === 'year' ? 'default' : 'ghost'} 
                      className="rounded-none"
                      onClick={() => setExpensePeriod('year')}
                    >
                      Year
                    </Button>
                  </div>
                </div>
                
                {isAnalysisError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      Unable to analyze expenses at this time. Please try again later.
                    </AlertDescription>
                  </Alert>
                )}
                
                {expenseAnalysis && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Analysis</h3>
                      <p className="text-sm leading-relaxed">{expenseAnalysis.analysis}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Optimization Suggestions</h3>
                      <div className="space-y-2">
                        {expenseAnalysis.suggestions && expenseAnalysis.suggestions.map((suggestion: string, index: number) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="bg-primary/10 p-1 rounded-full mt-0.5">
                              <Lightbulb className="h-4 w-4 text-primary" />
                            </div>
                            <p className="text-sm">{suggestion}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {expenseAnalysis.potentialSavings && (
                      <Alert className="bg-primary/10 border-primary">
                        <AlertTitle className="text-primary">Potential Monthly Savings</AlertTitle>
                        <AlertDescription>
                          ${typeof expenseAnalysis.potentialSavings === 'number' ? 
                            expenseAnalysis.potentialSavings.toFixed(2) : expenseAnalysis.potentialSavings}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
                
                {!expenseAnalysis && !isAnalysisLoading && (
                  <div className="flex flex-col items-center justify-center text-center p-8">
                    <LineChart className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Expense Analysis Yet</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Click the button below to analyze your spending patterns and get optimization suggestions.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleAnalyzeExpenses} 
                disabled={isAnalysisLoading}
                className="w-full"
              >
                {isAnalysisLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Expenses...
                  </>
                ) : (
                  <>
                    {expenseAnalysis ? "Refresh Analysis" : "Analyze My Expenses"}
                    <ArrowRight className="ml-2 h-4 w-4" />
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