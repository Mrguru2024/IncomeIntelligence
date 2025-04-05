import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Goal } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency, formatPercentage } from "@/lib/utils/format";
import { format } from "date-fns";
import { TargetIcon, PiggyBankIcon, TrendingUpIcon, AlertCircleIcon, PlusIcon } from "lucide-react";
import DirectGoalModal from "@/components/DirectGoalModal";
import ExportDataButton from "@/components/ExportDataButton";
import { formatGoalsData } from "@/lib/exportUtils";

export default function Goals() {
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
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
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Financial Goals</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button className="w-full sm:w-auto" disabled>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add New Goal
            </Button>
          </div>
        </div>
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="bg-muted/20 h-24 px-4 py-4" />
              <CardContent className="pt-4 px-4">
                <div className="h-4 bg-muted/40 rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted/40 rounded w-1/2" />
                <div className="h-8 bg-muted/30 rounded mt-4 mb-2" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-16 bg-muted/30 rounded" />
                  <div className="h-16 bg-muted/30 rounded" />
                </div>
              </CardContent>
              <CardFooter className="pt-4 px-4 border-t border-gray-100">
                <div className="w-full">
                  <div className="flex justify-between">
                    <div className="h-4 bg-muted/40 rounded w-1/4" />
                    <div className="h-4 bg-muted/40 rounded w-1/4" />
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Financial Goals</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button className="w-full sm:w-auto" onClick={() => setIsGoalModalOpen(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add New Goal
            </Button>
          </div>
        </div>
        <Alert className="bg-destructive/10 border-destructive text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircleIcon className="h-4 w-4 shrink-0" />
            <AlertDescription>Failed to load goals. Please try again.</AlertDescription>
          </div>
        </Alert>
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Financial Goals</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button className="w-full sm:w-auto" onClick={() => setIsGoalModalOpen(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add New Goal
            </Button>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6 text-center px-4 py-8 sm:py-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-3 rounded-full bg-primary/10 mb-2">
                <TargetIcon className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              </div>
              <h3 className="text-lg font-medium">No goals added yet</h3>
              <p className="text-sm text-muted-foreground max-w-xs sm:max-w-sm mx-auto">
                Track your progress by setting financial goals aligned with your 40/30/30 strategy.
              </p>
              <Button className="mt-2" onClick={() => {
                setIsGoalModalOpen(true);
              }}>Add Your First Goal</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Financial Goals</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button className="w-full sm:w-auto" onClick={() => setIsGoalModalOpen(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add New Goal
          </Button>
          {goals.length > 0 && (
            <ExportDataButton
              data={formatGoalsData(goals)}
              options={{
                title: "Financial Goals Summary",
                subtitle: `Total Goals: ${goals.length}`,
                includeDate: true
              }}
              fileNamePrefix="financial_goals"
            />
          )}
        </div>
      </div>

      {/* Goal Categories */}
      <div className="sticky top-0 z-[50] bg-background shadow-md pb-4 border-b mb-8">
        <h2 className="text-xl font-bold mb-3">Goal Categories</h2>
        <div className="horizontal-scroll scrollbar-none flex gap-2 pb-1">
          <Button
            variant={activeTab === 'all' ? 'default' : 'outline'}
            className={`mb-1 ${activeTab === 'all' ? 'bg-primary text-white' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Goals
          </Button>
          <Button
            variant={activeTab === 'income' ? 'default' : 'outline'}
            className={`mb-1 ${activeTab === 'income' ? 'bg-blue-600 text-white' : ''}`}
            onClick={() => setActiveTab('income')}
          >
            <TargetIcon className="h-4 w-4 mr-1" />
            Income
          </Button>
          <Button
            variant={activeTab === 'savings' ? 'default' : 'outline'}
            className={`mb-1 ${activeTab === 'savings' ? 'bg-emerald-600 text-white' : ''}`}
            onClick={() => setActiveTab('savings')}
          >
            <PiggyBankIcon className="h-4 w-4 mr-1" />
            Savings
          </Button>
          <Button
            variant={activeTab === 'investments' ? 'default' : 'outline'}
            className={`mb-1 ${activeTab === 'investments' ? 'bg-purple-600 text-white' : ''}`}
            onClick={() => setActiveTab('investments')}
          >
            <TrendingUpIcon className="h-4 w-4 mr-1" />
            Investments
          </Button>
        </div>
      </div>
      
      {/* Goal Content */}
      <div className="mt-6">
        {activeTab === 'all' && (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        )}
        
        {activeTab !== 'all' && (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(goalsByType[activeTab] || []).map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
            {!goalsByType[activeTab]?.length && (
              <Card className="col-span-full">
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="flex flex-col items-center py-4">
                    <div className="p-3 rounded-full bg-gray-100 mb-2">
                      {activeTab === 'income' && <TargetIcon className="h-6 w-6 text-gray-400" />}
                      {activeTab === 'savings' && <PiggyBankIcon className="h-6 w-6 text-gray-400" />}
                      {activeTab === 'investments' && <TrendingUpIcon className="h-6 w-6 text-gray-400" />}
                    </div>
                    <p className="text-muted-foreground">No {activeTab} goals found</p>
                    <Button 
                      variant="link" 
                      className="mt-2" 
                      onClick={() => setIsGoalModalOpen(true)}
                    >
                      Add a {activeTab} goal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
      
      {/* Goal Form Modal */}
      {isGoalModalOpen && (
        <DirectGoalModal onClose={() => setIsGoalModalOpen(false)} />
      )}
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
    <Card className={`overflow-hidden h-full ${isCompleted ? 'border-green-300 bg-green-50' : ''}`}>
      <CardHeader className="px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex justify-between items-start gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full ${typeColor.split(' ')[0]}`}>
              {goal.type === 'income' && <TargetIcon className="h-4 w-4 sm:h-5 sm:w-5" />}
              {goal.type === 'savings' && <PiggyBankIcon className="h-4 w-4 sm:h-5 sm:w-5" />}
              {goal.type === 'investments' && <TrendingUpIcon className="h-4 w-4 sm:h-5 sm:w-5" />}
              {!goal.type && <TargetIcon className="h-4 w-4 sm:h-5 sm:w-5" />}
            </div>
            <Badge variant="outline" className={`${typeColor} text-xs sm:text-sm whitespace-nowrap`}>
              {goal.type?.charAt(0).toUpperCase() + goal.type?.slice(1) || 'Other'}
            </Badge>
          </div>
          
          {isCompleted && (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-200 text-xs sm:text-sm whitespace-nowrap">
              Completed
            </Badge>
          )}
        </div>
        <CardTitle className="text-base sm:text-lg md:text-xl mb-1 line-clamp-2">{goal.name}</CardTitle>
        {goal.description && (
          <CardDescription className="text-xs sm:text-sm line-clamp-2">{goal.description}</CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="px-4 sm:px-6 py-2 sm:py-3">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1 items-center">
              <span className="text-xs sm:text-sm font-medium">Progress</span>
              <span className="text-xs sm:text-sm font-medium">{formatPercentage(progress)}</span>
            </div>
            <Progress value={progress} className="h-2.5 sm:h-3" />
          </div>
          
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-gray-50 p-2 sm:p-3 rounded-md">
              <p className="text-xs text-muted-foreground mb-0.5">Current</p>
              <p className="text-sm sm:text-base md:text-lg font-bold">{formatCurrency(goal.currentAmount)}</p>
            </div>
            <div className="bg-gray-50 p-2 sm:p-3 rounded-md">
              <p className="text-xs text-muted-foreground mb-0.5">Target</p>
              <p className="text-sm sm:text-base md:text-lg font-bold">{formatCurrency(goal.targetAmount)}</p>
            </div>
          </div>
        </div>
      </CardContent>
      
      <Separator />
      
      <CardFooter className="px-4 py-3 sm:px-6 sm:py-4 bg-gray-50">
        <div className="w-full">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Started</p>
              <p className="text-xs sm:text-sm font-medium">{format(new Date(goal.startDate), "MMM d, yyyy")}</p>
            </div>
            {goal.deadline && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-0.5">Deadline</p>
                <p className={`text-xs sm:text-sm font-medium ${getDeadlineColor(goal.deadline)}`}>
                  {format(new Date(goal.deadline), "MMM d, yyyy")}
                </p>
              </div>
            )}
          </div>
          {goal.deadline && (
            <div className={`flex items-center mt-2 ${getDeadlineColor(goal.deadline)}`}>
              <p className="text-xs font-medium">
                {getTimeRemaining(goal.deadline)}
              </p>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}