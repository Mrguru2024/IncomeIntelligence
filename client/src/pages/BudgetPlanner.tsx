import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  CalculatorIcon, 
  CalendarIcon, 
  ChartBarIcon, 
  PieChartIcon,
  DollarSignIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  TargetIcon
} from "lucide-react";
import BudgetCalendar from "@/components/BudgetCalendar";
import { Income, Goal } from "@shared/schema";
import { formatCurrency, formatPercentage } from "@/lib/utils/format";

export default function BudgetPlanner() {
  const { data: incomes = [] } = useQuery<Income[]>({
    queryKey: ['/api/incomes'],
  });
  
  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ['/api/goals'],
  });
  
  // Calculate total income
  const totalIncome = incomes.reduce((sum, income) => sum + parseFloat(income.amount.toString()), 0);
  
  // Calculate budget allocation based on 40/30/30 rule
  const needsAllocation = totalIncome * 0.4;
  const savingsAllocation = totalIncome * 0.3;
  const investmentsAllocation = totalIncome * 0.3;
  
  // Calculate progress toward goals by type
  const incomeGoals = goals.filter(goal => goal.type === 'income');
  const savingsGoals = goals.filter(goal => goal.type === 'savings');
  const investmentGoals = goals.filter(goal => goal.type === 'investments');
  
  // Helper function to calculate goal progress
  const calculateGoalProgress = (goals: Goal[]) => {
    const totalTarget = goals.reduce((sum, goal) => sum + parseFloat(goal.targetAmount.toString()), 0);
    const totalCurrent = goals.reduce((sum, goal) => sum + parseFloat(goal.currentAmount.toString()), 0);
    
    return {
      target: totalTarget,
      current: totalCurrent,
      percentage: totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0
    };
  };
  
  const incomeGoalsProgress = calculateGoalProgress(incomeGoals);
  const savingsGoalsProgress = calculateGoalProgress(savingsGoals);
  const investmentGoalsProgress = calculateGoalProgress(investmentGoals);
  
  // Calculate upcoming goals (next 30 days)
  const now = new Date();
  const oneMonthLater = new Date();
  oneMonthLater.setDate(now.getDate() + 30);
  
  const upcomingGoals = goals.filter(goal => {
    if (!goal.deadline) return false;
    const deadline = new Date(goal.deadline);
    return deadline >= now && deadline <= oneMonthLater;
  }).sort((a, b) => {
    const dateA = new Date(a.deadline || 0);
    const dateB = new Date(b.deadline || 0);
    return dateA.getTime() - dateB.getTime();
  });
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Budget Planner</h1>
      
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <StatCard 
          title="Monthly Income" 
          value={formatCurrency(totalIncome)}
          icon={<DollarSignIcon className="h-5 w-5" />}
          color="bg-green-100 text-green-800"
        />
        <StatCard 
          title="Goals in Progress" 
          value={goals.length.toString()}
          icon={<TargetIcon className="h-5 w-5" />}
          color="bg-blue-100 text-blue-800"
        />
        <StatCard 
          title="Upcoming Deadlines" 
          value={upcomingGoals.length.toString()}
          icon={<CalendarIcon className="h-5 w-5" />}
          color="bg-purple-100 text-purple-800"
        />
      </div>
      
      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Calendar View
          </TabsTrigger>
          <TabsTrigger value="allocation">
            <PieChartIcon className="h-4 w-4 mr-2" />
            Budget Allocation
          </TabsTrigger>
          <TabsTrigger value="goals">
            <ChartBarIcon className="h-4 w-4 mr-2" />
            Goals Progress
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="space-y-4">
          <BudgetCalendar />
        </TabsContent>
        
        <TabsContent value="allocation" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <AllocationCard 
              title="Needs (40%)" 
              value={formatCurrency(needsAllocation)}
              description="Essential expenses (rent, groceries, utilities, transportation)"
              color="bg-blue-50 border-blue-200"
              icon={<ArrowDownIcon className="h-5 w-5 text-blue-600" />}
            />
            <AllocationCard 
              title="Savings (30%)" 
              value={formatCurrency(savingsAllocation)}
              description="Emergency fund, short-term savings goals"
              color="bg-emerald-50 border-emerald-200"
              icon={<ArrowUpIcon className="h-5 w-5 text-emerald-600" />}
            />
            <AllocationCard 
              title="Investments (30%)" 
              value={formatCurrency(investmentsAllocation)}
              description="Retirement, long-term wealth building"
              color="bg-purple-50 border-purple-200"
              icon={<ChartBarIcon className="h-5 w-5 text-purple-600" />}
            />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Budget Allocation Calculator</CardTitle>
              <CardDescription>
                Use this calculator to determine your optimal budget allocation based on your income.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Income Breakdown</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Monthly Income:</span>
                      <span className="font-medium">{formatCurrency(totalIncome)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Needs (40%):</span>
                      <span className="font-medium">{formatCurrency(needsAllocation)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Savings (30%):</span>
                      <span className="font-medium">{formatCurrency(savingsAllocation)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Investments (30%):</span>
                      <span className="font-medium">{formatCurrency(investmentsAllocation)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Weekly Budget</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Weekly Income:</span>
                      <span className="font-medium">{formatCurrency(totalIncome / 4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Weekly Needs:</span>
                      <span className="font-medium">{formatCurrency(needsAllocation / 4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Weekly Savings:</span>
                      <span className="font-medium">{formatCurrency(savingsAllocation / 4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Weekly Investments:</span>
                      <span className="font-medium">{formatCurrency(investmentsAllocation / 4)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="goals" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <GoalProgressCard 
              title="Income Goals" 
              current={incomeGoalsProgress.current}
              target={incomeGoalsProgress.target}
              percentage={incomeGoalsProgress.percentage}
              count={incomeGoals.length}
              color="bg-blue-50"
            />
            <GoalProgressCard 
              title="Savings Goals" 
              current={savingsGoalsProgress.current}
              target={savingsGoalsProgress.target}
              percentage={savingsGoalsProgress.percentage}
              count={savingsGoals.length}
              color="bg-emerald-50"
            />
            <GoalProgressCard 
              title="Investment Goals" 
              current={investmentGoalsProgress.current}
              target={investmentGoalsProgress.target}
              percentage={investmentGoalsProgress.percentage}
              count={investmentGoals.length}
              color="bg-purple-50"
            />
          </div>
          
          {upcomingGoals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Goal Deadlines</CardTitle>
                <CardDescription>
                  Goals with deadlines in the next 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingGoals.map(goal => {
                    const progress = parseFloat(goal.targetAmount.toString()) > 0 
                      ? (parseFloat(goal.currentAmount.toString()) / parseFloat(goal.targetAmount.toString())) * 100
                      : 0;
                    
                    const remaining = parseFloat(goal.targetAmount.toString()) - parseFloat(goal.currentAmount.toString());
                    
                    return (
                      <div key={goal.id} className="border rounded-md p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{goal.name}</h3>
                            <p className="text-sm text-muted-foreground">{goal.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              Deadline: {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'No deadline'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {remaining > 0 ? `${formatCurrency(remaining)} remaining` : 'Completed'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>{formatCurrency(goal.currentAmount)}</span>
                            <span>{formatPercentage(progress)}</span>
                            <span>{formatCurrency(goal.targetAmount)}</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface AllocationCardProps {
  title: string;
  value: string;
  description: string;
  color: string;
  icon: React.ReactNode;
}

function AllocationCard({ title, value, description, color, icon }: AllocationCardProps) {
  return (
    <Card className={`border ${color}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="p-2 rounded-full bg-white border">
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        <CardDescription className="mt-1">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}

interface GoalProgressCardProps {
  title: string;
  current: number;
  target: number;
  percentage: number;
  count: number;
  color: string;
}

function GoalProgressCard({ title, current, target, percentage, count, color }: GoalProgressCardProps) {
  return (
    <Card className={color}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>
          {count} {count === 1 ? 'goal' : 'goals'} in progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{formatPercentage(percentage)}</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>
          
          <div className="flex justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Current</p>
              <p className="font-bold">{formatCurrency(current)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Target</p>
              <p className="font-bold">{formatCurrency(target)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}