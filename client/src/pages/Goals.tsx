import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Goal } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency, formatDate, formatPercentage } from "@/lib/utils/format";
import { TargetIcon, PiggyBankIcon, TrendingUpIcon, AlertCircleIcon, PlusIcon } from "lucide-react";
import SimpleGoalModal from "@/components/SimpleGoalModal";

export default function Goals() {
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  
  const {
    data: goals = [] as Goal[],
    isLoading,
    error
  } = useQuery<Goal[]>({
    queryKey: ['/api/goals'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Group goals by type
  const goalsByType: Record<string, Goal[]> = goals.reduce((acc: Record<string, Goal[]>, goal: Goal) => {
    const type = goal.type || 'other';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(goal);
    return acc;
  }, {});

  // Get icon by goal type
  const getGoalIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <TargetIcon className="h-6 w-6" />;
      case 'savings':
        return <PiggyBankIcon className="h-6 w-6" />;
      case 'investments':
        return <TrendingUpIcon className="h-6 w-6" />;
      default:
        return <TargetIcon className="h-6 w-6" />;
    }
  };

  // Calculate progress percentage
  const calculateProgress = (current: string | number, target: string | number): number => {
    const currentAmount = typeof current === 'string' ? parseFloat(current) : current;
    const targetAmount = typeof target === 'string' ? parseFloat(target) : target;
    
    if (targetAmount <= 0) return 0;
    return Math.min(Math.round((currentAmount / targetAmount) * 100), 100);
  };

  // Get time remaining until deadline
  const getTimeRemaining = (deadline: Date | null): string => {
    if (!deadline) return 'No deadline';
    
    const now = new Date();
    const deadlineDate = new Date(deadline);
    
    if (deadlineDate < now) return 'Past due';
    
    const diffTime = Math.abs(deadlineDate.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day remaining';
    return `${diffDays} days remaining`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Financial Goals</h1>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="bg-muted/20 h-24" />
              <CardContent className="pt-4">
                <div className="h-4 bg-muted/40 rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted/40 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Financial Goals</h1>
        <Alert className="bg-destructive/10 border-destructive text-destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertDescription>Failed to load goals. Please try again.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Financial Goals</h1>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex flex-col items-center space-y-3">
              <TargetIcon className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-medium">No goals added yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Track your progress by setting financial goals aligned with your 40/30/30 strategy.
              </p>
              <Button className="mt-2" onClick={() => {
                console.log("Add Your First Goal button clicked");
                setIsGoalModalOpen(true);
              }}>Add Your First Goal</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Financial Goals</h1>
        <Button onClick={() => setIsGoalModalOpen(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add New Goal
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="all">All Goals</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="savings">Savings</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </TabsContent>

        {['income', 'savings', 'investments'].map((type) => (
          <TabsContent key={type} value={type}>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(goalsByType[type] || []).map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
              {!goalsByType[type]?.length && (
                <Card className="col-span-full">
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">No {type} goals found</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      
      {/* Goal Form Modal */}
      <SimpleGoalModal 
        isOpen={isGoalModalOpen} 
        onClose={() => setIsGoalModalOpen(false)} 
      />
    </div>
  );
}

interface GoalCardProps {
  goal: Goal;
}

function GoalCard({ goal }: GoalCardProps) {
  const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
  const isCompleted = goal.isCompleted || progress >= 100;
  
  const typeColor = {
    income: 'bg-blue-100 text-blue-800',
    savings: 'bg-emerald-100 text-emerald-800',
    investments: 'bg-purple-100 text-purple-800',
  }[goal.type || 'other'] || 'bg-gray-100 text-gray-800';
  
  function getDeadlineColor(deadline: Date | null): string {
    if (!deadline) return 'text-gray-500';
    
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (deadlineDate < now) return 'text-red-500';
    if (diffDays <= 7) return 'text-amber-500';
    return 'text-green-500';
  }

  function calculateProgress(current: string | number, target: string | number): number {
    const currentAmount = typeof current === 'string' ? parseFloat(current) : current;
    const targetAmount = typeof target === 'string' ? parseFloat(target) : target;
    
    if (targetAmount <= 0) return 0;
    return Math.min(Math.round((currentAmount / targetAmount) * 100), 100);
  }

  function getTimeRemaining(deadline: Date | null): string {
    if (!deadline) return 'No deadline';
    
    const now = new Date();
    const deadlineDate = new Date(deadline);
    
    if (deadlineDate < now) return 'Past due';
    
    const diffTime = Math.abs(deadlineDate.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day remaining';
    return `${diffDays} days remaining`;
  }

  return (
    <Card className={`overflow-hidden ${isCompleted ? 'border-green-300 bg-green-50' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-full ${typeColor.split(' ')[0]}`}>
              {goal.type === 'income' && <TargetIcon className="h-5 w-5" />}
              {goal.type === 'savings' && <PiggyBankIcon className="h-5 w-5" />}
              {goal.type === 'investments' && <TrendingUpIcon className="h-5 w-5" />}
              {!goal.type && <TargetIcon className="h-5 w-5" />}
            </div>
            <Badge variant="outline" className={typeColor}>
              {goal.type?.charAt(0).toUpperCase() + goal.type?.slice(1) || 'Other'}
            </Badge>
          </div>
          
          {isCompleted && (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
              Completed
            </Badge>
          )}
        </div>
        <CardTitle className="mt-2">{goal.name}</CardTitle>
        <CardDescription>{goal.description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm font-medium">{formatPercentage(progress)}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Current</p>
              <p className="text-xl font-bold">{formatCurrency(goal.currentAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Target</p>
              <p className="text-xl font-bold">{formatCurrency(goal.targetAmount)}</p>
            </div>
          </div>
        </div>
      </CardContent>
      
      <Separator />
      
      <CardFooter className="pt-4">
        <div className="w-full">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground">Started</p>
              <p className="text-sm">{formatDate(goal.startDate)}</p>
            </div>
            {goal.deadline && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Deadline</p>
                <p className={`text-sm ${getDeadlineColor(goal.deadline)}`}>
                  {formatDate(goal.deadline)}
                </p>
              </div>
            )}
          </div>
          {goal.deadline && (
            <p className={`text-xs mt-2 ${getDeadlineColor(goal.deadline)}`}>
              {getTimeRemaining(goal.deadline)}
            </p>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}