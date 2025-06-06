import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calculator,
  Calendar,
  BarChart,
  PieChart,
  DollarSign,
  ArrowDown,
  ArrowUp,
  Target,
  TrendingUp,
  Settings as SettingsIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import BudgetCalendar from "@/components/BudgetCalendar";
import { Income, Goal } from "@shared/schema";
import { formatCurrency, formatPercentage } from "@/lib/utils/format";
import SafeEnvelope from "@/components/SafeEnvelope"; // Added import
import CashFlowCoach from "@/components/CashFlowCoach"; // Added import
import { useIncomeStore } from "@/hooks/useIncomeStore"; // Import store

export default function BudgetPlanner() {
  const { data: incomes = [] } = useQuery<Income[]>({
    queryKey: ["/api/incomes"],
  });

  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  // Get allocation percentages from the store
  const { needsPercentage, investmentsPercentage, savingsPercentage } =
    useIncomeStore();

  // Calculate total income
  const totalIncome = incomes.reduce(
    (sum, income) => sum + parseFloat(income.amount.toString()),
    0,
  );

  // Calculate budget allocation based on custom percentages
  const needsAllocation = totalIncome * (needsPercentage / 100);
  const savingsAllocation = totalIncome * (savingsPercentage / 100);
  const investmentsAllocation = totalIncome * (investmentsPercentage / 100);

  // Calculate progress toward goals by type
  const incomeGoals = goals.filter((goal) => goal.type === "income");
  const savingsGoals = goals.filter((goal) => goal.type === "savings");
  const investmentGoals = goals.filter((goal) => goal.type === "investments");

  // Helper function to calculate goal progress
  const calculateGoalProgress = (goals: Goal[]) => {
    const totalTarget = goals.reduce(
      (sum, goal) => sum + parseFloat(goal.targetAmount.toString()),
      0,
    );
    const totalCurrent = goals.reduce(
      (sum, goal) => sum + parseFloat(goal.currentAmount.toString()),
      0,
    );

    return {
      target: totalTarget,
      current: totalCurrent,
      percentage: totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0,
    };
  };

  const incomeGoalsProgress = calculateGoalProgress(incomeGoals);
  const savingsGoalsProgress = calculateGoalProgress(savingsGoals);
  const investmentGoalsProgress = calculateGoalProgress(investmentGoals);

  // Calculate upcoming goals (next 30 days)
  const now = new Date();
  const oneMonthLater = new Date();
  oneMonthLater.setDate(now.getDate() + 30);

  const upcomingGoals = goals
    .filter((goal) => {
      if (!goal.deadline) return false;
      const deadline = new Date(goal.deadline);
      return deadline >= now && deadline <= oneMonthLater;
    })
    .sort((a, b) => {
      const dateA = new Date(a.deadline || 0);
      const dateB = new Date(b.deadline || 0);
      return dateA.getTime() - dateB.getTime();
    });

  return (
    <div className="w-full max-w-full overflow-x-hidden px-2 xxs:px-3 sm:px-6 py-3 xxs:py-4 sm:py-6">
      <h1 className="text-xl xxs:text-2xl font-bold mb-4 xxs:mb-6">
        Budget Planner
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 xxs:gap-3 sm:gap-4 mb-4 xxs:mb-6">
        <SafeEnvelope
          category="Groceries"
          allocated={400}
          spent={250}
          total={400}
        />
        <SafeEnvelope
          category="Entertainment"
          allocated={200}
          spent={150}
          total={200}
        />
        <SafeEnvelope
          category="Transportation"
          allocated={300}
          spent={200}
          total={300}
        />
      </div>

      <CashFlowCoach />

      <div className="grid gap-3 sm:gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
          <StatCard
            title="Monthly Budget"
            value={formatCurrency(totalIncome)}
            icon={<DollarSign className="h-5 w-5 text-primary" />}
            color="bg-primary/10"
          />
          <StatCard
            title="Active Goals"
            value={goals.length.toString()}
            icon={<Target className="h-5 w-5 text-blue-600" />}
            color="bg-blue-100"
          />
          <StatCard
            title="Upcoming Deadlines"
            value={upcomingGoals.length.toString()}
            icon={<Calendar className="h-5 w-5 text-purple-600" />}
            color="bg-purple-100"
          />
        </div>

        <Tabs defaultValue="calendar" className="w-full">
          <div className="overflow-x-auto scrollbar-none -mx-2 xxs:-mx-3 px-2 xxs:px-3 pb-1 xxs:pb-2">
            <TabsList className="flex w-full justify-start gap-0.5 xxs:gap-1 max-w-none mb-2 xxs:mb-3 sm:mb-6 min-w-[240px] xxs:min-w-[280px] sm:min-w-[320px] overflow-x-auto">
              <TabsTrigger
                value="calendar"
                className="flex-1 flex items-center justify-center py-1 xxs:py-1.5 px-1 xxs:px-2 sm:p-2 text-[10px] xxs:text-xs sm:text-sm"
              >
                <Calendar className="h-2.5 w-2.5 xxs:h-3 xxs:w-3 sm:h-4 sm:w-4 mr-0.5 xxs:mr-1 sm:mr-2 flex-shrink-0" />
                <span className="truncate">Calendar</span>
              </TabsTrigger>
              <TabsTrigger
                value="allocation"
                className="flex-1 flex items-center justify-center py-1 xxs:py-1.5 px-1 xxs:px-2 sm:p-2 text-[10px] xxs:text-xs sm:text-sm"
              >
                <PieChart className="h-2.5 w-2.5 xxs:h-3 xxs:w-3 sm:h-4 sm:w-4 mr-0.5 xxs:mr-1 sm:mr-2 flex-shrink-0" />
                <span className="truncate">Budget</span>
              </TabsTrigger>
              <TabsTrigger
                value="goals"
                className="flex-1 flex items-center justify-center py-1 xxs:py-1.5 px-1 xxs:px-2 sm:p-2 text-[10px] xxs:text-xs sm:text-sm"
              >
                <BarChart className="h-2.5 w-2.5 xxs:h-3 xxs:w-3 sm:h-4 sm:w-4 mr-0.5 xxs:mr-1 sm:mr-2 flex-shrink-0" />
                <span className="truncate">Goals</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="calendar" className="mt-6">
            <Card>
              <CardContent className="p-0 sm:p-6">
                <BudgetCalendar />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="allocation" className="mt-2 xxs:mt-3 sm:mt-4">
            <div className="flex flex-col xxs:flex-row justify-between items-start xxs:items-center gap-2 xxs:gap-0 mb-2 xxs:mb-3">
              <h3 className="text-xs xxs:text-sm sm:text-base font-medium">
                Allocation Overview
              </h3>
              <Link href="/settings">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[10px] xxs:text-xs flex items-center gap-0.5 xxs:gap-1 py-1 px-1.5 xxs:px-2 h-7 xxs:h-8"
                >
                  <SettingsIcon className="h-2.5 w-2.5 xxs:h-3 xxs:w-3" />
                  Edit Budget Settings
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
              <AllocationCard
                title={`Needs (${needsPercentage}%)`}
                value={formatCurrency(needsAllocation)}
                description="Essential expenses like rent, groceries, utilities"
                color="border-l-4 border-l-blue-500"
                icon={<ArrowDown className="h-4 w-4 text-blue-500" />}
              />
              <AllocationCard
                title={`Savings (${savingsPercentage}%)`}
                value={formatCurrency(savingsAllocation)}
                description="Emergency fund and short-term goals"
                color="border-l-4 border-l-green-500"
                icon={<ArrowUp className="h-4 w-4 text-green-500" />}
              />
              <AllocationCard
                title={`Investments (${investmentsPercentage}%)`}
                value={formatCurrency(investmentsAllocation)}
                description="Long-term wealth building"
                color="border-l-4 border-l-purple-500"
                icon={<TrendingUp className="h-4 w-4 text-purple-500" />}
              />
            </div>
          </TabsContent>

          <TabsContent value="goals" className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <GoalProgressCard
                title="Income Goals"
                current={incomeGoalsProgress.current}
                target={incomeGoalsProgress.target}
                percentage={incomeGoalsProgress.percentage}
                count={incomeGoals.length}
                color=""
              />
              <GoalProgressCard
                title="Savings Goals"
                current={savingsGoalsProgress.current}
                target={savingsGoalsProgress.target}
                percentage={savingsGoalsProgress.percentage}
                count={savingsGoals.length}
                color=""
              />
              <GoalProgressCard
                title="Investment Goals"
                current={investmentGoalsProgress.current}
                target={investmentGoalsProgress.target}
                percentage={investmentGoalsProgress.percentage}
                count={investmentGoals.length}
                color=""
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
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
      <CardContent className="p-2 xs:p-3 sm:p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs xs:text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <p className="text-base xs:text-xl sm:text-2xl font-bold mt-1">
              {value}
            </p>
          </div>
          <div className={`p-1.5 xs:p-2 rounded-full ${color}`}>{icon}</div>
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

function AllocationCard({
  title,
  value,
  description,
  color,
  icon,
}: AllocationCardProps) {
  return (
    <Card className={color}>
      <CardContent className="p-2 xs:p-3 sm:p-4">
        <div className="flex items-center justify-between mb-1 xs:mb-2">
          <h3 className="font-medium text-xs xs:text-sm">{title}</h3>
          <div className="transform scale-75 xs:scale-90 sm:scale-100 origin-right">
            {icon}
          </div>
        </div>
        <p className="text-base xs:text-xl sm:text-2xl font-bold">{value}</p>
        <p className="text-[10px] xs:text-xs sm:text-sm text-muted-foreground mt-1 xs:mt-2 line-clamp-2 xs:line-clamp-none">
          {description}
        </p>
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

function GoalProgressCard({
  title,
  current,
  target,
  percentage,
  count,
  color,
}: GoalProgressCardProps) {
  return (
    <Card className={color}>
      <CardHeader className="px-2 xs:px-3 sm:px-6 py-2 xs:py-3 sm:py-6">
        <CardTitle className="text-sm xs:text-base sm:text-lg">
          {title}
        </CardTitle>
        <CardDescription className="text-xs xs:text-sm">
          {count} {count === 1 ? "goal" : "goals"}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 xs:px-3 sm:px-6 pb-3 xs:pb-4 sm:pb-6">
        <div className="space-y-2 xs:space-y-3">
          <div className="w-full bg-gray-100 rounded-full h-1.5 xs:h-2">
            <div
              className={`bg-primary h-1.5 xs:h-2 rounded-full`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] xs:text-xs sm:text-sm">
            <span>{formatCurrency(current)}</span>
            <span>{formatCurrency(target)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
