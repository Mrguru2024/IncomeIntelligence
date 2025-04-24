import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle, CheckCircle, PlusCircle, Sparkles, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Define expense categories
const expenseCategories = [
  "Food & Dining",
  "Entertainment", 
  "Shopping",
  "Housing",
  "Transportation",
  "Travel",
  "Health & Fitness",
  "Personal Care",
  "Education",
  "Gifts & Donations", 
  "Utilities",
  "Subscriptions",
  "Other"
];

// Form schema for creating/updating spending limits
const limitFormSchema = z.object({
  category: z.string({
    required_error: "Please select a category",
  }),
  limitAmount: z.coerce.number().min(1, "Limit must be at least 1"),
  cycle: z.enum(["weekly", "monthly"], {
    required_error: "Please select a cycle",
  }),
  isActive: z.boolean().default(true),
});

// Form schema for logging expenses
const logFormSchema = z.object({
  category: z.string({
    required_error: "Please select a category",
  }),
  amountSpent: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  description: z.string().optional(),
  source: z.string().default("manual"),
});

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

// Helper function to format date
const formatDate = (date: string) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date));
};

// Main component
export default function SpendingGuardrails() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Add a debug log when this component renders
  useEffect(() => {
    console.log("SpendingGuardrails component rendered", { activeTab });
  }, [activeTab]);

  // Forms
  const limitForm = useForm<z.infer<typeof limitFormSchema>>({
    resolver: zodResolver(limitFormSchema),
    defaultValues: {
      cycle: "monthly",
      isActive: true,
    },
  });

  const logForm = useForm<z.infer<typeof logFormSchema>>({
    resolver: zodResolver(logFormSchema),
    defaultValues: {
      source: "manual",
    },
  });

  // Get spending limits
  const { 
    data: spendingLimits, 
    isLoading: isLoadingLimits,
    error: limitsError
  } = useQuery({
    queryKey: ['/api/guardrails/limits'],
    refetchInterval: 300000, // 5 minutes
  });
  
  // Debug logging for API calls
  useEffect(() => {
    console.log("Guardrails API status:", { 
      spendingLimits, 
      isLoadingLimits,
      error: limitsError ? (limitsError as Error).message : null
    });
  }, [spendingLimits, isLoadingLimits, limitsError]);

  // Get spending summary
  const { 
    data: spendingSummary, 
    isLoading: isLoadingSummary 
  } = useQuery({
    queryKey: ['/api/guardrails/summary'],
    refetchInterval: 300000, // 5 minutes
  });

  // Get alerts
  const { 
    data: spendingAlerts, 
    isLoading: isLoadingAlerts 
  } = useQuery({
    queryKey: ['/api/guardrails/alerts'],
    refetchInterval: 300000, // 5 minutes
  });

  // Get weekly reflection with AI suggestions
  const { 
    data: weeklyReflection, 
    isLoading: isLoadingReflection 
  } = useQuery({
    queryKey: ['/api/guardrails/reflection'],
    refetchInterval: 600000, // 10 minutes
  });

  // Get reflection history
  const { 
    data: reflectionHistory, 
    isLoading: isLoadingHistory 
  } = useQuery({
    queryKey: ['/api/guardrails/reflections/history'],
  });

  // Create or update spending limit mutation
  const limitMutation = useMutation({
    mutationFn: async (data: z.infer<typeof limitFormSchema>) => {
      const response = await apiRequest('POST', '/api/guardrails/limits', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Spending limit set",
        description: "Your spending limit has been successfully updated",
      });
      limitForm.reset({
        category: "",
        limitAmount: undefined,
        cycle: "monthly",
        isActive: true,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/guardrails/limits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/guardrails/summary'] });
      queryClient.invalidateQueries({ queryKey: ['/api/guardrails/alerts'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to set limit",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  // Log spending mutation
  const logMutation = useMutation({
    mutationFn: async (data: z.infer<typeof logFormSchema>) => {
      const response = await apiRequest('POST', '/api/guardrails/logs', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Expense logged",
        description: "Your expense has been successfully logged",
      });
      logForm.reset({
        category: "",
        amountSpent: undefined,
        description: "",
        source: "manual",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/guardrails/summary'] });
      queryClient.invalidateQueries({ queryKey: ['/api/guardrails/alerts'] });
      // Switch to dashboard to see updated results
      setActiveTab("dashboard");
    },
    onError: (error) => {
      toast({
        title: "Failed to log expense",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  // Handle spending limit form submission
  const onSubmitLimitForm = (data: z.infer<typeof limitFormSchema>) => {
    limitMutation.mutate(data);
  };

  // Handle expense logging form submission
  const onSubmitLogForm = (data: z.infer<typeof logFormSchema>) => {
    logMutation.mutate(data);
  };

  return (
    <div className="container py-8 max-w-7xl">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text">Stackr Guardrails</h1>
            <p className="text-muted-foreground">
              Set spending limits, track expenses, and stay within budget
            </p>
          </div>
          
          {spendingAlerts && (
            <div className="flex gap-2 flex-wrap justify-end">
              {spendingAlerts.hasOverages && (
                <Badge variant="destructive" className="px-3 py-1.5 text-md flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>Over Budget</span>
                </Badge>
              )}
              {spendingAlerts.hasWarnings && !spendingAlerts.hasOverages && (
                <Badge variant="warning" className="px-3 py-1.5 text-md flex items-center gap-1 bg-amber-500">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Approaching Limits</span>
                </Badge>
              )}
              {!spendingAlerts.hasWarnings && !spendingAlerts.hasOverages && (
                <Badge variant="outline" className="px-3 py-1.5 text-md flex items-center gap-1 bg-green-100 text-green-800 border-green-300">
                  <CheckCircle className="h-4 w-4" />
                  <span>Within Budget</span>
                </Badge>
              )}
            </div>
          )}
        </div>

        <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full md:w-auto">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="log">Log Expense</TabsTrigger>
            <TabsTrigger value="limits">Spending Limits</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4">
            {isLoadingSummary ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : spendingSummary ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-full">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Spending Summary</CardTitle>
                      <CardDescription>
                        {formatDate(spendingSummary.startDate)} - {formatDate(spendingSummary.endDate)}
                      </CardDescription>
                    </div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(spendingSummary.totalSpent)}
                      {spendingSummary.totalLimit && (
                        <span className="text-sm text-muted-foreground ml-1">
                          of {formatCurrency(spendingSummary.totalLimit)}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {spendingSummary.categories.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        No expenses logged yet. Start tracking by logging an expense.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {spendingSummary.categories.map((category) => (
                          <div key={category.category} className="space-y-1.5">
                            <div className="flex justify-between text-sm">
                              <span>{category.category}</span>
                              <span>
                                {formatCurrency(category.spent)}
                                {category.limit !== null && (
                                  <span className="text-muted-foreground ml-1">
                                    of {formatCurrency(category.limit)}
                                  </span>
                                )}
                              </span>
                            </div>
                            {category.limit !== null && (
                              <Progress 
                                value={Math.min(category.percentage, 100)} 
                                className={`h-2 ${
                                  category.status === 'over' 
                                    ? 'bg-destructive/25' 
                                    : category.status === 'warning' 
                                      ? 'bg-amber-100' 
                                      : 'bg-muted'
                                }`}
                                indicatorClassName={
                                  category.status === 'over' 
                                    ? 'bg-destructive' 
                                    : category.status === 'warning' 
                                      ? 'bg-amber-500' 
                                      : undefined
                                }
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => setActiveTab("log")}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Log New Expense
                    </Button>
                  </CardFooter>
                </Card>

                {spendingAlerts && spendingAlerts.alerts.length > 0 && (
                  <Card className="col-span-full md:col-span-1">
                    <CardHeader>
                      <CardTitle>Alerts</CardTitle>
                      <CardDescription>Categories requiring attention</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {spendingAlerts.alerts.map((alert, i) => (
                          <div 
                            key={i}
                            className={`p-3 rounded-lg border ${
                              alert.status === 'over'
                                ? 'bg-red-50 border-red-200 text-red-800'
                                : 'bg-amber-50 border-amber-200 text-amber-800'
                            }`}
                          >
                            <div className="font-medium">{alert.category}</div>
                            <div className="text-sm">
                              {formatCurrency(alert.spent)} of {formatCurrency(alert.limit)}
                              {' '}({Math.round(alert.percentage)}%)
                            </div>
                            <div className="text-xs mt-1">
                              {alert.status === 'over'
                                ? 'You have exceeded your limit'
                                : 'Approaching your spending limit'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {weeklyReflection && (
                  <Card className={`${spendingAlerts?.alerts?.length ? 'md:col-span-1 lg:col-span-2' : 'col-span-full'}`}>
                    <CardHeader className="flex flex-row items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle>AI Weekly Insight</CardTitle>
                        <CardDescription>
                          {formatDate(weeklyReflection.weekStartDate)} - {formatDate(weeklyReflection.weekEndDate)}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-md">
                        {weeklyReflection.aiSuggestion}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Get Started with Guardrails</CardTitle>
                  <CardDescription>
                    Set up spending limits and start tracking your expenses
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="py-4">Begin by setting up spending limits for different categories</p>
                  <Button onClick={() => setActiveTab("limits")}>
                    Set Up Spending Limits
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Log Expense Tab */}
          <TabsContent value="log" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Log Expense</CardTitle>
                <CardDescription>
                  Record a new expense to track against your spending limits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...logForm}>
                  <form onSubmit={logForm.handleSubmit(onSubmitLogForm)} className="space-y-6">
                    <FormField
                      control={logForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {expenseCategories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={logForm.control}
                      name="amountSpent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                $
                              </span>
                              <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="0.00"
                                className="pl-7"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={logForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Grocery shopping, Movie tickets"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={logMutation.isPending}
                        className="min-w-32"
                      >
                        {logMutation.isPending ? (
                          <>
                            <div className="animate-spin h-4 w-4 mr-2 border-2 border-b-transparent rounded-full"></div>
                            Logging...
                          </>
                        ) : (
                          <>Log Expense</>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Spending Limits Tab */}
          <TabsContent value="limits" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-5">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Set Spending Limit</CardTitle>
                  <CardDescription>
                    Create or update limits for different expense categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...limitForm}>
                    <form onSubmit={limitForm.handleSubmit(onSubmitLimitForm)} className="space-y-6">
                      <FormField
                        control={limitForm.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {expenseCategories.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={limitForm.control}
                        name="limitAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Limit Amount</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                  $
                                </span>
                                <Input
                                  type="number"
                                  min="1"
                                  step="1"
                                  placeholder="0"
                                  className="pl-7"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={limitForm.control}
                        name="cycle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time Period</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a cycle" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={limitForm.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Active</FormLabel>
                              <FormDescription>
                                Disable if you want to temporarily pause this limit
                              </FormDescription>
                            </div>
                            <FormControl>
                              <div className="flex items-center space-x-2">
                                <div
                                  onClick={() => field.onChange(!field.value)}
                                  className={`relative inline-flex h-6 w-11 cursor-pointer rounded-full transition-colors ${
                                    field.value ? "bg-primary" : "bg-muted"
                                  }`}
                                >
                                  <span
                                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                                      field.value ? "translate-x-6" : "translate-x-1"
                                    }`}
                                    style={{ margin: "2px 0" }}
                                  />
                                </div>
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          disabled={limitMutation.isPending}
                          className="min-w-32"
                        >
                          {limitMutation.isPending ? (
                            <>
                              <div className="animate-spin h-4 w-4 mr-2 border-2 border-b-transparent rounded-full"></div>
                              Saving...
                            </>
                          ) : (
                            <>Save Limit</>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle>Current Spending Limits</CardTitle>
                  <CardDescription>
                    Your active spending limits for different categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingLimits ? (
                    <div className="flex justify-center p-8">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : spendingLimits?.length > 0 ? (
                    <div className="space-y-4">
                      {spendingLimits
                        .sort((a, b) => a.category.localeCompare(b.category))
                        .map((limit) => (
                          <div 
                            key={limit.id} 
                            className={`flex justify-between items-center p-3 rounded-lg border ${
                              !limit.isActive ? 'bg-muted/50' : ''
                            }`}
                          >
                            <div>
                              <div className="font-medium">{limit.category}</div>
                              <div className="text-sm text-muted-foreground">
                                {limit.cycle === 'weekly' ? 'Weekly' : 'Monthly'} limit
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className={`text-xl font-semibold ${!limit.isActive ? 'text-muted-foreground' : ''}`}>
                                {formatCurrency(Number(limit.limitAmount))}
                              </div>
                              {!limit.isActive && (
                                <Badge variant="outline" className="ml-2">Inactive</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                      <div className="mb-2 text-muted-foreground">No spending limits set</div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Set spending limits to keep your finances on track
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span>AI Weekly Spending Insights</span>
                </CardTitle>
                <CardDescription>
                  Get personalized spending insights and suggestions based on your financial patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingReflection || isLoadingHistory ? (
                  <div className="flex justify-center p-8">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : weeklyReflection ? (
                  <div className="space-y-6">
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <div className="font-medium text-lg mb-2">Current Week Insight</div>
                      <div className="text-sm text-muted-foreground mb-1">
                        {formatDate(weeklyReflection.weekStartDate)} - {formatDate(weeklyReflection.weekEndDate)}
                      </div>
                      <div className="text-md mt-3">{weeklyReflection.aiSuggestion}</div>
                      <div className="mt-4 flex gap-2">
                        <Badge variant={
                          weeklyReflection.overallStatus === 'good'
                            ? 'outline'
                            : weeklyReflection.overallStatus === 'warning'
                              ? 'warning'
                              : 'destructive'
                        }>
                          {weeklyReflection.overallStatus === 'good'
                            ? 'On Track'
                            : weeklyReflection.overallStatus === 'warning'
                              ? 'Caution'
                              : 'Attention Needed'}
                        </Badge>
                      </div>
                    </div>

                    {reflectionHistory && reflectionHistory.length > 1 && (
                      <>
                        <div className="font-medium">Previous Insights</div>
                        <ScrollArea className="h-64 rounded-md border">
                          <div className="p-4 space-y-4">
                            {reflectionHistory
                              .filter(r => 
                                r.id !== weeklyReflection.id
                              )
                              .map((reflection) => (
                                <div key={reflection.id} className="pb-4">
                                  <div className="font-medium text-sm">
                                    {formatDate(reflection.weekStartDate)} - {formatDate(reflection.weekEndDate)}
                                  </div>
                                  <div className="text-sm mt-1">{reflection.aiSuggestion}</div>
                                  <Badge className="mt-2" variant={
                                    reflection.overallStatus === 'good'
                                      ? 'outline'
                                      : reflection.overallStatus === 'warning'
                                        ? 'warning'
                                        : 'destructive'
                                  }>
                                    {reflection.overallStatus === 'good'
                                      ? 'On Track'
                                      : reflection.overallStatus === 'warning'
                                        ? 'Caution'
                                        : 'Attention Needed'}
                                  </Badge>
                                  <Separator className="mt-4" />
                                </div>
                              ))}
                          </div>
                        </ScrollArea>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      No spending insights available yet. Set up spending limits and log expenses to get personalized insights.
                    </p>
                    <Button onClick={() => setActiveTab("limits")}>Set Up Spending Limits</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}